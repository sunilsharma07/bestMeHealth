import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from "lodash";
import { CookingVideoManagementService } from "./cookingVideoManagement.services";
import { videoType } from "../../commenHelper/config";
import { RecipeManagementService } from "../recipeManagement/recipeManagement.services";

@Component({
  templateUrl: "./add-cookingVideoManagement.component.html"
})
export class AddCookingVideoComponent implements OnInit {
  addCookingVideoForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  videoTypeList = videoType;
  typedropdownSettings = {};
  categoryopdownSettings = {};
  allCategory = [];

  constructor(
    public cookingVideoManagementFactory: CookingVideoManagementService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFactory: AuthService,
    public recipeManagementFactory: RecipeManagementService
  ) {}

  ngOnInit() {
    this.addCookingVideoForm = new FormGroup({
      title: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.white_space_first_char),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      videoUrl: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.url_pattern)
      ]),
      category: new FormControl("", [Validators.required]),
      type: new FormControl("", [Validators.required])
    });

    this.adminDetails = this.authFactory.getAdminDetails();

    this.typedropdownSettings = {
      singleSelection: true,
      idField: "value",
      textField: "key",
      closeDropDownOnSelection: true
    };

    this.categoryopdownSettings = {
      singleSelection: true,
      idField: "_id",
      textField: "name",
      closeDropDownOnSelection: true
    };

    this.getAllCategory();
  }

  getAllCategory() {
    this.recipeManagementFactory.getFoodCategory().subscribe(
      response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          this.allCategory = finalResult.data.foodCategory;
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

  addCookingVideoFormSubmit(): void {
    this.submitted = true;
    if (this.addCookingVideoForm.valid) {
      this.addCookingVideoForm.value.categoryId = this.addCookingVideoForm.value
        .category.length
        ? this.addCookingVideoForm.value.category[0]._id
        : "";
      delete this.addCookingVideoForm.value.category;
      this.addCookingVideoForm.value.type = this.addCookingVideoForm.value.type
        .length
        ? this.addCookingVideoForm.value.type[0].value
        : "";
      this.addCookingVideoForm.value.uploadedBy = this.adminDetails._id;
      this.addCookingVideoForm.value.url = this.addCookingVideoForm.value.videoUrl;
      delete this.addCookingVideoForm.value.videoUrl;
      this.addCookingVideoForm.value.isActive = true;
      this.cookingVideoManagementFactory
        .addNewCookingVideo(this.addCookingVideoForm.value)
        .subscribe(
          response => {
            let finalResult = JSON.parse(JSON.stringify(response));
            if (finalResult.status == 200) {
              this.toasterService.pop(
                "success",
                "Success",
                finalResult.message
              );
              this.router.navigate(["/cookingVideoManagement"]);
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
