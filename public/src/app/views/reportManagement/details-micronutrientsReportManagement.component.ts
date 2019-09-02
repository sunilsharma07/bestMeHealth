import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder
} from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { ReportManagementService } from "./reportManagement.services";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from "lodash";

@Component({
  templateUrl: "./details-micronutrientsReportManagement.component.html"
})
export class DetailsMicronutrientsReportComponent implements OnInit {
  action: any = "view";
  dataValidated: boolean = true;
  adminDetails: any;
  reportId: any;
  customerId: any;
  categoryResult = [];
  contentsResult = [];
  reportResults = [];

  constructor(
    public route: ActivatedRoute,
    public reportManagementFactory: ReportManagementService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFactory: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.reportId = params.reportId;
    });
    this.adminDetails = this.authFactory.getAdminDetails();

    this.reportManagementFactory
      .getMicronutrientsReportResult({ reportId: this.reportId })
      .subscribe(response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          if (
            typeof finalResult.data.customerId != "undefined" &&
            finalResult.data.customerId != ""
          ) {
            this.customerId = finalResult.data.customerId;
          }
          this.reportResults = finalResult.data.reportData;
          this.categoryResult = finalResult.data.categoryData;
          this.contentsResult = finalResult.data.contentsData;
        }
      });
  }

  getContentName(contID) {
    let contName = _.find(this.contentsResult, function(cont) {
      return cont["_id"] == contID;
    });
    if (typeof contName == "undefined" || contName == "") {
      contName = contID;
    } else {
      contName = contName.name;
    }
    return contName;
  }

  updateResultArray(index, event): void {
    let inputValue = event.target.value;
    this.reportResults[index]["result"] = inputValue;
    let floatPattern = /^[-+]?[0-9]*\.?[0-9]*.$/;
    let numberPattern = /^[0-9][0-9]*$/;
    if (inputValue.match(numberPattern)) {
      // Validate numeric value
      this.dataValidated = <boolean>true;
      this.reportResults[index]["error"] = false;
    } else {
      this.dataValidated = <boolean>false;
      this.reportResults[index]["error"] = true;
    }
  }

  updateReport(): void {
    if (this.dataValidated) {
      this.reportResults = _.map(this.reportResults, function(rpt) {
        delete rpt.error;
        return rpt;
      });
      this.reportManagementFactory
        .updateMicronutrientsReportResult({
          reportId: this.reportId,
          reportResult: JSON.stringify(this.reportResults)
        })
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.action = "view";
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
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

  enableEdit(): void {
    this.action = "edit";
  }
}
