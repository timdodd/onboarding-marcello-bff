import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {UserListComponent} from './user-list/user-list.component';
import {HttpClientModule} from "@angular/common/http";
import {UserDetailComponent} from './user-detail/user-detail.component';
import {ReactiveFormsModule} from "@angular/forms";
import { VerifyDialogComponent } from './verify-dialog/verify-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatDialogConfig } from "@angular/material/dialog";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    UserDetailComponent,
    VerifyDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatDialogModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [VerifyDialogComponent]
})
export class AppModule { }
