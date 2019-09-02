import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { LabAssistantManagementService } from "./labAssistantManagement.services";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';

@Component({
  templateUrl: "./details-labAssistantManagement.component.html"
})
export class DetailsLabAssistantmgmtComponent implements OnInit {
  detailsLabAssistantForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  labAssistantId: any;
  action: string = "view";
  pemissiondropdownList = [];
  pemissiondropdownSettings = {};
  pemissionselectedItems = {};
  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private labAssistantManagementFactory: LabAssistantManagementService,
    private toasterService: ToasterService,
    private router: Router,
    public authFactory: AuthService
  ) { }

  ngOnInit(): void {
    this.detailsLabAssistantForm = new FormGroup({
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
      this.labAssistantId = params.labAssistantId;
    });

    this.labAssistantManagementFactory
      .getPermissionList()
      .subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.pemissiondropdownList = finalResult.data.allPermission;
            this.viewLabAssistantDetails(this.labAssistantId);
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

  viewLabAssistantDetails(labAssistant_id): void {
    let labAssistantId = { _id: labAssistant_id };
    this.labAssistantManagementFactory.getLabAssistantDetails(labAssistantId).subscribe(
      response => {
        this.action = "view";
        let getUsersDetails = JSON.parse(JSON.stringify(response));
        this.pemissionselectedItems = this.pemissiondropdownList.filter(({ _id }) => getUsersDetails.data.permissions.includes(_id));
        this.detailsLabAssistantForm.patchValue({
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
    if (this.detailsLabAssistantForm.valid) {
      let formData = _.clone(this.detailsLabAssistantForm.value)
      formData.updatedBy = this.adminDetails._id;
      formData.userId = this.labAssistantId;

      if (formData.permissions.length) {
        formData.permissions = _.map(this.detailsLabAssistantForm.value.permissions, '_id');
      } else {
        formData.permissions = [];
      }

      this.labAssistantManagementFactory
        .updateLabAssistant(formData)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/labAssistantManagement"]);
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
