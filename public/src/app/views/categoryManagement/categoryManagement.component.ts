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
import { CategoryManagementService } from "./categoryManagement.services";

@Component({
  templateUrl: "categoryManagement.component.html"
})
export class CategoryManagementComponent
  implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings = {};
  categories: Array<any>;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public categoryManagementFactory: CategoryManagementService,
    public toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.getCategoryListing();
  }

  getCategoryListing(): void {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.categoryManagementFactory
          .getAllCategoryListing(dataTablesParameters)
          .subscribe(
            respones => {
              let resData = JSON.parse(JSON.stringify(respones));
              this.categories = resData.data.data;
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
        { data: "name" },
        { data: "action", searchable: false, orderable: false }
      ]
    };
  }

  changedCategorystatus(category_id, type): void {
    if (type === "inactive") {
      var text = "You want to in-active this category?";
      var confirmButtonText = "Yes, in-active it!";
      var confirmButtonColor = "#E5A630";
      var succTitle = "In-Activated";
      var succMsg = "Category has been in-activated successfully";
    } else {
      var text = "You want to active this category?";
      var confirmButtonText = "Yes, active it!";
      var confirmButtonColor = "#008000";
      var succTitle = "Activated";
      var succMsg = "Category has been activated successfully";
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
          let sendDatatoApi = { _id: category_id };
          this.categoryManagementFactory
            .changedCategoryStatus(sendDatatoApi)
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

  deleteCategory(category_id): void {
    var text = "You want to delete this category?";
    var confirmButtonText = "Yes, delete it!";
    var confirmButtonColor = "#f63c3a";
    var succTitle = "Deleted";
    var succMsg = "Category has been deleted successfully";
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
          let sendDatatoApi = { _id: category_id };
          this.categoryManagementFactory
            .deleteCategory(sendDatatoApi)
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
