import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {UserListComponent} from "./user-list/user-list.component";
import {UserDetailComponent} from "./user-detail/user-detail.component";
import {VerifyDialogComponent} from './verify-dialog/verify-dialog.component';

const routes: Routes = [
  {
    path: "users",
    component: UserListComponent,
  },
  {
    path: "users/:userId",
    component: UserDetailComponent,
  },
//   {
//   path: "users/:userId/phones/verify",
//   component: VerifyDialogComponent,
//   },
  {
    path: "**",
    redirectTo: "users"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
  ]
})
export class AppRoutingModule { }
