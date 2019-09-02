import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { DoctorManagementService } from "./doctorManagement.services";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';

@Component({
  templateUrl: "./details-doctorManagement.component.html"
})
export class DetailsDoctormgmtComponent implements OnInit {
  detailsDoctorForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  doctorId: any;
  action: string = "view";
  pemissiondropdownList = [];
  pemissiondropdownSettings = {};
  pemissionselectedItems = {};
  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private doctorManagementFactory: DoctorManagementService,
    private toasterService: ToasterService,
    private router: Router,
    public authFactory: AuthService
  ) { }

  ngOnInit(): void {
    this.detailsDoctorForm = new FormGroup({
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
      this.doctorId = params.doctorId;
    });

    this.doctorManagementFactory
      .getPermissionList()
      .subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.pemissiondropdownList = finalResult.data.allPermission;
            this.viewDoctorDetails(this.doctorId);
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

  viewDoctorDetails(doctor_id): void {
    let doctorId = { _id: doctor_id };
    this.doctorManagementFactory.getDoctorDetails(doctorId).subscribe(
      response => {
        this.action = "view";
        let getUsersDetails = JSON.parse(JSON.stringify(response));
        this.pemissionselectedItems = this.pemissiondropdownList.filter(({ _id }) => getUsersDetails.data.permissions.includes(_id));
        this.detailsDoctorForm.patchValue({
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
    if (this.detailsDoctorForm.valid) {
      let formData = _.clone(this.detailsDoctorForm.value)
      formData.updatedBy = this.adminDetails._id;
      formData.userId = this.doctorId;

      if (formData.permissions.length) {
        formData.permissions = _.map(this.detailsDoctorForm.value.permissions, '_id');
      } else {
        formData.permissions = [];
      }

      this.doctorManagementFactory
        .updateDoctor(formData)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/doctorManagement"]);
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
