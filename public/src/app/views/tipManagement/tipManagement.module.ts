import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { TipManagementComponent } from "./tipManagement.component";
import { TipManagementService } from "./tipManagement.services";
import { AddTipComponent } from "./add-tipManagement.component";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { DetailsTipComponent } from "./details-tipManagement.component";

const routes: Routes = [
  { path: "", component: TipManagementComponent },
  {
    path: "addTip",
    component: AddTipComponent
  },
  {
    path: "tipDetails/:tipId",
    component: DetailsTipComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule
  ],
  declarations: [TipManagementComponent, AddTipComponent, DetailsTipComponent],
  providers: [TipManagementService]
})
export class TipManagementModule {}
