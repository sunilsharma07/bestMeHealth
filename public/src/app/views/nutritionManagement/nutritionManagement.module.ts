import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { NutritionManagementService } from "./nutritionManagement.services";
import { NutritionManagementComponent } from "./nutritionManagement.component";
import { DetailsNutritionmgmtComponent } from "./details-nutritionManagement.component";
import { AddNutritionComponent } from "./add-nutritionManagement.component";

// multi-select dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

const routes: Routes = [
	{
		path: "", component: NutritionManagementComponent
	},
	{
		path: "nutritionDetails/:nutritionId",
		component: DetailsNutritionmgmtComponent
	},
	{
		path: "addNutrition",
		component: AddNutritionComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DataTablesModule,
		CommonModule,
		ReactiveFormsModule,
		NgMultiSelectDropDownModule
	],
	declarations: [
		NutritionManagementComponent,
		DetailsNutritionmgmtComponent,
		AddNutritionComponent
	],
	providers: [NutritionManagementService, CustomValidation]
})
export class NutritionManagementModule { }
