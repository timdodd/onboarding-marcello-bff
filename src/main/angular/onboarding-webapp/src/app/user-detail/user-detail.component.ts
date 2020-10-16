import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormArray} from "@angular/forms";
import {UserService} from "../service/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserModel} from "../model/user.model";
import {PhoneModel} from "../model/phone.model";

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  formGroup = this.createFormGroup();

  //isDeleteButtonVisible = false;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const userId = params.get("userId");
      if(params != null) {
        this.loadUser(userId);
      }
    })
  }

  private loadUser(userId: string) {
    this.userService.get(userId).subscribe(user => {
      this.formGroup.get("userDetails").patchValue(user);
      for(let i = 0; i < user.phones.length; i++) {
      (<FormArray>this.formGroup.get("phones")).push(new FormControl());
      (<FormArray>this.formGroup.get("phones")).at(i).patchValue(user.phones[i]);
      }
    });
  }

//simple
//   private createFormGroup(): FormGroup {
//     return this.formBuilder.group({
//       userId: null,
//       firstName: null,
//       lastName: null,
//       username: null,
//       phones: this.formBuilder.array([])
//     });
//   }

  private createFormGroup(): FormGroup {
      return this.formBuilder.group({
        userDetails: this.formBuilder.group({
            userId: null,
            firstName: null,
            lastName: null,
            username: null
            }),
        phones: this.formBuilder.array([])
      })
    }

  get firstNameControl(): FormControl {
    return this.formGroup.get("userDetails").get("firstName") as FormControl;
  }

  get lastNameControl(): FormControl {
    return this.formGroup.get("userDetails").get("lastName") as FormControl;
  }

  get usernameControl(): FormControl {
    return this.formGroup.get("userDetails").get("username") as FormControl;
  }

  get userIdControl(): FormControl {
    return this.formGroup.get("userDetails").get("userId") as FormControl;
  }

  get phonesControl(): FormArray {
    return (<FormArray>this.formGroup.get("phones") as FormArray);
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

//   deleteVisible() {
//     this.isDeleteButtonVisible = true;
//   }
//   deleteInvisible() {
//     this.isDeleteButtonVisible = false;
//   }

  isDeleteVisible() : boolean {
    if(this.formGroup.get("userId") !== null) {
      return true;
    } else {
      return false;
    }
  }

  cancel() {
    this.router.navigateByUrl("users");
  }

//   delete(userId: string) : void {
//
//   }

  newPhone(phone: PhoneModel) {

  }

}
