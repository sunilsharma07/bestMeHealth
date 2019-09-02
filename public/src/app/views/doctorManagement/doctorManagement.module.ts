import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { DoctorManagementService } from "./doctorManagement.services";
import { DoctorManagementComponent } from "./doctorManagement.component";
import { DetailsDoctormgmtComponent } from "./details-doctorManagement.component";
import { AddDoctorComponent } from "./add-doctorManagement.component";

// multi-select dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

const routes: Routes = [
  { path: "", component: DoctorManagementComponent },
  {
    path: "doctorDetails/:doctorId",
    component: DetailsDoctormgmtComponent
  },
  {
    path: "addDoctor",
    component: AddDoctorComponent
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
    DoctorManagementComponent,
    DetailsDoctormgmtComponent,
    AddDoctorComponent
  ],
  providers: [DoctorManagementService, CustomValidation]
})
export class DoctorManagementModule { }
