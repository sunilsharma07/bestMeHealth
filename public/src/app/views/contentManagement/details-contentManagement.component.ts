import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ContentManagementService } from "./contentManagement.services";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";

@Component({
  templateUrl: "./details-contentManagement.component.html"
})
export class DetailsContentmgmtComponent implements OnInit {
  contentDetailsForm: FormGroup;
  submitted: boolean = false;
  contentId: any;
  action: string = "view";

  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private contentManagementFactory: ContentManagementService,
    private toasterService: ToasterService,
    private router: Router
  ) {}

  public Editor = ClassicEditor;

  ngOnInit(): void {
    this.contentDetailsForm = new FormGroup({
      title: new FormControl("", []),
      description: new FormControl("", [Validators.required])
    });
    this.route.params.subscribe(params => {
      this.contentId = params.contentId;
    });

    this.viewContentDetails();
  }

  viewContentDetails(): void {
    let categoryId = { _id: this.contentId };
    this.contentManagementFactory.getContentDetails(categoryId).subscribe(
      response => {
        this.action = "view";
        let getContentDetails = JSON.parse(JSON.stringify(response));
        this.contentDetailsForm.patchValue({
          title: getContentDetails.data.title || "N/A",
          description: getContentDetails.data.description || "N/A"
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
  }

  updatecontentDetailsFormSubmit(): void {
    this.submitted = true;
    if (this.contentDetailsForm.valid) {
      delete this.contentDetailsForm.value.title;
      this.contentDetailsForm.value._id = this.contentId;
      this.contentDetailsForm.value.description = this.contentDetailsForm.value.description.trim();
      this.contentManagementFactory
        .updateContent(this.contentDetailsForm.value)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/contentManagement"]);
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
