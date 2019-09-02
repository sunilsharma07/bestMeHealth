import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ToasterService } from "angular2-toaster";
import swal from "sweetalert2";
import { CookingVideoManagementService } from "./cookingVideoManagement.services";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  templateUrl: "cookingVideoManagement.component.html"
})
export class CookingVideoManagementComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  cookingVideos: any;
  videoUrl;

  constructor(
    private http: HttpClient,
    public cookingVideoManagenentFactory: CookingVideoManagementService,
    public toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getCookingVideoListing();
  }

  getCookingVideoListing(): void {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      retrieve: true,
      columns: [
        { title: "Title" },
        { title: "Category" },
        { title: "Added By" },
        { title: "Type" },
        { title: "Video", searchable: false, orderable: false },
        { title: "Action", searchable: false, orderable: false }
      ]
    };
    this.cookingVideoManagenentFactory.getCookingVideoListing().subscribe(
      response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          this.cookingVideos = finalResult.data;
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

  // changedCookingVideoStatus(blog_id, type): void {
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
}
