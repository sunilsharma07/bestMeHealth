import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import * as _ from "lodash";
import { RecipeManagementService } from "./recipeManagement.services";
import { foodType } from "../../commenHelper/config";
import { FileValidator } from "../../commenHelper/file-input.validator";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";

@Component({
  templateUrl: "./add-recipeManagement.component.html"
})
export class AddRecipeComponent implements OnInit {
  addRecipeForm: FormGroup;
  submitted: boolean = false;
  partialSubmmit: boolean = false;
  adminDetails: any;
  foodTypeDropdownSettings = {};
  ingredientsDropdownSettings = {};
  foodCategoryDropdownSettings = {};
  foodType = [];
  allIngredients = [];
  allFoodCategory = [];
  isMediaSelected: boolean = false;
  isMediaExtensionError: boolean = false;
  selectedMediaFile: any;

  constructor(
    public recipeManagementFactory: RecipeManagementService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFactory: AuthService,
    private fileValidator: FileValidator,
    private _fb: FormBuilder
  ) {}

  public Editor = ClassicEditor;

  ngOnInit() {
    this.foodType = foodType;
    this.getIngredients();
    this.getFoodCategory();
    this.addRecipeForm = new FormGroup({
      title: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.white_space_first_char)
      ]),
      foodType: new FormControl("", [Validators.required]),
      prepTime: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.number_pattern),
        Validators.maxLength(5)
      ]),
      serves: new FormControl("", [
        Validators.required,
        Validators.pattern(this.customValidation.number_pattern),
        Validators.maxLength(5)
      ]),
      media: new FormControl("", [FileValidator.validate]),
      directions: new FormControl("", [
        Validators.required
        // Validators.pattern(this.customValidation.white_space_first_char)
      ]),
      foodCategory: new FormControl("", [Validators.required]),
      recipeForSale: new FormControl("no", [Validators.required]),
      recipePrice: new FormControl("", [
        Validators.pattern(this.customValidation.recipe_price),
        Validators.pattern(this.customValidation.white_space_first_char)
      ]),
      ingredients: this._fb.array([this.initIngredientsFields()])
    });

    this.adminDetails = this.authFactory.getAdminDetails();
    this.foodTypeDropdownSettings = {
      singleSelection: true,
      idField: "value",
      textField: "key",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
      closeDropDownOnSelection: true
    };
    this.ingredientsDropdownSettings = {
      singleSelection: true,
      idField: "_id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
      closeDropDownOnSelection: true
    };
    this.foodCategoryDropdownSettings = {
      singleSelection: true,
      idField: "_id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
      closeDropDownOnSelection: true
    };
  }

  get ingredientsData() {
    return <FormArray>this.addRecipeForm.get("ingredients");
  }

  initIngredientsFields(
    title: string = "",
    qty: string = "",
    measure: string = ""
  ) {
    return this._fb.group({
      title: [title, Validators.compose([Validators.required])],
      qty: [
        qty,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.customValidation.number_pattern),
          Validators.maxLength(5)
        ])
      ],
      measure: [
        measure,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.customValidation.white_space_first_char)
        ])
      ]
    });
  }

  addNewIngredients(i) {
    if (
      this.addRecipeForm.controls.ingredients["controls"][i].controls.title
        .invalid ||
      this.addRecipeForm.controls.ingredients["controls"][i].controls.qty
        .invalid ||
      this.addRecipeForm.controls.ingredients["controls"][i].controls.measure
        .invalid
    ) {
      this.partialSubmmit = true;
    } else {
      const ingredientsFieldsControl = <FormArray>(
        this.addRecipeForm.controls["ingredients"]
      );
      ingredientsFieldsControl.push(this.initIngredientsFields("", "", ""));
      this.partialSubmmit = false;
    }
  }

  removeNewIngredients(i) {
    const control = <FormArray>this.addRecipeForm.controls["ingredients"];
    control.removeAt(i);
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

  getIngredients() {
    this.recipeManagementFactory.getIngredients().subscribe(
      response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          this.allIngredients = finalResult.data.ingredients;
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

  getFoodCategory() {
    this.recipeManagementFactory.getFoodCategory().subscribe(
      response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          this.allFoodCategory = finalResult.data.foodCategory;
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

  addRecipeFormSubmit(): void {
    let formdata: FormData = new FormData();
    formdata.append("title", this.addRecipeForm.value.title);
    formdata.append("prepTime", this.addRecipeForm.value.prepTime);
    formdata.append("serves", this.addRecipeForm.value.serves);
    formdata.append("recipeForSale", this.addRecipeForm.value.recipeForSale);
    formdata.append("directions", this.addRecipeForm.value.directions);
    formdata.append("media", this.selectedMediaFile);
    this.submitted = true;
    if (
      this.addRecipeForm.valid &&
      (this.addRecipeForm.value.recipeForSale == "no" ||
        this.addRecipeForm.value.recipePrice > 0)
    ) {
      let foodType = this.addRecipeForm.value.foodType.length
        ? this.addRecipeForm.value.foodType[0].value
        : "";
      let foodCategory = this.addRecipeForm.value.foodCategory.length
        ? this.addRecipeForm.value.foodCategory[0]._id
        : "";
      formdata.append("foodType", foodType);
      formdata.append("foodCategory", foodCategory);

      if (
        this.addRecipeForm.value.recipeForSale == "no" ||
        !this.addRecipeForm.value.recipePrice ||
        this.addRecipeForm.value.recipePrice < 0
      ) {
        this.addRecipeForm.value.recipePrice = 0;
      }
      formdata.append("recipePrice", this.addRecipeForm.value.recipePrice);
      if (this.addRecipeForm.value.ingredients.length) {
        let getIng = _.map(this.addRecipeForm.value.ingredients, ing => {
          if (ing.title.length) {
            ing.title = ing.title[0]._id;
          }
          return ing;
        });
        formdata.append("ingredients", JSON.stringify(getIng));
      } else {
        let getIng: any = [];
        formdata.append("ingredients", JSON.stringify(getIng));
      }
      this.recipeManagementFactory.addRecipe(formdata).subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.toasterService.pop("success", "Success", finalResult.message);
            this.router.navigate(["/recipeManagement"]);
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
