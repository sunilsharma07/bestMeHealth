import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import { AddHolidayService } from "./addHoliday.services";
import { Subject } from "rxjs";
import Swal from "sweetalert2";
import { DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-addHoliday",
  templateUrl: "./addHoliday.component.html"
})
export class AddHolidayComponent implements OnInit {
  addHolidayForm: FormGroup;
  submitted: boolean = false;
  adminDetails;
  holidayDate;
  minDate: Date;

  // dtOptions: any = {};
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  constructor(
    public addHolidayFactory: AddHolidayService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFacotry: AuthService
  ) {
    this.minDate = new Date();
  }

  ngOnInit() {
    this.addHolidayForm = new FormGroup({
      holidayDate: new FormControl(new Date(), Validators.required)
    });
    this.adminDetails = this.authFacotry.getAdminDetails();
    this.getHolidayDate();
  }

  deleteHoliday(hdId, index) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this holiday date.",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      confirmButtonColor: "#f63c3a"
    }).then(result => {
      if (result.value) {
        let sendDatatoApi = { _id: this.adminDetails._id, holidayDate: hdId };
        this.addHolidayFactory.deleteHolidayDate(sendDatatoApi).subscribe(
          response => {
            this.holidayDate.holidayDate.splice(index, 1);
            Swal.fire(
              "Deleted",
              "Holiday date has been deleted successfully.",
              "success"
            );
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
              this.dtTrigger.next();
            });
          },
          error => {
            this.toasterService.clear();
            this.toasterService.pop(
              "error",
              "Error",
              "Oops! something went wrong !."
            );
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Cancelled", "", "error");
      }
    });
  }

  getHolidayDate(): void {
    this.dtOptions = {
      pagingType: "full_numbers",
      // info: false,
      pageLength: 10,
      // lengthChange: true,
      // searching: true,
      retrieve: true,
      columns: [
        { title: "Holiday Date" },
        { title: "Action", searchable: false, orderable: false }
      ]
    };
    let sendDataToApi = {
      _id: this.adminDetails._id
    };
    this.addHolidayFactory.getHolidayDate(sendDataToApi).subscribe(
      response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          this.holidayDate = finalResult.data;
          this.dtTrigger.next();
        } else {
          this.toasterService.clear();
          this.toasterService.pop("error", "Error", finalResult.message);
        }
      },
      error => {
        this.toasterService.clear();
        this.toasterService.pop(
          "error",
          "Error",
          "Oops! something went wrong !."
        );
      }
    );
  }

  addHolidayFormSubmit(): void {
    this.submitted = true;
    if (this.addHolidayForm.valid) {
      let sendDataToApi = {
        _id: this.adminDetails._id,
        holidayDate: this.addHolidayForm.value.holidayDate
      };
      this.addHolidayFactory.addHolidayDate(sendDataToApi).subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            if (this.holidayDate.holidayDate == null) {
              this.holidayDate.holidayDate = [];
            }
            this.holidayDate.holidayDate.push(
              this.addHolidayForm.value.holidayDate
            );
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
              this.dtTrigger.next();
            });
            this.toasterService.clear();
            this.toasterService.pop("success", "Success", finalResult.message);
          } else {
            this.toasterService.clear();
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
