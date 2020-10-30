import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormArray, ValidationErrors} from "@angular/forms";
import {UserService} from "../service/user.service";
import {PhoneService} from "../service/phone.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserModel} from "../model/user.model";
import {PhoneModel} from "../model/phone.model";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  formGroup = this.createFormGroup();
  newPhoneRowVisible = false;
  addPhoneMessageVisible = false;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private phoneService: PhoneService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.addPhoneMessageVisible = false;
    this.activatedRoute.paramMap.subscribe(params => {
      const userId = params.get("userId");
      if(params) {
        this.loadUser(userId);
      }
      if(userId) {} else { this.showPhoneForm(); }
    })
  }

  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      userId: null,
      firstName: null,
      lastName: null,
      username: null,
      phones: this.formBuilder.array([]),
      newPhone: this.formBuilder.group({
        phoneId: null,
        userId: null,
        phoneNumber: null,
        primaryPhone: null,
        verified: null,
        verificationCode: null,
        time: null,
      })
    });
  }

  private addPhone(phone: PhoneModel): FormGroup {
    return this.formBuilder.group({
      phoneId: phone.phoneId,
      userId: phone.userId,
      phoneNumber: phone.phoneNumber,
      primaryPhone: phone.primaryPhone,
      verified: phone.verified,
      verificationCode: phone.verificationCode,
      time: phone.time
    });
  }

  get firstNameControl(): FormControl {
    return this.formGroup.get("firstName") as FormControl;
  }

  get lastNameControl(): FormControl {
    return this.formGroup.get("lastName") as FormControl;
  }

  get usernameControl(): FormControl {
    return this.formGroup.get("username") as FormControl;
  }

  get userIdControl(): FormControl {
    return this.formGroup.get("userId") as FormControl;
  }

  get phonesControl(): FormArray {
    return (<FormArray>this.formGroup.get("phones") as FormArray);
  }

  get newPhoneFormGroup(): FormGroup {
    return (<FormGroup>this.formGroup.get("newPhone") as FormGroup);
  }

  get newPhoneNumberControl(): FormControl {
    return (this.formGroup.get("newPhone").get("phoneNumber") as FormControl);
  }

  get newPhonePrimaryControl(): FormControl {
      return (this.formGroup.get("newPhone").get("primaryPhone") as FormControl);
    }

  get newPhoneNumberErrors(): any {
    return this.newPhoneNumberControl.errors
  }

  get newPhoneErrorMessages() : any {
    if(this.newPhoneNumberControl.errors) {
      if(this.newPhoneNumberControl.errors.pattern) {
        this.changeFormatError();
        return this.newPhoneNumberControl.errors.pattern.requiredPattern;
      }
      return this.newPhoneNumberControl.errors;
    }
    return null;
  }


