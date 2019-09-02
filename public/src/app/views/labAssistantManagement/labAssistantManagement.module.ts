import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { LabAssistantManagementService } from "./labAssistantManagement.services";
import { LabAssistantManagementComponent } from "./labAssistantManagement.component";
import { DetailsLabAssistantmgmtComponent } from "./details-labAssistantManagement.component";
import { AddLabAssistantComponent } from "./add-labAssistantManagement.component";

// multi-select dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

const routes: Routes = [
	{
		path: "", component: LabAssistantManagementComponent
	},
	{
		path: "labAssistantDetails/:labAssistantId",
		component: DetailsLabAssistantmgmtComponent
	},
	{
		path: "addLabAssistant",
		component: AddLabAssistantComponent
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
		LabAssistantManagementComponent,
		DetailsLabAssistantmgmtComponent,
		AddLabAssistantComponent
	],
	providers: [LabAssistantManagementService, CustomValidation]
})
export class LabAssistantManagementModule { }
