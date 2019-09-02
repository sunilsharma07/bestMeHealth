import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ChefManagementService } from "./chefManagement.services";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';

@Component({
  templateUrl: "./details-chefManagement.component.html"
})
export class DetailsChefmgmtComponent implements OnInit {
  detailsChefForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  chefId: any;
  action: string = "view";
  pemissiondropdownList = [];
  pemissiondropdownSettings = {};
  pemissionselectedItems = {};
  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private chefManagementFactory: ChefManagementService,
    private toasterService: ToasterService,
    private router: Router,
    public authFactory: AuthService
  ) { }

  ngOnInit(): void {
    this.detailsChefForm = new FormGroup({
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
      this.chefId = params.chefId;
    });

    this.chefManagementFactory
      .getPermissionList()
      .subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.pemissiondropdownList = finalResult.data.allPermission;
            this.viewChefDetails(this.chefId);
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

  viewChefDetails(chef_id): void {
    let chefId = { _id: chef_id };
    this.chefManagementFactory.getChefDetails(chefId).subscribe(
      response => {
        this.action = "view";
        let getUsersDetails = JSON.parse(JSON.stringify(response));
        this.pemissionselectedItems = this.pemissiondropdownList.filter(({ _id }) => getUsersDetails.data.permissions.includes(_id));
        this.detailsChefForm.patchValue({
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
    if (this.detailsChefForm.valid) {
      let formData = _.clone(this.detailsChefForm.value)
      formData.updatedBy = this.adminDetails._id;
      formData.userId = this.chefId;

      if (formData.permissions.length) {
        formData.permissions = _.map(this.detailsChefForm.value.permissions, '_id');
      } else {
        formData.permissions = [];
      }

      this.chefManagementFactory
        .updateChef(formData)
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
