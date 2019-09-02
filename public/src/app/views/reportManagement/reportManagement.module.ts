import { NgModule } from "@angular/core";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { ReportManagementService } from "./reportManagement.services";
import { AddFit132ReportComponent } from "./add-fit132ReportManagement.component";
import { AddMicronutrientsReportComponent } from "./add-micronutrientsReportManagement.component";
import { ReportManagementComponent } from "./reportManagement.component";
import { DetailsFit132ReportComponent } from "./details-fit132ReportManagement.component";
import { DetailsMicronutrientsReportComponent } from "./details-micronutrientsReportManagement.component";

// multi-select dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { FileValidator } from '../../commenHelper/file-input.validator'
import { CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';


const routes: Routes = [
  {
    path: ":customerId",
    component: ReportManagementComponent
  },
  {
    path: "addFit132/:reportAddType/:customerId",
    component: AddFit132ReportComponent
  },
  {
    path: "addMicronutrients/:customerId",
    component: AddMicronutrientsReportComponent
  },
  {
    path: "fit132/details/:reportId",
    component: DetailsFit132ReportComponent
  },
  {
    path: "micronutrients/details/:reportId",
    component: DetailsMicronutrientsReportComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    BsDatepickerModule.forRoot(),
    DragDropModule
  ],
  exports: [
    CdkDropList
  ],
  declarations: [
    AddFit132ReportComponent,
    AddMicronutrientsReportComponent,
    ReportManagementComponent,
    DetailsFit132ReportComponent,
    DetailsMicronutrientsReportComponent
  ],
  providers: [ReportManagementService, CustomValidation, FileValidator]
})
export class ReportManagementModule { }
