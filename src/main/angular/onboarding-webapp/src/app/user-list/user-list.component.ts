import { Component, OnInit } from '@angular/core';
import {UserModel} from "../model/user.model";
import {UserService} from "../service/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor(private userService: UserService,
              private router: Router) { }

  users: UserModel[] = [];

  ngOnInit(): void {
    this.userService.findAll().subscribe(users => {
      this.users = users;
    });
  }

  edit(user: UserModel) {
    this.router.navigateByUrl(`users/${user.userId}`);
  }
}
