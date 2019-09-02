import {
  Component,
  OnInit
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ToasterService } from "angular2-toaster";
import { ReportManagementService } from "./reportManagement.services";
import swal from "sweetalert2";
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: "reportManagement.component.html"
})
export class ReportManagementComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  reportsData: Array<any>;
  customerId: any;

  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    public reportManagenentFactory: ReportManagementService,
    public toasterService: ToasterService,
    public route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      columnDefs: [{
        targets: [3],
        orderable: false,
      }]
    };

    this.route.params.subscribe(params => {
      this.customerId = params.customerId;
    });

    this.getTestReportListing();
  }

  getTestReportListing(): void {
    this.reportManagenentFactory
      .getAllTestListing({ customerId: this.customerId })
      .subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.reportsData = finalResult.data.allReports;
          }
          this.dtTrigger.next();
        }
      );
  }
}
