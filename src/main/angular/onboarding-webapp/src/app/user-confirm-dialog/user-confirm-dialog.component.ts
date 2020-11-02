import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-user-confirm-dialog',
  templateUrl: './user-confirm-dialog.component.html',
  styleUrls: ['./user-confirm-dialog.component.css']
})
export class UserConfirmDialogComponent implements OnInit {

  modalTitle: string;
  description: string;

  constructor(private dialogRef: MatDialogRef<UserConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) {

                this.modalTitle = data.title;
                this.description = data.description;
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(true);
  }

}
