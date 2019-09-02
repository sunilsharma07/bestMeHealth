import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { RecipeManagementService } from "./recipeManagement.services";
import { RecipeManagementComponent } from "./recipeManagement.component";
import { AddRecipeComponent } from "./add-recipeManagement.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { FileValidator } from "../../commenHelper/file-input.validator";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { DetailsRecipemgmtComponent } from "./details-recipeManagement.component";

const routes: Routes = [
  { path: "", component: RecipeManagementComponent },
  {
    path: "recipeDetails/:recipeId",
    component: DetailsRecipemgmtComponent
  },
  {
    path: "addRecipe",
    component: AddRecipeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    CKEditorModule
  ],
  declarations: [
    RecipeManagementComponent,
    AddRecipeComponent,
    DetailsRecipemgmtComponent
  ],
  providers: [RecipeManagementService, CustomValidation, FileValidator]
})
export class RecipeManagementModule {}
