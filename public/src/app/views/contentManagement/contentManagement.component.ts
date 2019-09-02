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
import { ContentManagementService } from "./contentManagement.services";

@Component({
  templateUrl: "contentManagement.component.html"
})
export class ContentManagementComponent
  implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings = {};
  contents: Array<any>;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public contentManagenentFactory: ContentManagementService,
    public toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getContentListing();
  }

  getContentListing(): void {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.contentManagenentFactory
          .getAllContentListing(dataTablesParameters)
          .subscribe(
            respones => {
              let resData = JSON.parse(JSON.stringify(respones));
              this.contents = resData.data.data;
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
        { data: "details", orderable: false },
        { data: "action", searchable: false, orderable: false }
      ]
    };
  }

  // changedBlogstatus(blog_id, type): void {
  //   if (type === "inactive") {
  //     var text = "You want to in-active this blog?";
  //     var confirmButtonText = "Yes, in-active it!";
  //     var confirmButtonColor = "#E5A630";
  //     var succTitle = "In-Activated";
  //     var succMsg = "Blog has been in-activated successfully";
  //   } else {
  //     var text = "You want to active this blog?";
  //     var confirmButtonText = "Yes, active it!";
  //     var confirmButtonColor = "#008000";
  //     var succTitle = "Activated";
  //     var succMsg = "Blog has been activated successfully";
  //   }
  //   swal
  //     .fire({
  //       title: "Are you sure?",
  //       text: text,
  //       type: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: confirmButtonText,
  //       cancelButtonText: "No, cancel!",
  //       reverseButtons: true,
  //       confirmButtonColor: confirmButtonColor
  //     })
  //     .then(result => {
  //       if (result.value) {
  //         let sendDatatoApi = { _id: blog_id };
  //         this.blogManagenentFactory.changedBlogStatus(sendDatatoApi).subscribe(
  //           response => {
  //             swal.fire(succTitle, succMsg, "success");
  //             this.rerender();
  //           },
  //           error => {
  //             this.toasterService.pop(
  //               "error",
  //               "Error",
  //               "Oops! something went wrong !."
  //             );
  //           }
  //         );
  //       } else if (result.dismiss === swal.DismissReason.cancel) {
  //         swal.fire("Cancelled", "", "error");
  //       }
  //     });
  // }

  // deleteBlog(blog_id): void {
  //   var text = "You want to delete this blog?";
  //   var confirmButtonText = "Yes, delete it!";
  //   var confirmButtonColor = "#f63c3a";
  //   var succTitle = "Deleted";
  //   var succMsg = "Blog has been deleted successfully";
  //   swal
  //     .fire({
  //       title: "Are you sure?",
  //       text: text,
  //       type: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: confirmButtonText,
  //       cancelButtonText: "No, cancel!",
  //       reverseButtons: true,
  //       confirmButtonColor: confirmButtonColor
  //     })
  //     .then(result => {
  //       if (result.value) {
  //         let sendDatatoApi = { _id: blog_id };
  //         this.blogManagenentFactory.deleteBlog(sendDatatoApi).subscribe(
  //           response => {
  //             swal.fire(succTitle, succMsg, "success");
  //             this.rerender();
  //           },
  //           error => {
  //             this.toasterService.pop(
  //               "error",
  //               "Error",
  //               "Oops! something went wrong !."
  //             );
  //           }
  //         );
  //       } else if (result.dismiss === swal.DismissReason.cancel) {
  //         swal.fire("Cancelled", "", "error");
  //       }
  //     });
  // }

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
