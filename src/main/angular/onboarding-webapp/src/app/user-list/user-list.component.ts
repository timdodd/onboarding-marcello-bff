import { Component, OnInit } from '@angular/core';
import {UserModel} from "../model/user.model";
import {UserService} from "../service/user.service";
import {PhoneService} from "../service/phone.service";
import {Router} from "@angular/router";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import {UserConfirmDialogComponent} from '../user-confirm-dialog/user-confirm-dialog.component';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor(private userService: UserService,
              private phoneService: PhoneService,
              private router: Router,
              private dialog: MatDialog) { }

  users: UserModel[] = [];

  ngOnInit(): void {
    this.userService.findAll().subscribe(users => {
      this.users = users;
    });
  }

  newUser(user: UserModel) {
    this.router.navigateByUrl(`users/`);
  }

  edit(user: UserModel) {
    this.router.navigateByUrl(`users/${user.userId}`);
  }

  delete(user: UserModel): void {
    this.openConfirmDeleteModal("This action cannot be undone. Continue?", "Confirm Delete", user)
  }

  deleteUser(user: UserModel) {
    var userId = user.userId;
    if(user.userId) {
      this.userService.delete(user.userId).subscribe((deleted) => {
        this.users = [];
        this.ngOnInit();
        this.phoneService.findUserPhones(userId).subscribe((phone) => {
          if(phone) {
            phone.forEach(entity => this.phoneService.delete(entity));
          }
        }, httpError => {

        });
      });
    }
  }

    openConfirmDeleteModal(description: string, dialogTitle: string, user: UserModel) {
      var choice: any;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.data = {
        id: 1,
        title: "Cancel Changes",
        description: description
      };
      const dialogRef = this.dialog.open(UserConfirmDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((data) => {
        if(data) {
          this.deleteUser(user);
        }
      });
    }


}
