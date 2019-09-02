import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { BlogManagementService } from "./blogManagement.services";
import { FileValidator } from '../../commenHelper/file-input.validator'

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  templateUrl: "./details-blogManagement.component.html"
})
export class DetailsBlogmgmtComponent implements OnInit {
  detailsBlogForm: FormGroup;
  submitted: boolean = false;
  blogId: any;
  mediaId: any;
  action: string = "view";
  media;
  isMediaSelected: boolean = false;
  isMediaExtensionError: boolean = false;
  extension: any;
  selectedMediaFile: any;

  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private blogManagementFactory: BlogManagementService,
    private toasterService: ToasterService,
    private router: Router,
    private fileValidator: FileValidator
  ) { }

  public Editor = ClassicEditor;

  ngOnInit(): void {
    this.detailsBlogForm = new FormGroup({
      title: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidate.name_pattern),
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
    this.route.params.subscribe(params => {
      this.blogId = params.blogId;
    });

    this.viewBlogDetails(this.blogId);
  }

  onImageFoundError($event) {
    $event.target.src = `${environment.placeHolderImage}`;
  }

  viewBlogDetails(blog_id): void {
    let blogId = { _id: blog_id };
    this.blogManagementFactory.getBlogDetails(blogId).subscribe(
      response => {
        this.action = "view";
        let getBlogsDetails = JSON.parse(JSON.stringify(response));
        if (getBlogsDetails.data.mediaName && getBlogsDetails.data.mediaName != "") {
          this.media = environment.base_image_url + 'blog/' + getBlogsDetails.data.mediaName;
        } else {
          this.media = environment.placeHolderImage;
        }

        this.detailsBlogForm.patchValue({
          title: getBlogsDetails.data.title || "N/A",
          details: getBlogsDetails.data.details || "N/A",
          media: this.media || "N/A",
        });

        this.mediaId = getBlogsDetails.data.mediaId;
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
          this.isMediaSelected = true;
          this.isMediaExtensionError = true;
        } else {
          this.isMediaSelected = true;
          this.isMediaExtensionError = false;
          this.selectedMediaFile = file;
        }
      }
    } else {
      this.selectedMediaFile = null;
      this.isMediaSelected = false;
      this.isMediaExtensionError = false;
    }
  }

  updateBlogFormSubmit(): void {
    this.submitted = true;
    let formdata: FormData = new FormData();
    if (this.detailsBlogForm.valid && this.isMediaExtensionError == false) {
      delete this.detailsBlogForm.value.media;

      // start : triming form all data
      Object.keys(this.detailsBlogForm.value).map(
        k => (this.detailsBlogForm.value[k] = this.detailsBlogForm.value[k].trim())
      );
      // end : triming form all data

      formdata.append('title', this.detailsBlogForm.value.title.trim());
      formdata.append('details', this.detailsBlogForm.value.details.trim())
      formdata.append('media', this.selectedMediaFile)
      formdata.append('mediaId', this.mediaId)
      formdata.append('blogId', this.blogId)

      this.blogManagementFactory
        .updateBlog(formdata)
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

  enableEdit(): void {
    this.action = "edit";
  }
}
