import { Component, OnInit } from '@angular/core';
import {UserModel} from "../model/user.model";
import {UserService} from "../service/user.service";
import {PhoneService} from "../service/phone.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor(private userService: UserService,
              private phoneService: PhoneService,
              private router: Router) { }

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
}
