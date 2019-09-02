import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { ChangePasswordService } from "./changePassword.services";
import { AuthService } from "../../commenHelper/auth.services";
import { CustomValidation } from "../../commenHelper/customValidation";

@Component({
  selector: "app-changePassword",
  templateUrl: "./changePassword.component.html"
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;

  constructor(
    public changePasswordFactory: ChangePasswordService,
    public toasterService: ToasterService,
    public router: Router,
    private authService: AuthService,
    public customValidation: CustomValidation
  ) { }

  ngOnInit() {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.sapce_pattern)
      ]),
      newPassword: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.sapce_pattern),
        Validators.minLength(6),
        Validators.maxLength(16)
      ]),
      confPassword: new FormControl("", [Validators.required])
    });
    this.adminDetails = this.authService.getAdminDetails();
  }

  changePasswordFormSubmit(): void {
    this.submitted = true;
    if (
      this.changePasswordForm.valid &&
      this.changePasswordForm.value.newPassword ==
      this.changePasswordForm.value.confPassword
    ) {
      let sendDataToApi = {
        _id: this.adminDetails._id,
        currPassword: this.changePasswordForm.value.currentPassword,
        newPassword: this.changePasswordForm.value.newPassword
      };
      this.changePasswordFactory.changePassword(sendDataToApi).subscribe(
        response => {
          let resData = JSON.parse(JSON.stringify(response));
          if (resData.status == 200) {
            this.toasterService.pop("success", "Success", resData.message);
            this.router.navigate(["/userProfile"]);
          } else {
            this.toasterService.pop("error", "Error", resData.message);
          }
        },
        error => {
          this.toasterService.pop(
            "error",
            "Error",
            "Oops! something went wrong"
          );
        }
      );
    }
  }
}
