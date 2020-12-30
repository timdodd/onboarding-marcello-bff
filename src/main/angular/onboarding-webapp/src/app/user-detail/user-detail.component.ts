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
    })
  }

  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      userId: null,
      firstName: null,
      lastName: null,
      username: null,
      email: null,
      phones: this.formBuilder.array([]),
    });
  }

  //createPhoneFormGroup
  private createPhoneFormGroup(phone: PhoneModel): FormGroup {
    return this.formBuilder.group({
      phoneId: phone ? phone.phoneId : null,
      userId: this.formGroup.get("userId").value ? this.formGroup.get("userId").value : null,
      phoneNumber: phone ? phone.phoneNumber : null,
      primaryPhone: phone ? phone.primaryPhone : false,
      verified: phone ? phone.verified : false,
      verificationCode: phone ? phone.verificationCode : null,
      time: phone ? phone.time : null
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

  get emailControl(): FormControl {
    return this.formGroup.get("email") as FormControl;
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

  private get phonesFormArray(): FormArray {
    return this.formGroup.get("phones") as FormArray;
  }

  get phonesFormArrayControls(): FormControl[] {
    return (this.phonesFormArray.controls) as FormControl[];
  }

  private loadUser(userId: string) {
    this.userService.get(userId).subscribe(user => {
      this.formGroup.patchValue(user);
      if(user){
        this.loadPhones(user.userId);
      }
    });
  }

  private loadPhones(userId: string) {
    //keep getting empty field duplicates of this in the controls without this
    while(this.phonesFormArray.length > 0){
      this.phonesFormArray.removeAt(0)
    }
    if(userId) {
      this.phonesFormArray.reset();
      this.phoneService.findUserPhones(userId).subscribe(phones => {
        phones.forEach(phone => {
          const phoneFormGroup = this.createPhoneFormGroup(phone);
          this.phonesFormArray.controls.push(phoneFormGroup);
        });
      });
    }
  }

  save() {
    this.formGroup.get("phones").patchValue(this.phonesFormArrayControls);
    this.userService.save((this.formGroup.value as UserModel)).subscribe((savedValue) => {
      savedValue.phones.forEach(phone => {
        if(phone.primaryPhone === true){
          this.makePrimary(phone);
        }
      })
      this.router.navigateByUrl("users");
    }, httpError => {
      if (httpError.status === 400) {
        Object.keys(httpError.error).forEach(key => {
          if(this.formGroup.get(key)){
            //for user errors
            this.formGroup.get(key).setErrors(httpError.error[key]);
          } else {
            //setting user.phones[] errors
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
      this.openConfirmCancelChangesModal("Changes have been made to the form. Continue?", "Confirm cancel");
    } else {
      this.router.navigateByUrl("users");
    }
  }

  verifyPhone(phone: FormGroup) {
      if(phone && phone.value.phoneId){
        this.openPhoneVerificationModal((phone.value as PhoneModel));
      }
  }

  deletePhone(index: number) {
    this.phonesFormArray.removeAt(index);
  }

  addNewPhone() {
    this.phonesFormArray.controls.push(this.createPhoneFormGroup(null));
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

  primaryRadioButtonClick(phone: FormGroup) {
    for(var i = 0; i < this.phonesFormArrayControls.length; i++) {
      if(this.phonesFormArrayControls[i].value.phoneNumber !== phone.value.phoneNumber) {
        this.phonesFormArrayControls[i].get("primaryPhone").patchValue(false);
      }
      else {this.phonesFormArrayControls[i].get("primaryPhone").patchValue(true);}
    }
  }

  resetVerifiedOnChange(phone: FormGroup, index: number) {
    if(!phone.errors) {
      if(phone.value.verified === true) {
        this.phonesFormArrayControls[index].get("verified").patchValue(false);
      }
    }
  }

}
