import { Component, OnInit, ViewChild, Input } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { AuthService } from "../../commenHelper/auth.services";
import { MealPlanService } from "./mealPlanManagement.services";
import { Subject } from "rxjs";
import Swal from "sweetalert2";
import { accordianGroupForMealPlan } from "../../commenHelper/config";
import { TabsetComponent } from "ngx-bootstrap/tabs";

@Component({
  selector: "app-MealPlan",
  templateUrl: "./mealPlanManagement.component.html"
})
export class MealPlanComponent implements OnInit {
  @ViewChild("staticTabs") staticTabs: TabsetComponent;
  mealPlanForm: FormGroup;
  submitted: boolean = false;
  adminDetails;
  day: string = "Day 1";
  customClass: string = "customClass";
  mealPlanTime = accordianGroupForMealPlan;
  breakFastPartialSubmmit: boolean = false;
  lunchPartialSubmmit: boolean = false;
  dinnerPartialSubmmit: boolean = false;
  allFoodCategory = [];
  foodCategoryDropdownSettings = {};
  userName: string;

  dayListArr = ["day 1", "day 2", "day 3", "day 4", "day 5", "day 6", "day 7"];

  constructor(
    public route: ActivatedRoute,
    public mealPlanFactory: MealPlanService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFacotry: AuthService,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userName = atob(params.userName);
    });
    this.disabledTabs();
    this.mealPlanForm = new FormGroup({
      startDate: new FormControl(new Date(), Validators.required),
      breakFastFormsAttr: this._fb.array([this.dynamicAddFormsFields()]),
      lunchFormsAttr: this._fb.array([this.dynamicAddFormsFields()]),
      dinnerFormsAttr: this._fb.array([this.dynamicAddFormsFields()])
    });
    this.adminDetails = this.authFacotry.getAdminDetails();
    this.getFoodCategory();
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

  getFoodCategory() {
    this.mealPlanFactory.getFoodCategory().subscribe(
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

  dynamicAddFormsFields(
    qty: string = "",
    measure: string = "",
    protin: string = "",
    fat: string = "",
    carbs: string = "",
    calories: string = "",
    foodCategory: string = ""
  ) {
    return this._fb.group({
      qty: [qty, Validators.compose([Validators.required])],
      measure: [measure, Validators.compose([Validators.required])],
      protin: [protin, Validators.compose([Validators.required])],
      fat: [fat, Validators.compose([Validators.required])],
      carbs: [carbs, Validators.compose([Validators.required])],
      calories: [calories, Validators.compose([Validators.required])],
      foodCategory: [foodCategory, Validators.compose([Validators.required])]
    });
  }

  get breakFastFormsData() {
    return <FormArray>this.mealPlanForm.get("breakFastFormsAttr");
  }

  get lunchFormsData() {
    return <FormArray>this.mealPlanForm.get("lunchFormsAttr");
  }

  get dinnerFormsData() {
    return <FormArray>this.mealPlanForm.get("dinnerFormsAttr");
  }

  addFormFields(i, formsElement) {
    if (
      this.mealPlanForm.controls[formsElement]["controls"][i].controls.qty
        .invalid ||
      this.mealPlanForm.controls[formsElement]["controls"][i].controls.measure
        .invalid ||
      this.mealPlanForm.controls[formsElement]["controls"][i].controls.protin
        .invalid ||
      this.mealPlanForm.controls[formsElement]["controls"][i].controls.fat
        .invalid ||
      this.mealPlanForm.controls[formsElement]["controls"][i].controls.carbs
        .invalid ||
      this.mealPlanForm.controls[formsElement]["controls"][i].controls.calories
        .invalid
    ) {
      if (formsElement == "breakFastFormsAttr") {
        this.breakFastPartialSubmmit = true;
      } else if (formsElement == "lunchFormsAttr") {
        this.lunchPartialSubmmit = true;
      } else {
        this.dinnerPartialSubmmit = true;
      }
    } else {
      const ingredientsFieldsControl = <FormArray>(
        this.mealPlanForm.controls[formsElement]
      );
      ingredientsFieldsControl.push(
        this.dynamicAddFormsFields("", "", "", "", "", "")
      );
      if (formsElement == "breakFastFormsAttr") {
        this.breakFastPartialSubmmit = false;
      } else if (formsElement == "lunchFormsAttr") {
        this.lunchPartialSubmmit = false;
      } else {
        this.dinnerPartialSubmmit = false;
      }
    }
  }

  removeFormFields(i, formsElement) {
    const control = <FormArray>this.mealPlanForm.controls[formsElement];
    control.removeAt(i);
  }

  onTabSelect(e): void {
    this.day = e.heading;
  }

  disabledTabs() {
    this.staticTabs.tabs[1].disabled = true;
    this.staticTabs.tabs[2].disabled = true;
    this.staticTabs.tabs[3].disabled = true;
    this.staticTabs.tabs[4].disabled = true;
    this.staticTabs.tabs[5].disabled = true;
    this.staticTabs.tabs[6].disabled = true;
  }

  accOpenEvent(event, i) {}

  mealPlanFormSubmit() {
    this.submitted = true;
    if (this.mealPlanForm.valid) {
      console.log(this.mealPlanForm.value);
    }
  }
}
