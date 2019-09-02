import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { ReportManagementService } from "./reportManagement.services";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';
import swal from "sweetalert2";
import { FileValidator } from '../../commenHelper/file-input.validator';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
    templateUrl: "./add-fit132ReportManagement.component.html"
})
export class AddFit132ReportComponent implements OnInit {
    addForm: FormGroup;
    uploadForm: FormGroup;
    submitted: boolean = false;
    adminDetails: any;
    customerId: any;
    reportAddType: any;
    tempReportData = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    isFileSelected: boolean = false;
    isFileExtensionError: boolean = false;
    extension: any;
    selectedFile: any;
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    constructor(
        public route: ActivatedRoute,
        public reportManagementFactory: ReportManagementService,
        public toasterService: ToasterService,
        public router: Router,
        public customValidation: CustomValidation,
        public authFactory: AuthService,
        private fileValidator: FileValidator
    ) { }

    ngOnInit() {

        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 10,
            columnDefs: [{
                targets: [12],
                orderable: false,
            }]
        };

        this.addForm = new FormGroup({
            RowID: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ]),
            CreatedDate: new FormControl("", [
                Validators.required
            ]),
            CreatedBy: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ]),
            FrequencyID: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ]),
            AntigenID: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ]),
            AntigenName: new FormControl("", [
                Validators.required
            ]),
            TestID: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ]),
            category: new FormControl("", [
                Validators.required
            ]),
            Plate: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.only_char_pattern)
            ]),
            Lot: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ]),
            Rev: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.ODValue)
            ]),
            ODValue: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.ODValue)
            ]),
            TestNum: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ])
        });

        this.uploadForm = new FormGroup({
            reportFile: new FormControl("", [
                FileValidator.validate
            ])
        });

        this.route.params.subscribe(params => {
            this.customerId = params.customerId;
            this.reportAddType = params.reportAddType;
        });

        this.adminDetails = this.authFactory.getAdminDetails();

        this.reportManagementFactory
            .getTempRecord({ userId: this.adminDetails._id })
            .subscribe(
                response => {
                    let finalResult = JSON.parse(JSON.stringify(response));
                    if (finalResult.status == 200) {
                        this.tempReportData = finalResult.data.report;
                    }
                    this.dtTrigger.next();
                }
            );
    }

    onFileChange(e) {
        if (e.target.files.length > 0) {
            let file = e.target.files[0];
            if (file) {
                if (!this.fileValidator.validateCsvFile(file.name)) {
                    this.isFileSelected = true;
                    this.isFileExtensionError = true;
                } else {
                    this.isFileSelected = true;
                    this.isFileExtensionError = false;
                    this.selectedFile = file;
                }
            }
        } else {
            this.selectedFile = null;
            this.isFileSelected = false;
            this.isFileExtensionError = false;
        }
    }

    addFormSubmit(): void {
        this.submitted = true;
        if (this.addForm.valid) {
            let formData = _.clone(this.addForm.value)
            formData.userId = this.adminDetails._id;

            this.reportManagementFactory
                .addTempRecord(formData)
                .subscribe(
                    response => {
                        let finalResult = JSON.parse(JSON.stringify(response));
                        if (finalResult.status == 200) {
                            this.toasterService.pop(
                                "success",
                                "Success",
                                finalResult.message
                            );
                            this.tempReportData.push(formData);

                            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                                dtInstance.destroy();
                                this.dtTrigger.next();
                            });

                            this.submitted = false;
                            this.addForm.reset();
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

    deleteTempRecord(record_id, tempIndex): void {
        var text = "You want to delete this record?";
        var confirmButtonText = "Yes, delete it!";
        var confirmButtonColor = "#f63c3a";
        var succTitle = "Deleted";
        var succMsg = "Record has been deleted successfully";
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
                    let sendDatatoApi = { _id: record_id };
                    this.reportManagementFactory
                        .deleteTempRecord(sendDatatoApi)
                        .subscribe(
                            response => {
                                this.tempReportData.splice(tempIndex, 1);
                                swal.fire(succTitle, succMsg, "success");
                                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                                    dtInstance.destroy();
                                    this.dtTrigger.next();
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
                } else if (result.dismiss === swal.DismissReason.cancel) {
                    swal.fire("Cancelled", "", "error");
                }
            });
    }

    saveTestReport(): void {
        if (this.tempReportData.length) {
            var text = "You want to generate test report?";
            var confirmButtonText = "Yes, generate it!";
            var confirmButtonColor = "#f63c3a";
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
                        let sendDatatoApi = {
                            userId: this.adminDetails._id,
                            customerId: this.customerId,
                            reportType: 'fit132',
                            reportData: this.tempReportData
                        };
                        this.reportManagementFactory
                            .addTestReport(sendDatatoApi)
                            .subscribe(
                                response => {
                                    let finalResult = JSON.parse(JSON.stringify(response));
                                    if (finalResult.status == 200) {
                                        this.toasterService.pop(
                                            "success",
                                            "Success",
                                            finalResult.message
                                        );
                                        this.tempReportData = [];
                                        this.router.navigate(["/reportManagement", this.customerId]);
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
                    } else if (result.dismiss === swal.DismissReason.cancel) {
                        swal.fire("Cancelled", "", "error");
                    }
                });
        } else {
            this.toasterService.pop(
                "error",
                "Error",
                "Please insert atleast one record."
            );
        }

    }

    uploadFormSubmit(): void {
        this.submitted = true;
        let formdata: FormData = new FormData();
        if (this.uploadForm.valid && this.isFileExtensionError == false) {
            delete this.uploadForm.value.media;

            // start : triming form all data
            Object.keys(this.uploadForm.value).map(
                k => (this.uploadForm.value[k] = this.uploadForm.value[k].trim())
            );
            // end : triming form all data

            formdata.append('reportFile', this.selectedFile)
            formdata.append('reportType', 'fit132')
            formdata.append('userId', this.adminDetails._id)
            formdata.append('customerId', this.customerId)

            this.reportManagementFactory
                .uploadTestReport(formdata)
                .subscribe(
                    response => {
                        let finalResult = JSON.parse(JSON.stringify(response));
                        if (finalResult.status == 200) {
                            this.toasterService.pop(
                                "success",
                                "Success",
                                finalResult.message
                            );
                            this.router.navigate(["/reportManagement", this.customerId]);
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
}