// CRUD and Use Case methods
//---------------------------

  private loadUser(userId: string) {
    this.userService.get(userId).subscribe(user => {
      this.formGroup.patchValue(user);
      this.loadPhones(user.userId);
    });
  }

  private loadPhones(userId: string) {
    if(userId) {
      this.phoneService.findUserPhones(userId).subscribe(phones => {
        for(let i = 0; i < phones.length; i++) {
            if((<FormArray>this.formGroup.get("phones")).at(i) == null){
               (<FormArray>this.formGroup.get("phones")).push(this.addPhone(phones[i]));
            }
        }
      });
    }
  }

  save() {

    if(this.newPhoneNumberControl && this.newPhoneNumberControl.value != null) {
      this.addPhoneMessageVisible = true;
      return
      //this.addNewPhone();
    }
    if(this.newPhoneNumberControl.errors){
          return;
    }
    const valueToSave = this.formGroup.value as UserModel;
    this.userService.save(valueToSave).subscribe((savedValue) => {
      this.router.navigateByUrl("users");
    }, httpError => {
      if (httpError.status === 400) {
        Object.keys(httpError.error).forEach(key => {
          if(this.formGroup.get(key)){
            //for user errors
            this.formGroup.get(key).setErrors(httpError.error[key]);
          } else {
            //for user.phones[] errors
           for(var i = 0; i < this.formGroup.get("phones").value.length; i++) {
              if(key.includes(i+"") && key.includes("phoneNumber")) {
                this.phonesControl.controls[i].setErrors(httpError.error[key]);
              }
            }
          }
        });
      } else {
        console.log("oh no something horrible went awry saving user");
      }
    })
  }

  cancel() {
    if(this.formGroup.dirty){
      //console.log("dirty");
      this.openCancelUserChangesModal("");
    } else {
      this.router.navigateByUrl("users");
    }
  }

  verifyPhone(index: number) {
    var phone = this.formGroup.get("phones").value[index] as PhoneModel;
    this.openPhoneVerificationModal(phone);
  }

  deletePhone(phone: FormGroup) {
    if(phone) {
      var valueToDelete = phone.value as PhoneModel;
      this.phoneService.delete(valueToDelete).subscribe((deleted) => {
        this.formGroup = this.createFormGroup();
        this.loadUser(valueToDelete.userId);
        }, httpError => {
          if(httpError.status === 400) {

          } else {
            console.log("oh no something horrible went awry deleting phone");
          }

          });
      }
  }

  addNewPhone() {
    var valueToSave = this.formGroup.get("newPhone").value as PhoneModel;
    valueToSave.userId = this.formGroup.get("userId").value as string;
    valueToSave.primaryPhone = this.formGroup.get("newPhone").value.primaryPhone === true ? true : false;

    if(this.newPhoneNumberControl.errors) {
      return;
    }

    if(valueToSave.userId) {
        this.phoneService.save(valueToSave, valueToSave.userId).subscribe((phone) => {
          this.newPhoneRowVisible = false;
          if(valueToSave.primaryPhone === true) {
            //console.log("makePrimary call now");
            this.makePrimary(phone);
          }
          this.formGroup.get("newPhone").reset();
          this.loadPhones(this.formGroup.get("userId").value);
          }, httpError => {
            if(httpError.status === 400) {
              Object.keys(httpError.error).forEach(key => {
                this.newPhoneFormGroup.get(key).setErrors(httpError.error[key]);
              })
            } else {
                console.log("oh no something horrible went awry saving the phone");
            }
          });
      } else {
        //add to user phone list since user doesn't exist yet
        if(!this.newPhoneNumberErrors) {
          if(!this.containsDuplicates(valueToSave.phoneNumber)){
            this.phonesControl.push(this.addPhone(valueToSave));
            this.newPhoneRowVisible = false;
            this.formGroup.get("newPhone").reset();
          }
        }
      }
  }

  containsDuplicates(phoneNumber: string): boolean{
    for(var i = 0; i < this.phonesControl.value.length; i++){
      if(this.phonesControl.value[i].phoneNumber === phoneNumber) {
        return true;
      }
    }
    return false;
  }

  cancelPhone() {
    this.newPhoneRowVisible = false;
    this.formGroup.get("newPhone").reset();
  }


  makePrimary(phone: PhoneModel) {
    //console.log("right before subscribe: ", phone)
    this.phoneService.makePrimary(phone).subscribe((newPrimaryPhone) => {
      //console.log(newPrimaryPhone);
    }, httpError => {
      if(httpError.status === 400) {
        //console.log(httpError.error)
      } else {
        console.log("oh no something horrible went awry making the phone primary");
      }
    });
  }

  openPhoneVerificationModal(phone: PhoneModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      title: "Phone Number Verification",
      phone: phone,
      cancel: null
    };
    this.phoneService.sendVerification(phone).subscribe();
    const dialogRef = this.dialog.open(ModalDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((data) => {
      if(data) {
        const userId = this.formGroup.get("userId").value as string;
        this.formGroup.reset();
        this.loadUser(userId);
      }
    });
  }

  openCancelUserChangesModal(description: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 2,
      title: "Cancel Changes",
      phone: null,
      cancel: description
    };
    const dialogRef = this.dialog.open(ModalDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((data) => {
      if(data) {
        this.router.navigateByUrl("users");
      }
    });
  }



