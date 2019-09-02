import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AdminManagementService } from "./adminManagement.services";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';

@Component({
  templateUrl: "./details-adminManagement.component.html"
})
export class DetailsAdminmgmtComponent implements OnInit {
  detailsForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  adminId: any;
  action: string = "view";
  pemissiondropdownList = [];
  pemissiondropdownSettings = {};
  pemissionselectedItems = {};
  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private adminManagementFactory: AdminManagementService,
    private toasterService: ToasterService,
    private router: Router,
    public authFactory: AuthService
  ) { }

  ngOnInit(): void {
    this.detailsForm = new FormGroup({
      firstName: new FormControl("", []),
      lastName: new FormControl("", []),
      email: new FormControl("", []),
      phoneNumber: new FormControl("", []),
      type: new FormControl("", []),
      permissions: new FormControl("", [
        Validators.required
      ])
    });
    this.adminDetails = this.authFactory.getAdminDetails();
    this.route.params.subscribe(params => {
      this.adminId = params.adminId;
    });

    this.adminManagementFactory
      .getPermissionList()
      .subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.pemissiondropdownList = finalResult.data.allPermission;
            this.viewAdminDetails(this.adminId);
          }
        }
      );

    this.pemissiondropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'permissionName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
  }

  viewAdminDetails(chef_id): void {
    let adminId = { _id: chef_id };
    this.adminManagementFactory.getAdminDetails(adminId).subscribe(
      response => {
        this.action = "view";
        let getUsersDetails = JSON.parse(JSON.stringify(response));
        this.pemissionselectedItems = this.pemissiondropdownList.filter(({ _id }) => getUsersDetails.data.permissions.includes(_id));
        this.detailsForm.patchValue({
          firstName: getUsersDetails.data.firstName || "N/A",
          lastName: getUsersDetails.data.lastName || "N/A",
          email: getUsersDetails.data.email || "N/A",
          phoneNumber: getUsersDetails.data.contactNumber || "N/A"
        });
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

  updateFormSubmit(): void {
    this.submitted = true;
    if (this.detailsForm.valid) {
      let formData = _.clone(this.detailsForm.value)
      formData.firstName = formData.firstName.trim();
      formData.lastName = formData.lastName.trim();
      formData.email = formData.email.trim();
      formData.contactNumber = formData.contactNumber.trim();
      formData.updatedBy = this.adminDetails._id;
      formData.userId = this.adminId;

      if (formData.permissions.length) {
        formData.permissions = _.map(this.detailsForm.value.permissions, '_id');
      } else {
        formData.permissions = [];
      }

      this.adminManagementFactory
        .updateAdmin(formData)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/adminManagement"]);
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
