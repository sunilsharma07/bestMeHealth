import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { RecipeManagementService } from "./recipeManagement.services";

@Component({
  templateUrl: "./details-recipeManagement.component.html"
})
export class DetailsRecipemgmtComponent implements OnInit {
  detailsRecipeForm: FormGroup;
  submitted: boolean = false;
  recipeId: any;
  action: string = "view";
  recipePic;
  cusingredients = [];
  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private recipeManagementFactory: RecipeManagementService,
    private toasterService: ToasterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.detailsRecipeForm = new FormGroup({
      title: new FormControl("", []),
      category: new FormControl("", []),
      foodType: new FormControl("", []),
      prepTime: new FormControl("", []),
      serves: new FormControl("", []),
      ingredients: new FormControl("", []),
      directions: new FormControl("", []),
      recipeForSale: new FormControl("", []),
      recipePrice: new FormControl("", []),
      recipePic: new FormControl("", [])
    });
    this.route.params.subscribe(params => {
      this.recipeId = params.recipeId;
    });
    this.viewRecipeDetails(this.recipeId);
  }

  onImageFoundError($event) {
    $event.target.src = `${environment.placeHolderImage}`;
  }

  viewRecipeDetails(recipe_id): void {
    let recipeId = { _id: recipe_id };
    let displayFoodType;
    this.recipeManagementFactory.getRecipeDetails(recipeId).subscribe(
      response => {
        this.action = "view";
        let getRecipeDetails = JSON.parse(JSON.stringify(response));
        if (
          getRecipeDetails.data.mediaName &&
          getRecipeDetails.data.mediaName != ""
        ) {
          this.recipePic =
            environment.base_image_url +
            "recipe/" +
            getRecipeDetails.data.mediaName;
        } else {
          this.recipePic = environment.placeHolderImage;
        }
        // Display Food Type
        if (
          getRecipeDetails.data.foodType &&
          getRecipeDetails.data.foodType == "veg"
        ) {
          displayFoodType = "Veg";
        } else if (
          getRecipeDetails.data.foodType &&
          getRecipeDetails.data.foodType == "nonveg"
        ) {
          displayFoodType = "Non-Veg";
        } else if (
          getRecipeDetails.data.foodType &&
          getRecipeDetails.data.foodType == "vegan"
        ) {
          displayFoodType = "Vegan";
        } else {
          displayFoodType = "N/A";
        }
        // Ingredients
        if (getRecipeDetails.data.ingredients.length) {
          this.cusingredients = getRecipeDetails.data.ingredients;
        }
        this.detailsRecipeForm.patchValue({
          title: getRecipeDetails.data.title || "N/A",
          category: getRecipeDetails.data.category || "N/A",
          foodType: displayFoodType,
          prepTime: getRecipeDetails.data.prepTime || "N/A",
          serves: getRecipeDetails.data.serves || "N/A",
          directions: getRecipeDetails.data.directions || "N/A",
          recipePic: this.recipePic,
          recipeForSale: getRecipeDetails.data.recipeForSale || "N/A",
          recipePrice: getRecipeDetails.data.recipePrice || "N/A"
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
}
