import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { CategoryManagementService } from "./categoryManagement.services";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import { FileValidator } from '../../commenHelper/file-input.validator';
import { categoryTypes } from '../../commenHelper/config';


@Component({
  templateUrl: "./add-categoryManagement.component.html"
})
export class AddCategoryComponent implements OnInit {
  addForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  isFileSelected: boolean = false;
  isFileExtensionError: boolean = false;
  extension: any;
  selectedFile: any;
  categoryTypesList = categoryTypes;
  categoryTypesDropdownSettings = {};

  constructor(
    public categoryManagementFactory: CategoryManagementService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFactory: AuthService,
    private fileValidator: FileValidator
  ) { }

  ngOnInit() {
    this.addForm = new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.name_pattern),
        Validators.pattern(this.customValidation.white_space_first_char),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      catType: new FormControl("", [
        Validators.required
      ]),
      media: new FormControl("", [])
    });

    this.adminDetails = this.authFactory.getAdminDetails();

    this.categoryTypesDropdownSettings = {
      singleSelection: true,
      idField: "key",
      textField: "value",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
      closeDropDownOnSelection: true
    };
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

  addFormSubmit(): void {
    this.submitted = true;
    let formdata: FormData = new FormData();
    if (this.addForm.valid && this.isFileExtensionError == false) {
      delete this.addForm.value.media;
      this.addForm.value.catType = this.addForm.value.catType[0].value;

      formdata.append('name', this.addForm.value.name.trim());
      formdata.append('catType', this.addForm.value.catType);
      formdata.append('media', this.selectedFile)

      this.categoryManagementFactory
        .addNewCategory(formdata)
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
}
