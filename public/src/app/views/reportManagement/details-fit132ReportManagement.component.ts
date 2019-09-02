import { Component, OnInit, ViewChild } from "@angular/core";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { ReportManagementService } from "./reportManagement.services";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
    templateUrl: "./details-fit132ReportManagement.component.html"
})
export class DetailsFit132ReportComponent implements OnInit {
    debugger;
    adminDetails: any;
    reportId: any;
    customerId: any;
    ingredeintsResult = {};
    reportResults: any = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
    }

    constructor(
        public route: ActivatedRoute,
        public reportManagementFactory: ReportManagementService,
        public toasterService: ToasterService,
        public router: Router,
        public authFactory: AuthService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.reportId = params.reportId;
        });
        this.adminDetails = this.authFactory.getAdminDetails();

        this.reportManagementFactory
            .getFit132ReportResult({ reportId: this.reportId })
            .subscribe(
                response => {
                    let finalResult = JSON.parse(JSON.stringify(response));
                    if (finalResult.status == 200) {

                        if (typeof finalResult.data.customerId != 'undefined' && finalResult.data.customerId != '') {
                            this.customerId = finalResult.data.customerId;
                        }

                        if (typeof finalResult.data.reportData[1] != 'undefined' && finalResult.data.reportData[1] != '') {
                            this.reportResults[1] = finalResult.data.reportData[1];
                        }
                        if (typeof finalResult.data.reportData[2] != 'undefined' && finalResult.data.reportData[2] != '') {
                            this.reportResults[2] = finalResult.data.reportData[2];
                        }
                        if (typeof finalResult.data.reportData[3] != 'undefined' && finalResult.data.reportData[3] != '') {
                            this.reportResults[3] = finalResult.data.reportData[3];
                        }
                        if (typeof finalResult.data.reportData[4] != 'undefined' && finalResult.data.reportData[4] != '') {
                            this.reportResults[4] = finalResult.data.reportData[4];
                        }
                        if (typeof finalResult.data.reportData[5] != 'undefined' && finalResult.data.reportData[5] != '') {
                            this.reportResults[5] = finalResult.data.reportData[5];
                        }

                        this.ingredeintsResult = finalResult.data.ingredeintsData;
                    }
                }
            );
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

    getIngredeintsName(ingID) {
        let IngName = _.find(this.ingredeintsResult, function (ing) {
            return ing['_id'] == ingID;
        });
        if (typeof IngName == 'undefined' || IngName == '') {
            IngName = ingID
        } else {
            IngName = IngName.name;
        }
        return IngName;
    }

    updateReport(): void {
        console.log(this.reportResults)
        this.reportManagementFactory
            .updateFit132ReportResult({
                reportId: this.reportId,
                reportResult: JSON.stringify(this.reportResults)
            })
            .subscribe(
                response => {
                    let finalResult = JSON.parse(JSON.stringify(response));
                    if (finalResult.status == 200) {
                        this.toasterService.pop(
                            "success",
                            "Success",
                            finalResult.message
                        );
                    } else {
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
