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
import { NutritionManagementService } from "./nutritionManagement.services";

@Component({
  templateUrl: "nutritionManagement.component.html"
})
export class NutritionManagementComponent
  implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings = {};
  nutritions: Array<any>;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public nutritionManagenentFactory: NutritionManagementService,
    public toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getNutritionsListing();
  }

  getNutritionsListing(): void {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.nutritionManagenentFactory
          .getAllNutritionListing(dataTablesParameters)
          .subscribe(
            respones => {
              let resData = JSON.parse(JSON.stringify(respones));
              this.nutritions = resData.data.data;
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

  changedNutritionstatus(nutrition_id, type): void {
    if (type === "inactive") {
      var text = "You want to in-active this nutrition?";
      var confirmButtonText = "Yes, in-active it!";
      var confirmButtonColor = "#E5A630";
      var succTitle = "In-Activated";
      var succMsg = "Nutrition has been in-activated successfully";
    } else {
      var text = "You want to active this nutrition?";
      var confirmButtonText = "Yes, active it!";
      var confirmButtonColor = "#008000";
      var succTitle = "Activated";
      var succMsg = "Nutrition has been activated successfully";
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
          let sendDatatoApi = { _id: nutrition_id };
          this.nutritionManagenentFactory
            .changedNutritionStatus(sendDatatoApi)
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
