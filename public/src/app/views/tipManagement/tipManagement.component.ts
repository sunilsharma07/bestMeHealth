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
import { TipManagementService } from "./tipManagement.services";
import swal from "sweetalert2";
import { AuthService } from "../../commenHelper/auth.services";

@Component({
  templateUrl: "tipManagement.component.html"
})
export class TipManagementComponent implements AfterViewInit, OnInit {
  dtOptions: DataTables.Settings = {};
  tips: Array<any>;
  adminDetails;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public tipFactory: TipManagementService,
    public toasterService: ToasterService,
    public authFactory: AuthService
  ) {}

  ngOnInit(): void {
    this.adminDetails = this.authFactory.getAdminDetails();
    this.getAllTipListing();
  }

  getAllTipListing() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.tipFactory.getAllTipListing(dataTablesParameters).subscribe(
          respones => {
            let resData = JSON.parse(JSON.stringify(respones));
            this.tips = resData.data.data;
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
        { data: "title" },
        { data: "description" },
        { data: "tipType" },
        { data: "whoAdded" },
        { data: "action", searchable: false, orderable: false }
      ]
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  deleteTip(tipId) {
    swal
      .fire({
        title: "Are you sure?",
        text: "You want to delete this tip?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
        confirmButtonColor: "#E5A630"
      })
      .then(result => {
        if (result.value) {
          let sendDataToApi = {
            _id: tipId,
            adminId: this.adminDetails._id
          };
          this.tipFactory.deleteTip(sendDataToApi).subscribe(
            response => {
              let getResponse = JSON.parse(JSON.stringify(response));
              if (getResponse.status == 200) {
                swal.fire(
                  "Deleted",
                  "Tip has been deleted successfully",
                  "success"
                );
                this.rerender();
              } else {
                this.toasterService.pop("error", "Error", getResponse.message);
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

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
