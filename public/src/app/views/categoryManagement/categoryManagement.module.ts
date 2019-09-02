import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { CategoryManagementService } from "./categoryManagement.services";
import { CategoryManagementComponent } from "./categoryManagement.component";
import { DetailsCategorymgmtComponent } from "./details-categoryManagement.component";
import { AddCategoryComponent } from "./add-categoryManagement.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";

const routes: Routes = [
	{
		path: "", component: CategoryManagementComponent
	},
	{
		path: "categoryDetails/:categoryId",
		component: DetailsCategorymgmtComponent
	},
	{
		path: "addCategory",
		component: AddCategoryComponent
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
		CategoryManagementComponent,
		DetailsCategorymgmtComponent,
		AddCategoryComponent
	],
	providers: [CategoryManagementService, CustomValidation]
})
export class CategoryManagementModule { }
