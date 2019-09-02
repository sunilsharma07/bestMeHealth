import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { ChefManagementService } from "./chefManagement.services";
import { ChefManagementComponent } from "./chefManagement.component";
import { DetailsChefmgmtComponent } from "./details-chefManagement.component";
import { AddChefComponent } from "./add-chefManagement.component";

// multi-select dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

const routes: Routes = [
  {
    path: "", component: ChefManagementComponent
  },
  {
    path: "chefDetails/:chefId",
    component: DetailsChefmgmtComponent
  },
  {
    path: "addChef",
    component: AddChefComponent
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
    ChefManagementComponent,
    DetailsChefmgmtComponent,
    AddChefComponent
  ],
  providers: [ChefManagementService, CustomValidation]
})
export class ChefManagementModule { }
