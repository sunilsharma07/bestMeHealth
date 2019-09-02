import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { ReportManagementService } from "./reportManagement.services";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from 'lodash';
import swal from "sweetalert2";
import { Subject } from 'rxjs';

@Component({
    templateUrl: "./add-micronutrientsReportManagement.component.html"
})
export class AddMicronutrientsReportComponent implements OnInit {
    addForm: FormGroup;
    submitted: boolean = false;
    adminDetails: any;
    customerId: any;
    categoryList = [];
    categoryContentList = [];
    categoryDropdownSettings = {};
    contentDropdownSettings = {};
    formElements = [];

    constructor(
        public route: ActivatedRoute,
        public reportManagementFactory: ReportManagementService,
        public toasterService: ToasterService,
        public router: Router,
        public customValidation: CustomValidation,
        public authFactory: AuthService,
        private _fb: FormBuilder,
    ) { }

    ngOnInit() {

        this.formElements = [
            {
                'categoryId': '',
                'contentId': '',
                'result': ''
            }
        ];

        this.addForm = new FormGroup({
            formData: this._fb.array([this.initFormElements()])
        });

        this.route.params.subscribe(params => {
            this.customerId = params.customerId;
        });

        this.adminDetails = this.authFactory.getAdminDetails();

        this.categoryDropdownSettings = {
            singleSelection: true,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 3,
            allowSearchFilter: true,
            closeDropDownOnSelection: true
        };

        this.contentDropdownSettings = {
            singleSelection: true,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 3,
            allowSearchFilter: true,
            closeDropDownOnSelection: true
        };

        this.initCategory();
        this.initCategoryContent();
    }

    initCategory() {
        this.reportManagementFactory
            .getCategory()
            .subscribe(
                response => {
                    let finalResult = JSON.parse(JSON.stringify(response));
                    if (finalResult.status == 200 && finalResult.data.allCategory.length) {
                        this.categoryList = finalResult.data.allCategory;
                    }
                }
            );
    }

    initCategoryContent() {
        this.reportManagementFactory
            .getCategoryContent()
            .subscribe(
                response => {
                    let finalResult = JSON.parse(JSON.stringify(response));
                    if (finalResult.status == 200 && finalResult.data.allContent.length) {
                        this.categoryContentList = finalResult.data.allContent;
                    }
                }
            );
    }

    initFormElements() {
        return this._fb.group({
            categoryId: new FormControl("", [
                Validators.required
            ]),
            contentId: new FormControl("", [
                Validators.required
            ]),
            result: new FormControl("", [
                Validators.required,
                Validators.pattern(this.customValidation.number_pattern_with_zero)
            ])
        });
    }

    get formElemets() { return <FormArray>this.addForm.get('formData'); }

    addFormElements() {
        this.submitted = true;
        if (this.addForm.valid) {
            this.submitted = false;
            const checkListControl = <FormArray>this.addForm.controls['formData'];
            checkListControl.push(this.initFormElements());
        }
    }

    /**
     * Remove check list by index from lits of check box
     * @param i 
     */
    removeFormElements(i) {
        const control = <FormArray>this.addForm.controls['formData'];
        control.removeAt(i);
    }

    onCategorySelect(event) {

    }

    onContentSelect(event) {

    }

    addFormSubmit(): void {
        this.submitted = true;
        if (this.addForm.valid) {

            // Mapping form data
            let formData = _.clone(this.addForm.value)
            formData.userId = this.adminDetails._id;
            formData.customerId = this.customerId;

            formData.formData = _.map(formData.formData, function (el) {
                if (el.categoryId.length) {
                    el.categoryId = el.categoryId[0]['_id'];
                }
                if (el.contentId.length) {
                    el.contentId = el.contentId[0]['_id'];
                }
                return el;
            });
            // Mapping form data upto here

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
                        this.reportManagementFactory
                            .addMicronutrientsTestReport(formData)
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
                    } else if (result.dismiss === swal.DismissReason.cancel) {
                        swal.fire("Cancelled", "", "error");
                    }
                });
        }
    }
}
