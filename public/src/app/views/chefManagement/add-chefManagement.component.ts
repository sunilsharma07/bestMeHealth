import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { ChefManagementService } from "./chefManagement.services";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';

@Component({
  templateUrl: "./add-chefManagement.component.html"
})
export class AddChefComponent implements OnInit {
  addChefForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  pemissiondropdownList = [];
  pemissiondropdownSettings = {};

  constructor(
    public chefManagementFactory: ChefManagementService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFactory: AuthService
  ) { }

  ngOnInit() {
    this.addChefForm = new FormGroup({
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
      contactNumber: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(this.customValidation.number_pattern)
      ]),
      permissions: new FormControl("", [
        Validators.required
      ])
    });
    this.adminDetails = this.authFactory.getAdminDetails();

    this.chefManagementFactory
      .getPermissionList()
      .subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.pemissiondropdownList = finalResult.data.allPermission;
          }
        }
      );

    this.pemissiondropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'permissionName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

  }

  addChefFormSubmit(): void {
    this.submitted = true;
    if (this.addChefForm.valid) {
      let formData = _.clone(this.addChefForm.value)
      formData.firstName = formData.firstName.trim();
      formData.lastName = formData.lastName.trim();
      formData.email = formData.email.trim();
      formData.contactNumber = formData.contactNumber.trim();
      formData.createdBy = this.adminDetails._id;

      if (this.adminDetails.userType == 'superAdmin' || this.adminDetails.userType == 'subAdmin') {
        formData.userType = 'superChef';
      } else {
        formData.userType = 'subChef';
      }

      if (formData.permissions.length) {
        formData.permissions = _.map(this.addChefForm.value.permissions, '_id');
      } else {
        formData.permissions = [];
      }

      this.chefManagementFactory
        .addNewChef(formData)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/chefManagement"]);
            } else {
              this.toasterService.pop("error", "Error", finalResult.message);
            }
          },
          error => {
            this.toasterService.pop(
              "error",
              "Error",
              "Oops! something went wrong !."
            );
          }
        );
    }
  }
}
