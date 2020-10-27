import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {PhoneModel} from "../model/phone.model";
import {FormBuilder, FormControl, FormGroup, FormArray} from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-verify-dialog',
  templateUrl: './verify-dialog.component.html',
  styleUrls: ['./verify-dialog.component.css']
})
export class VerifyDialogComponent implements OnInit {

  modalTitle: string;
  formGroup = this.createFormGroup();
  phone: PhoneModel;

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<VerifyDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) {

                this.phone = data.phone;
                this.modalTitle = data.title;
                //this.modalTitle = title;
                //console.log(this.phone);
                //console.log(this.formGroup);
  }

  ngOnInit(): void {
    this.formGroup.patchValue(this.phone);
    console.log(this.formGroup);
  }


  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
        phoneId: null,
        userId: null,
        phoneNumber: null,
        primaryPhone: null,
        verified: null,
        verificationCode: null,
        time: null,
    });
  }

  submit() {
    if(this.formGroup.get("verificationCode").value)
    {

      //console.log(this.formGroup.get("verificationCode").value);
    }
  }

  close() {
    this.dialogRef.close();
  }

}
