import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {PhoneModel} from "../model/phone.model";
import {FormBuilder, FormControl, FormGroup, FormArray} from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";
import {PhoneService} from "../service/phone.service";
import {PhoneVerificationModel} from "../model/phoneVerification.model";

@Component({
  selector: 'app-verify-phone-dialog',
  templateUrl: './verify-phone-dialog.component.html',
  styleUrls: ['./verify-phone-dialog.component.css']
})
export class VerifyPhoneDialogComponent implements OnInit {

  modalTitle: string;
  formGroup = this.createFormGroup();
  phone: PhoneModel;
  phoneVerification: PhoneVerificationModel;

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<VerifyPhoneDialogComponent>,
              private phoneService: PhoneService,
              @Inject(MAT_DIALOG_DATA) data) {

                this.phone = data.phone;
                this.modalTitle = data.title;
  }

  ngOnInit(): void {
    //this.phoneService.sendVerification(this.phone).subscribe();
  }


  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
        code: null,
    });
  }

  submit() {
    //console.log(this.formGroup.value);
    if(this.formGroup.get("code").value)
    {
      this.phoneVerification = this.formGroup.value as PhoneVerificationModel;
      //console.log("phoneToVerify: ", this.phoneVerification)
      this.phoneService.verify(this.phone, this.phoneVerification).subscribe((verified) => {
        this.formGroup.reset();
        this.dialogRef.close(true);
      }, httpErrors => {

      });

      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }

}
