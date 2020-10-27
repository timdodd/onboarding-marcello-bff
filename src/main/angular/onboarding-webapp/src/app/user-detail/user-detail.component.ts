import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormArray} from "@angular/forms";
import {UserService} from "../service/user.service";
import {PhoneService} from "../service/phone.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserModel} from "../model/user.model";
import {PhoneModel} from "../model/phone.model";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { VerifyDialogComponent } from '../verify-dialog/verify-dialog.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  formGroup = this.createFormGroup();
  newPhoneRowVisible = false;
  verifyDialog: VerifyDialogComponent;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private phoneService: PhoneService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private dialog: MatDialog) {
  }

  openModal(phone: PhoneModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
    id: 1,
    title: "Phone Number Verification",
    phone: phone
  };
  //console.log(dialogConfig);
  //console.log(this.dialog);

  this.dialog.open(VerifyDialogComponent, dialogConfig);
}


  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const userId = params.get("userId");
      if(params) {
        this.loadUser(userId);
//         if(userId) {
//           this.loadPhones(userId);
//         }
      }
      if(userId) {} else { this.showPhoneForm(); }

    })

  }

  private loadUser(userId: string) {
    this.userService.get(userId).subscribe(user => {
      this.formGroup.patchValue(user);
      if(user.phones) {
        for(let i = 0; i < user.phones.length; i++) {
            if((<FormArray>this.formGroup.get("phones")).at(i) == null && user.phones[i] != null){
               (<FormArray>this.formGroup.get("phones")).push(this.addPhone(user.phones[i]));
            }
        }
      }
    });
  }

  private loadPhones(userId: string) {
  if(userId) {
  //console.log("before load: ", this.phonesControl);
    this.phoneService.findUserPhones(userId).subscribe(phones => {
      for(let i = 0; i < phones.length; i++) {
          if((<FormArray>this.formGroup.get("phones")).at(i) == null){
             (<FormArray>this.formGroup.get("phones")).push(this.addPhone(phones[i]));
          }
      }
    });
  }
  }

//took a while to get right
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

  save() {
    const valueToSave = this.formGroup.value as UserModel;
    this.userService.save(valueToSave).subscribe((savedValue) => {
      this.router.navigateByUrl("users");
    }, httpError => {
      if (httpError.status === 400) {
        Object.keys(httpError.error).forEach(key => {
          this.formGroup.get(key).setErrors(httpError.error[key]);
        });
      } else {
        console.log("oh no something horrible went awry saving user");
      }
    })
  }

//   savePhones(userId: string) {
//
//     var valuesToSave = this.formGroup.get("phones").value as PhoneModel[];
//     valuesToSave.forEach(phone => phone.userId = userId);
//     console.log(this.formGroup.get("phones").value);
//
// //     for(var i = 0; i < valuesToSave.length; i++) {
// //     console.log(valuesToSave[i]);
// //
// //      this.phoneService.save(valuesToSave[i], valuesToSave[i].userId).subscribe((savedValue) => {
// //             //this.router.navigateByUrl("users");
// //      }, httpError => {
// //        if (httpError.status === 400) {
// //          Object.keys(httpError.error).forEach(key => {
// //            console.log(this.formGroup.get("phones"))
// //            this.formGroup.get("phones").get(key).setErrors(httpError.error[key]);
// //          });
// //        } else {
// //          console.log("oh no something horrible went awry saving phones");
// //        }
// //      })
// //
// //     }
//     valuesToSave.forEach(phone => {
//       console.log("phoneModel", phone);
//
//       this.phoneService.save(phone, phone.userId).subscribe((savedValue) => {
//         //this.router.navigateByUrl("users");
//       }, httpError => {
//         if (httpError.status === 400) {
//           Object.keys(httpError.error).forEach(key => {
//             this.formGroup.get("phones").get(key).setErrors(httpError.error[key]);
//           });
//         } else {
//           console.log("oh no something horrible went awry saving phones");
//         }
//       })
//
//     })
//
//   }


  cancel() {
    this.router.navigateByUrl("users");
  }

  checkVerified(verify: any) {
    if(verify === true){
      return true;
    } else {
      return false;
    }
  }

  verifyPhone(index: number) {
    var phone = this.formGroup.get("phones").value[index] as PhoneModel;
    this.openModal(phone);
  }

  deletePhone(phone: FormGroup) {
    if(phone) {
      var valueToDelete = phone.value as PhoneModel;
      //console.log(valueToDelete);
      this.phoneService.delete(valueToDelete).subscribe((deleted) => {
        //console.log(valueToDelete);
        this.formGroup = this.createFormGroup();
        this.loadUser(valueToDelete.userId);
        }, httpError => {

          });
      }
  }

  isPrimaryPhone(index: number) {
  const phoneToCheck = this.phonesControl.at(index).value.primaryPhone;
  //console.log("primary for phone " + index + " is " + phoneToCheck);
    if(phoneToCheck) {
      return phoneToCheck === true ? true : false;
    } else {
      return false;
    }
  }

  isFirstPhone() {
    if(this.formGroup.get("userId").value === null || this.formGroup.get("phones").value.length == 0) {
      this.formGroup.get("newPhone").value.primaryPhone = true
      //console.log(this.formGroup.get("newPhone").value.primaryPhone);
      //console.log(this.formGroup.get("newPhone").value);
      return true;
    } else {
      //this.formGroup.get("newPhone").value.primaryPhone = false
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

  addNewPhone() {
    var valueToSave = this.formGroup.get("newPhone").value as PhoneModel;
    valueToSave.userId = this.formGroup.get("userId").value as string;
    valueToSave.primaryPhone = this.formGroup.get("newPhone").value.primaryPhone === true ? true : false;

    //console.log(this.newPhonePrimaryControl);

    //console.log("The phone to be created: " + valueToSave.userId + " " + valueToSave.phoneNumber + " " + valueToSave.primaryPhone);
    if(valueToSave.userId) {
        this.phoneService.save(valueToSave, valueToSave.userId).subscribe((phone) => {
          this.newPhoneRowVisible = false;
          if(valueToSave.primaryPhone === true) {
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
        this.phonesControl.push(this.addPhone(valueToSave));
        this.newPhoneRowVisible = false;
        this.formGroup.get("newPhone").reset();
      }
  }

  changePrimary(index: number) {
    //this.makePrimary(this.phonesControl.value[index] as PhoneModel);
    for(var i = 0; i < this.phonesControl.value.length; i++){
          var phone = this.phonesControl.value[i] as PhoneModel;
          if(i === index){
            phone.primaryPhone = true;
          } else {
            phone.primaryPhone = false;
          }
        }
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


}
