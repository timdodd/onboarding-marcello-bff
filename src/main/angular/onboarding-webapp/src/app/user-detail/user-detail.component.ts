import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {UserService} from "../service/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserModel} from "../model/user.model";

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  formGroup = this.createFormGroup();

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const userId = params.get("userId");
      this.loadUser(userId);
    })
  }

  private loadUser(userId: string) {
    this.userService.get(userId).subscribe(user => {
      this.formGroup.patchValue(user);
    });
  }

  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      userId: null,
      firstName: null,
      lastName: null,
      username: null
    });
  }

  get usernameControl(): FormControl {
    return this.formGroup.get("username") as FormControl;
  }

  save() {
    const valueToSave = this.formGroup.value as UserModel;
    this.userService.save(valueToSave).subscribe(savedValue => {
      this.router.navigateByUrl("users");
    }, httpError => {
      if (httpError.status === 400) {
        Object.keys(httpError.error).forEach(key => {
          this.formGroup.get(key).setErrors(httpError.error[key]);
        });
      } else {
        console.log("oh no something horrible went awry");
      }
    })
  }

  cancel() {
    this.router.navigateByUrl("users");
  }

}
