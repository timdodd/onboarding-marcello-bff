import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormArray, ValidationErrors} from "@angular/forms";
import {UserService} from "../service/user.service";
import {PhoneService} from "../service/phone.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserModel} from "../model/user.model";
import {PhoneModel} from "../model/phone.model";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { VerifyPhoneDialogComponent } from '../verify-phone-dialog/verify-phone-dialog.component';
import { UserConfirmDialogComponent } from '../user-confirm-dialog/user-confirm-dialog.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  formGroup = this.createFormGroup();
  newPhoneRowVisible = false;
  initialPhonesLength: number;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private phoneService: PhoneService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
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
      this.initialPhonesLength = user.phones ? user.phones.length : 0;
    });
  }

  private loadPhones(userId: string) {
    if(userId) {
      while(this.phonesControl.length > 0) {
        this.phonesControl.removeAt(0);
      }
      this.phoneService.findUserPhones(userId).subscribe(phones => {
        if(phones.length > 0){
          if((<FormArray>this.formGroup.get("phones")).at(0) == null) {
            (<FormArray>this.formGroup.get("phones")).push(this.addPhone(phones.find(x => x.primaryPhone === true)));
          }
          var i = (<FormArray>this.formGroup.get("phones")).value.length;
          phones.filter(x => x.primaryPhone !== true).forEach(phone => {
            if((<FormArray>this.formGroup.get("phones")).at(i) == null) {
              (<FormArray>this.formGroup.get("phones")).push(this.addPhone(phone));
              i++;
            }
          });
        }
      }, httpError => {

      });
    }
  }

  save() {
    var toMakePrimary: string;
    if(this.newPhoneNumberControl && this.newPhoneNumberControl.value != null) {
      if(this.newPhonePrimaryControl && this.formGroup.get("newPhone").value.primaryPhone === true) {
        toMakePrimary = this.newPhoneNumberControl.value;
      }
      this.addNewPhone();
    } else {
      var newPrimaryPhonesLength = this.phonesControl.value
            .filter(x => x.phoneId === null && x.primaryPhone === true)
            .length;
      if(newPrimaryPhonesLength > 0) {
        toMakePrimary = this.phonesControl.value
            .filter(x => x.phoneId === null && x.primaryPhone === true)[newPrimaryPhonesLength - 1]
            .phoneNumber;
      }
    }
    if(toMakePrimary) {
      var index = this.phonesControl.value.findIndex(x => x.phoneNumber === toMakePrimary);
      this.changePrimary(index);
    }
    //save the user
    const valueToSave = this.formGroup.value as UserModel;
    this.userService.save(valueToSave).subscribe((savedValue) => {
      if(toMakePrimary) {
        this.makePrimary(savedValue.phones.find(x => x.phoneNumber === toMakePrimary));
      }
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
    if(this.formGroup.dirty || this.newPhoneNumberControl.value != null
        || this.phonesControl.value.length != this.initialPhonesLength){
      this.openConfirmCancelChangesModal("Changes have been made to the form. Continue?", "Confirm cancel");
    } else {
      this.router.navigateByUrl("users");
    }
  }

  verifyPhone(index: number) {
    var phone = this.formGroup.get("phones").value[index] as PhoneModel;
    if(phone && phone.phoneId) {
      this.openPhoneVerificationModal(phone);
    }
  }

  deletePhone(phone: FormGroup) {
    if(phone && phone.get("phoneId").value) {
      var valueToDelete = phone.value as PhoneModel;
      this.phoneService.delete(valueToDelete).subscribe((deleted) => {
        this.loadUser(valueToDelete.userId);
        }, httpError => {
          if(httpError.status === 400) {

          } else {
            console.log("oh no something horrible went awry deleting phone");
          }

      });
    } else {
      this.phonesControl.removeAt(this.phonesControl.value.findIndex(x => x.phoneNumber === phone.get("phoneNumber").value));
      this.loadUser(this.formGroup.get("userId").value);
    }
  }

addNewPhone() {
//  if(this.newPhoneNumberControl.errors) {
//       return;
//  }
  var valueToAdd = this.formGroup.get("newPhone").value as PhoneModel;
  valueToAdd.userId = this.formGroup.get("userId").value as string;
  valueToAdd.primaryPhone = this.formGroup.get("newPhone").value.primaryPhone === true ? true : false;
  if(!this.newPhoneNumberErrors) {
    this.phonesControl.push(this.addPhone(valueToAdd));
    this.newPhoneRowVisible = false;
    this.formGroup.get("newPhone").reset();
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
    this.phoneService.makePrimary(phone).subscribe((newPrimaryPhone) => {
    }, httpError => {
      if(httpError.status === 400) {
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
    const dialogRef = this.dialog.open(VerifyPhoneDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((data) => {
      if(data) {
        const userId = this.formGroup.get("userId").value as string;
        this.formGroup.reset();
        this.loadUser(userId);
      }
    });
  }

  openConfirmCancelChangesModal(description: string, dialogTitle: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      title: dialogTitle,
      description: description
    };
    const dialogRef = this.dialog.open(UserConfirmDialogComponent, dialogConfig);
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

  phoneIdExists(index: number) {
    var phone = this.formGroup.get("phones").value[index] as PhoneModel;
    if(phone.phoneId) {
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
    if(!this.formGroup.get("newPhone").value.primaryPhone) {
      this.formGroup.get("newPhone").value.primaryPhone = false;
    }
  }

  changeFormatError() {
    if(this.newPhoneNumberControl.errors && this.newPhoneNumberControl.errors.pattern) {
      this.newPhoneNumberControl.errors.pattern.requiredPattern = "Incorrect format. Enter 10 digits.\n Auto formats to: (XXX)123-4567";
    }
  }

  onKeyUp($event, control: FormControl){
    if($event.code !== "Backspace") {
      this.formatPhoneNumber(control);
    }
  }

    //is there already an algorithm for this? is this too brute-force?
    formatPhoneNumber(control: FormControl) {
      //for copy-pasting a number
      if(control.value) {
        var checkNumber = control.value;
        if(checkNumber.length == 10 && !checkNumber.includes("(")
              && !checkNumber.includes(")") && !checkNumber.includes("-")) {
           var areaCode = <string>"(" + control.value.substring(0,3) + ")";
           var officeCode = <string>control.value.substring(3, 6) + "-";
           var digitStationCode = <string>control.value.substring(6, 10);
           control.patchValue(areaCode + officeCode + digitStationCode)
           return;
        }
        if(control.value.length == 3) {
          var areaCode = <string>"(" + control.value.replace(/\D/g, '') + ")";
          control.patchValue(areaCode);
        }
        if(control.value.length == 8 && control.value.includes("(")
             && control.value.includes(")")) {
          var areaCode = <string>control.value.substring(0, 5);
          var officeCode = <string>control.value.substring(5, 9) + "-";
          control.patchValue(areaCode + officeCode);
        }
        if(control.value.length == 13) {
          var areaCode = <string>control.value.substring(0, 5);
          var officeCode = <string>control.value.substring(5, 10);
          var digitStationCode = <string>control.value.substring(10, 13);
          control.patchValue(areaCode + officeCode + digitStationCode);
        }
      }
    }

  changePrimary(index: number) {
    this.phonesControl.value.forEach(phone => {
      phone.primaryPhone = false;
    })
    if(index >= 0) {
      this.phonesControl.at(index).value.primaryPhone = true;
    }
  }
}
