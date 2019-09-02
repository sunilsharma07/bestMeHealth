import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { AuthService } from "../../commenHelper/auth.services";
import { AdminProfileService } from "./adminProfile.services";
import { CustomValidation } from "../../commenHelper/customValidation";

@Component({
  templateUrl: "./adminProfile.component.html"
})
export class AdminProfileComponent implements OnInit {
  adminProfileForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  action: string = "view";

  constructor(
    public adminProfileFactory: AdminProfileService,
    public toasterService: ToasterService,
    public router: Router,
    private authService: AuthService,
    public customValidation: CustomValidation
  ) { }

  ngOnInit() {
    this.adminProfileForm = new FormGroup({
      firstName: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.only_char_pattern),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      lastName: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.only_char_pattern),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      email: new FormControl("", [
        Validators.required,
        Validators.email,
        Validators.pattern(this.customValidation.email_pattern)
      ]),
      phoneNumber: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(this.customValidation.number_pattern)
      ])
    });
    this.adminDetails = this.authService.getAdminDetails();
    this.getAdminProfile();
  }

  getAdminProfile(): void {
    this.submitted = true;
    let sendDataToApi = {
      _id: this.adminDetails._id
    };
    this.adminProfileFactory.getAdminProfile(sendDataToApi).subscribe(
      response => {
        let resData = JSON.parse(JSON.stringify(response));
        if (resData.status == 200) {
          this.adminProfileForm.patchValue({
            firstName: resData.data.firstName || "N/A",
            lastName: resData.data.lastName || "N/A",
            phoneNumber: resData.data.contactNumber || "N/A",
            email: resData.data.email || "N/A"
          });
        } else {
          this.toasterService.pop("error", "Error", resData.message);
        }
      },
      error => {
        this.toasterService.pop("error", "Error", "Oops! something went wrong");
      }
    );
  }

  updateProfie(): void {
    this.action = "edit";
  }

  adminProfileFormSubmit(): void {
    this.submitted = true;
    if (this.adminProfileForm.valid) {
      let sendDataToApi = {
        _id: this.adminDetails._id,
        firstName: this.adminProfileForm.value.firstName,
        lastName: this.adminProfileForm.value.lastName,
        phoneNumber: this.adminProfileForm.value.phoneNumber
      };
      this.adminProfileFactory.updateAdminProfile(sendDataToApi).subscribe(
        response => {
          let resData = JSON.parse(JSON.stringify(response));
          if (resData.status == 200) {
            this.action = 'view';
            this.toasterService.pop("success", "Success", resData.message);
            this.router.navigate(["/userProfile"]);
          } else {
            this.toasterService.pop("error", "Error", resData.message);
          }
        },
        error => {
          this.toasterService.pop("error", "Error", "Oops! something went wrong");
        }
      );
    }
  }
}
