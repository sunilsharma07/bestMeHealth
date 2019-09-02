import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { CookingVideoManagementService } from "./cookingVideoManagement.services";
import { CookingVideoManagementComponent } from "./cookingVideoManagement.component";
import { AddCookingVideoComponent } from "./add-cookingVideoManagement.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { RecipeManagementService } from "../recipeManagement/recipeManagement.services";

const routes: Routes = [
  {
    path: "",
    component: CookingVideoManagementComponent
  },
  {
    path: "addCookingVideo",
    component: AddCookingVideoComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgMultiSelectDropDownModule
  ],
  declarations: [CookingVideoManagementComponent, AddCookingVideoComponent],
  providers: [
    CookingVideoManagementService,
    RecipeManagementService,
    CustomValidation
  ]
})
export class CookingVideoManagementModule {}
