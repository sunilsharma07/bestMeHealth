import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ToasterService } from "angular2-toaster";
import swal from "sweetalert2";
import { DoctorManagementService } from "./doctorManagement.services";

@Component({
  templateUrl: "doctorManagement.component.html"
})
export class DoctorManagementComponent
  implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings = {};
  doctors: Array<any>;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public doctorManagenentFactory: DoctorManagementService,
    public toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getDoctorsListing();
  }

  getDoctorsListing(): void {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.doctorManagenentFactory
          .getAllDoctorListing(dataTablesParameters)
          .subscribe(
            respones => {
              let resData = JSON.parse(JSON.stringify(respones));
              this.doctors = resData.data.data;
              callback({
                recordsTotal: resData.data.recordsTotal,
                recordsFiltered: resData.data.recordsFiltered,
                data: []
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
      },
      scrollCollapse: true,
      columns: [
        { data: "firstName" },
        { data: "lastName" },
        { data: "email" },
        { data: "type" },
        { data: "action", searchable: false, orderable: false }
      ]
    };
  }

  changedDoctorstatus(doctor_id, type): void {
    if (type === "inactive") {
      var text = "You want to in-active this doctor?";
      var confirmButtonText = "Yes, in-active it!";
      var confirmButtonColor = "#E5A630";
      var succTitle = "In-Activated";
      var succMsg = "Doctor has been in-activated successfully";
    } else {
      var text = "You want to active this doctor?";
      var confirmButtonText = "Yes, active it!";
      var confirmButtonColor = "#008000";
      var succTitle = "Activated";
      var succMsg = "Doctor has been activated successfully";
    }

    swal
      .fire({
        title: "Are you sure?",
        text: text,
        type: "warning",
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
        confirmButtonColor: confirmButtonColor
      })
      .then(result => {
        if (result.value) {
          let sendDatatoApi = { _id: doctor_id };
          this.doctorManagenentFactory
            .changedDoctorstatus(sendDatatoApi)
            .subscribe(
              response => {
                swal.fire(succTitle, succMsg, "success");
                this.rerender();
              },
              error => {
                this.toasterService.pop(
                  "error",
                  "Error",
                  "Oops! something went wrong !."
                );
              }
            );
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.fire("Cancelled", "", "error");
        }
      });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
