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
import { ChefManagementService } from "./chefManagement.services";

@Component({
  templateUrl: "chefManagement.component.html"
})
export class ChefManagementComponent
  implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings = {};
  chefs: Array<any>;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public chefManagenentFactory: ChefManagementService,
    public toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.getChefsListing();
  }

  getChefsListing(): void {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.chefManagenentFactory
          .getAllChefListing(dataTablesParameters)
          .subscribe(
            respones => {
              let resData = JSON.parse(JSON.stringify(respones));
              this.chefs = resData.data.data;
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

  changedChefstatus(chef_id, type): void {
    if (type === "inactive") {
      var text = "You want to in-active this chef?";
      var confirmButtonText = "Yes, in-active it!";
      var confirmButtonColor = "#E5A630";
      var succTitle = "In-Activated";
      var succMsg = "Chef has been in-activated successfully";
    } else {
      var text = "You want to active this chef?";
      var confirmButtonText = "Yes, active it!";
      var confirmButtonColor = "#008000";
      var succTitle = "Activated";
      var succMsg = "Chef has been activated successfully";
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
          let sendDatatoApi = { userId: chef_id };
          this.chefManagenentFactory
            .changedChefStatus(sendDatatoApi)
            .subscribe(
              response => {
                let resData = JSON.parse(JSON.stringify(response));
                if (resData.status == 200) {
                  swal.fire(succTitle, succMsg, "success");
                  this.rerender();
                } else {
                  this.toasterService.pop(
                    "error",
                    "Error",
                    resData.message
                  );
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