// Visibility and UI utility methods
//----------------------------------

   userExists() {
     if(this.formGroup.get("userId").value){
       return true;
     }
     return false;
   }

 checkVerified(index: number) {
   var phone = this.formGroup.get("phones").value[index] as PhoneModel;
   if(phone){
     if(phone.verified === true){
       return true;
     } else {
       return false;
     }
   }
 }

  isPrimaryPhone(index: number) {
  const phoneToCheck = this.phonesControl.at(index).value.primaryPhone;
    if(phoneToCheck) {
      return phoneToCheck === true ? true : false;
    } else {
      return false;
    }
  }

  isFirstPhone() {
    if(this.formGroup.get("phones").value.length == 0) {
      this.formGroup.get("newPhone").value.primaryPhone = true
      return true;
    } else {
      return false;
    }
  }

  phoneHeadersVisible() {
    if(this.formGroup.get("phones").value && this.formGroup.get("phones").value.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  showPhoneForm() {
    this.newPhoneRowVisible = true;
    this.isFirstPhone();
  }

  primaryCheckboxChange() {
    this.formGroup.get("newPhone").value.primaryPhone = !this.formGroup.get("newPhone").value.primaryPhone;
  }

  changeFormatError() {
    if(this.newPhoneNumberControl. errors && this.newPhoneNumberControl.errors.pattern) {
      this.newPhoneNumberControl.errors.pattern.requiredPattern = "Incorrect format. Enter 10 digits.\n Auto formats to: (XXX)123-4567";
    }
  }

  onKeyUp($event){
    if($event.code !== "Backspace") {
      this.formatPhoneNumber();
    }
  }

  //is there already an algorithm for this? is this too brute-force?
  formatPhoneNumber() {
    //for copy-paste a number
    if(this.newPhoneNumberControl.value) {
      var checkNumber = this.newPhoneNumberControl.value;
      if(checkNumber.length == 10 && !checkNumber.includes("(")
            && !checkNumber.includes(")") && !checkNumber.includes("-")) {
         var areaCode = <string>"(" + this.newPhoneNumberControl.value.substring(0,3) + ")";
         var officeCode = <string>this.newPhoneNumberControl.value.substring(3, 6) + "-";
         var digitStationCode = <string>this.newPhoneNumberControl.value.substring(6, 10);
         this.newPhoneNumberControl.patchValue(areaCode + officeCode + digitStationCode)
         return;
      }
      if(this.newPhoneNumberControl.value.length == 3) {
        var areaCode = <string>"(" + this.newPhoneNumberControl.value.replace(/\D/g, '') + ")";
        this.newPhoneNumberControl.patchValue(areaCode);
      }
      if(this.newPhoneNumberControl.value.length == 8 && this.newPhoneNumberControl.value.includes("(")
           && this.newPhoneNumberControl.value.includes(")")) {
        var areaCode = <string>this.newPhoneNumberControl.value.substring(0, 5);
        var officeCode = <string>this.newPhoneNumberControl.value.substring(5, 9) + "-";
        this.newPhoneNumberControl.patchValue(areaCode + officeCode);
      }
      if(this.newPhoneNumberControl.value.length == 13) {
        var areaCode = <string>this.newPhoneNumberControl.value.substring(0, 5);
        var officeCode = <string>this.newPhoneNumberControl.value.substring(5, 10);
        var digitStationCode = <string>this.newPhoneNumberControl.value.substring(10, 13);
        this.newPhoneNumberControl.patchValue(areaCode + officeCode + digitStationCode);
      }
    }
  }

  changePrimary(index: number) {
    for(var i = 0; i < this.phonesControl.value.length; i++){
          var phone = this.phonesControl.value[i] as PhoneModel;
          if(i === index){
            phone.primaryPhone = true;
          } else {
            phone.primaryPhone = false;
          }
        }
  }
}
