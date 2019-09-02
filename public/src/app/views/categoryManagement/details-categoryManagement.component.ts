import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { CategoryManagementService } from "./categoryManagement.services";
import { FileValidator } from '../../commenHelper/file-input.validator';
import { categoryTypes } from '../../commenHelper/config';

@Component({
  templateUrl: "./details-categoryManagement.component.html"
})
export class DetailsCategorymgmtComponent implements OnInit {
  detailsForm: FormGroup;
  submitted: boolean = false;
  categoryId: any;
  categoryDetails: any;
  mediaName: any;
  action: string = "view";
  media;
  isFileSelected: boolean = false;
  isFileExtensionError: boolean = false;
  extension: any;
  selectedFile: any;
  categoryTypesList = categoryTypes;
  categoryTypesDropdownSettings = {};

  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private categoryManagementFactory: CategoryManagementService,
    private toasterService: ToasterService,
    private router: Router,
    private fileValidator: FileValidator
  ) { }

  ngOnInit(): void {
    this.detailsForm = new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidate.name_pattern),
        Validators.pattern(this.customValidate.white_space_first_char),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      catType: new FormControl("", [
        Validators.required
      ]),
      media: new FormControl("", [])
    });
    this.route.params.subscribe(params => {
      this.categoryId = params.categoryId;
    });

    this.categoryTypesDropdownSettings = {
      singleSelection: true,
      idField: "key",
      textField: "value",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
      closeDropDownOnSelection: true
    };

    this.viewDetails(this.categoryId);
  }

  onImageFoundError($event) {
    $event.target.src = `${environment.placeHolderImage}`;
  }

  viewDetails(category_id): void {
    let categoryId = { _id: category_id };
    this.categoryManagementFactory.getCategoryDetails(categoryId).subscribe(
      response => {
        this.action = "view";
        let getDetails = JSON.parse(JSON.stringify(response));
        this.categoryDetails = getDetails.data;
        if (getDetails.data.mediaName && getDetails.data.mediaName != "") {
          this.media = environment.base_image_url + 'category/' + getDetails.data.mediaName;
        } else {
          this.media = environment.placeHolderImage;
        }

        this.detailsForm.patchValue({
          name: getDetails.data.name || "N/A",
          catType: getDetails.data.catType || "N/A"
        });

        this.mediaName = getDetails.data.mediaName;
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

  onFileChange(e) {
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      if (file) {
        if (!this.fileValidator.validateImageFile(file.name)) {
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

  updateFormSubmit(): void {
    this.submitted = true;
    let formdata: FormData = new FormData();
    if (this.detailsForm.valid && this.isFileExtensionError == false) {
      delete this.detailsForm.value.media;
      if (this.detailsForm.value.catType.length) {
        if (typeof this.detailsForm.value.catType[0].value != 'undefined') {
          this.detailsForm.value.catType = this.detailsForm.value.catType[0].value;
        } else {
          this.detailsForm.value.catType = this.detailsForm.value.catType[0];
        }
      }

      formdata.append('name', this.detailsForm.value.name.trim());
      formdata.append('catType', this.detailsForm.value.catType);
      formdata.append('media', this.selectedFile)
      formdata.append('categoryId', this.categoryId)

      this.categoryManagementFactory
        .updateCategory(formdata)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/categoryManagement"]);
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

  enableEdit(): void {
    this.action = "edit";

    this.detailsForm.patchValue({
      catType: [this.categoryDetails.catType]
    });
  }
}
