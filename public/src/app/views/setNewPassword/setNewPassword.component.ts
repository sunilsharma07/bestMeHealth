import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ToasterService,
  ToasterConfig
} from "angular2-toaster/angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { SetNewPasswordService } from "./setNewPassword.services";
import { CustomValidation } from "../../commenHelper/customValidation";

@Component({
  templateUrl: "./setNewPassword.component.html"
})
export class SetNewPasswordComponent implements OnInit {
  toasterconfig: ToasterConfig = new ToasterConfig({
    positionClass: "toast-top-right",
    showCloseButton: false,
    animation: "flyLeft"
  });
  setPasswordForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  setPasstoken;

  constructor(
    public route: ActivatedRoute,
    public setPasswordFactory: SetNewPasswordService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation
  ) { }

  ngOnInit() {
    this.setPasswordForm = new FormGroup({
      newPassword: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.sapce_pattern),
        Validators.minLength(6),
        Validators.maxLength(16)
      ]),
      confPassword: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.sapce_pattern),
      ])
    });
    this.route.params.subscribe(params => {
      this.setPasstoken = params.setPasstoken;
    });
  }

  setPasswordFormSubmit(): void {
    this.submitted = true;
    if (
      this.setPasswordForm.valid &&
      this.setPasswordForm.value.newPassword ==
      this.setPasswordForm.value.confPassword
    ) {
      let sendDataToApi = {
        setPassToken: this.setPasstoken,
        password: this.setPasswordForm.value.newPassword
      };
      this.setPasswordFactory.setUserPassword(sendDataToApi).subscribe(
        response => {
          let resData = JSON.parse(JSON.stringify(response));
          if (resData.status == 200) {
            this.toasterService.pop("success", "Success", resData.message);
            this.router.navigate(["/userManagement"]);
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
