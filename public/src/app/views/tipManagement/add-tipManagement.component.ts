import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from "lodash";
import { TipManagementService } from "./tipManagement.services";
import { tipTypes } from "../../commenHelper/config";

@Component({
  templateUrl: "./add-tipManagement.component.html"
})
export class AddTipComponent implements OnInit {
  addTipForm: FormGroup;
  submitted: boolean = false;
  minDate: Date;
  toDate = new Date();
  tipTypesDropdownSettings = {};
  tipTypesList = tipTypes;
  tipValue;
  adminDetails;

  constructor(
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFactory: AuthService,
    public tipFactory: TipManagementService
  ) {
    this.minDate = new Date();
    this.toDate.setDate(this.minDate.getDate() + 6);
  }

  ngOnInit() {
    this.addTipForm = new FormGroup({
      title: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.white_space_first_char)
      ]),
      tipType: new FormControl("", [Validators.required]),
      date: new FormControl(new Date(), Validators.required),
      description: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.white_space_first_char)
      ])
    });

    this.adminDetails = this.authFactory.getAdminDetails();

    this.tipTypesDropdownSettings = {
      singleSelection: true,
      idField: "value",
      textField: "key",
      closeDropDownOnSelection: true
    };
  }

  onTipTypeSelect(event) {
    this.tipValue = event.value;
    if (this.tipValue == "week") {
      this.toDate = new Date(this.toDate.setDate(this.minDate.getDate() + 6));
    } else {
      this.toDate = this.addTipForm.value.date;
    }
  }

  onDateValueChange(event) {
    if (this.tipValue == "week") {
      this.toDate = new Date(this.toDate.setDate(event.getDate() + 6));
    } else {
      this.toDate = new Date(event);
    }
  }

  addTipFormSubmit() {
    this.submitted = true;
    if (this.addTipForm.valid) {
      this.addTipForm.value.tipType = this.addTipForm.value.tipType[0].value;
      this.addTipForm.value.fromDate = this.addTipForm.value.date;
      this.addTipForm.value.toDate = new Date(this.addTipForm.value.date);
      this.addTipForm.value.type = this.adminDetails.userType;
      this.addTipForm.value.addedBy = this.adminDetails._id;
      this.addTipForm.value.whoAdded =
        this.adminDetails.firstName + " " + this.adminDetails.lastName;
      delete this.addTipForm.value.date;
      if (this.addTipForm.value.tipType === "week") {
        this.addTipForm.value.toDate = new Date(
          this.addTipForm.value.toDate.setDate(
            this.addTipForm.value.fromDate.getDate() + 6
          )
        );
      }
      this.addTipForm.value.title = this.addTipForm.value.title.trim();
      this.addTipForm.value.description = this.addTipForm.value.description.trim();
      this.tipFactory.addNewTip(this.addTipForm.value).subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.toasterService.pop("success", "Success", finalResult.message);
            this.router.navigate(["/tipManagement"]);
          } else {
            this.toasterService.pop("error", "Error", finalResult.message);
          }
        },
        error => {
          this.addTipForm.patchValue({
            date: this.minDate
          });
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
