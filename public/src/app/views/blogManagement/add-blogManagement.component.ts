import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { BlogManagementService } from "./blogManagement.services";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { FileValidator } from '../../commenHelper/file-input.validator'

@Component({
  templateUrl: "./add-blogManagement.component.html"
})
export class AddBlogComponent implements OnInit {
  addBlogForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  isMediaSelected: boolean = false;
  isMediaExtensionError: boolean = false;
  extension: any;
  selectedMediaFile: any;
  previewImage: String = "";

  constructor(
    public blogManagementFactory: BlogManagementService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFactory: AuthService,
    private fileValidator: FileValidator
  ) { }

  public Editor = ClassicEditor;

  // public onChange({ editor }: ChangeEvent) {
  //   const data = editor.getData();
  //   console.log(data);
  // }

  ngOnInit() {
    this.addBlogForm = new FormGroup({
      title: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.name_pattern),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      details: new FormControl("", [
        Validators.required
      ]),
      media: new FormControl("", [
        FileValidator.validate
      ])
    });

    this.adminDetails = this.authFactory.getAdminDetails();
  }

  onFileChange(e) {
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      if (file) {
        if (!this.fileValidator.validateImageFile(file.name)) {
          this.isMediaSelected = true;
          this.isMediaExtensionError = true;
        } else {
          this.isMediaSelected = true;
          this.isMediaExtensionError = false;
          // this.extension = file.name.split(".").pop();
          // let reader = new FileReader();
          // reader.onload = (e: any) => {
          //   var image = new Image();
          //   image.src = e.target.result;
          //   this.previewImage = e.target.result;
          // };
          // reader.readAsDataURL(e.target.files[0]);
          this.selectedMediaFile = file;
        }
      }
    } else {
      this.previewImage = "";
      this.selectedMediaFile = null;
      this.isMediaSelected = false;
      this.isMediaExtensionError = false;
    }
  }

  addBlogFormSubmit(): void {
    this.submitted = true;
    let formdata: FormData = new FormData();
    if (this.addBlogForm.valid && this.isMediaExtensionError == false) {
      delete this.addBlogForm.value.media;

      // start : triming form all data
      Object.keys(this.addBlogForm.value).map(
        k => (this.addBlogForm.value[k] = this.addBlogForm.value[k].trim())
      );
      // end : triming form all data

      formdata.append('title', this.addBlogForm.value.title.trim());
      formdata.append('details', this.addBlogForm.value.details.trim())
      formdata.append('createdBy', this.adminDetails._id)
      formdata.append('media', this.selectedMediaFile)

      this.blogManagementFactory
        .addNewBlog(formdata)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/blogManagement"]);
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
