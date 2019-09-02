import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { TipManagementService } from "./tipManagement.services";
import { tipTypes } from "../../commenHelper/config";
import { AuthService } from "../../commenHelper/auth.services";

@Component({
  templateUrl: "./details-tipManagement.component.html"
})
export class DetailsTipComponent implements OnInit {
  detailsTipForm: FormGroup;
  submitted: boolean = false;
  dateInputVisible: boolean = false;
  action: string = "view";
  categoryTypesDropdownSettings = {};
  tipId;
  tipTypesList = tipTypes;
  tipTypesDropdownSettings = {};
  toDate;
  tipType;
  tipValue;
  minDate = new Date();
  adminDetails;

  constructor(
    public route: ActivatedRoute,
    public customValidation: CustomValidation,
    private tipFactory: TipManagementService,
    private toasterService: ToasterService,
    private router: Router,
    public authFactory: AuthService
  ) {}

  ngOnInit(): void {
    this.detailsTipForm = new FormGroup({
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

    this.route.params.subscribe(params => {
      this.tipId = params.tipId;
    });

    this.tipTypesDropdownSettings = {
      singleSelection: true,
      idField: "value",
      textField: "key",
      closeDropDownOnSelection: true
    };

    this.adminDetails = this.authFactory.getAdminDetails();

    this.viewTipDetails();
  }

  onTipTypeSelect(event) {
    this.tipType = event.value;
    if (this.tipType == "week") {
      this.toDate = new Date(
        this.toDate.setDate(this.detailsTipForm.value.date.getDate())
      );
      this.toDate.setDate(this.toDate.getDate() + 6);
      // this.onDateValueChange(this.toDate);
    } else {
      this.toDate = this.detailsTipForm.value.date;
    }
  }

  onDateValueChange(event) {
    if (this.dateInputVisible) {
      if (this.tipType == "week") {
        this.toDate = new Date(this.toDate.setDate(event.getDate() + 6));
      } else {
        this.toDate = new Date(event);
      }
    } else {
      this.dateInputVisible = true;
    }
  }

  viewTipDetails(): void {
    let tipId = { _id: this.tipId };
    this.tipFactory.viewTipDetails(tipId).subscribe(
      response => {
        this.action = "view";
        let getTipDetails = JSON.parse(JSON.stringify(response));
        this.tipType = getTipDetails.data.tipType;
        this.toDate = new Date(getTipDetails.data.toDate);
        this.detailsTipForm.patchValue({
          title: getTipDetails.data.title || "N/A",
          tipType: [getTipDetails.data.tipType] || "N/A",
          date: new Date(getTipDetails.data.fromDate) || new Date(),
          description: getTipDetails.data.description
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
    if (this.detailsTipForm.valid) {
      // console.log(this.detailsTipForm.value.tipType, this.tipType);
      this.detailsTipForm.value._id = this.tipId;
      this.detailsTipForm.value.tipType = this.tipType;
      this.detailsTipForm.value.fromDate = this.detailsTipForm.value.date;
      this.detailsTipForm.value.toDate = new Date(
        this.detailsTipForm.value.date
      );
      this.detailsTipForm.value.addedBy = this.adminDetails._id;
      delete this.detailsTipForm.value.date;
      if (this.detailsTipForm.value.tipType === "week") {
        this.detailsTipForm.value.toDate = new Date(
          this.detailsTipForm.value.toDate.setDate(
            this.detailsTipForm.value.fromDate.getDate() + 6
          )
        );
      }
      this.detailsTipForm.value.title = this.detailsTipForm.value.title.trim();
      this.detailsTipForm.value.description = this.detailsTipForm.value.description.trim();
      this.tipFactory.updateTip(this.detailsTipForm.value).subscribe(
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
          this.detailsTipForm.patchValue({
            date: this.minDate
          });
          this.toasterService.pop(
            "error",
            "Error",
            "Oops! something went wrong !."
          );
        }
      );
    } else {
      this.toasterService.pop(
        "error",
        "Error",
        "This date is past away, so please update date first."
      );
    }
  }

  enableEdit(): void {
    this.action = "edit";
  }
}
