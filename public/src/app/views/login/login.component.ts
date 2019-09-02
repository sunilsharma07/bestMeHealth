import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { Router } from "@angular/router";
import { LoginService } from "./login.services";
import { CustomValidators } from "ng2-validation";
import {
  ToasterService,
  ToasterConfig
} from "angular2-toaster/angular2-toaster";
import { AuthService } from "../../commenHelper/auth.services";
import { CustomValidation } from "../../commenHelper/customValidation";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html"
})
export class LoginComponent implements OnInit {
  toasterconfig: ToasterConfig = new ToasterConfig({
    positionClass: "toast-top-right",
    showCloseButton: false,
    animation: "flyLeft"
  });

  loginForm: FormGroup;
  submitted: boolean = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    public loginFactory: LoginService,
    public toasterService: ToasterService,
    public cusValidation: CustomValidation
  ) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl("", [
        Validators.required,
        CustomValidators.email
        // this.cusValidation.email_pattern
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16)
      ])
    });
    let permissions = this.authService.getPermission();
    if (permissions && permissions.length) {
      this.router.navigate([`/${permissions[0]}`]);
    }
  }

  loginFormSubmit(): void {
    this.submitted = true;
    if (this.loginForm.valid) {
      this.loginFactory.adminLogin(this.loginForm.value).subscribe(
        response => {
          let adminDetails = JSON.parse(JSON.stringify(response));
          if (adminDetails.status == 200) {
            this.authService.setAuthData(adminDetails.data);
            this.authService.setPermissionData(adminDetails.data.permissions);
            this.router.navigate([`/${adminDetails.data.permissions[0]}`]);
          } else {
            this.toasterService.clear();
            this.toasterService.pop("error", "Error", adminDetails.message);
          }
        },
        error => {
          this.toasterService.clear();
          this.toasterService.pop(
            "error",
            "Error",
            "Oops! Something went wrong"
          );
        }
      );
    }
  }
}
