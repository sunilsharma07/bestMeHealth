import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { AdminManagementService } from "./adminManagement.services";
import { AdminManagementComponent } from "./adminManagement.component";
import { DetailsAdminmgmtComponent } from "./details-adminManagement.component";
import { AddAdminComponent } from "./add-adminManagement.component";

// multi-select dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

const routes: Routes = [
  {
    path: "", component: AdminManagementComponent
  },
  {
    path: "adminDetails/:adminId",
    component: DetailsAdminmgmtComponent
  },
  {
    path: "addAdmin",
    component: AddAdminComponent
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
    AdminManagementComponent,
    DetailsAdminmgmtComponent,
    AddAdminComponent
  ],
  providers: [AdminManagementService, CustomValidation]
})
export class AdminManagementModule { }
