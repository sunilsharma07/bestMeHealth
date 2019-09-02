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
import { FeedbackManagementService } from "./feedbackManagement.services";

@Component({
  templateUrl: "feedbackManagement.component.html"
})
export class FeedbackManagementComponent implements AfterViewInit, OnInit {
  dtOptions: DataTables.Settings = {};
  feedback: Array<any>;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public feedbackFactory: FeedbackManagementService,
    public toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getAllFeedbackListing();
  }

  getAllFeedbackListing() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.feedbackFactory
          .getAllFeedbackListing(dataTablesParameters)
          .subscribe(
            respones => {
              let resData = JSON.parse(JSON.stringify(respones));
              this.feedback = resData.data.data;
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
        { data: "userId", searchable: false, orderable: false },
        { data: "type" },
        { data: "reaction" },
        { data: "createdAt" },
        { data: "message", searchable: false, orderable: false }
      ]
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
}
