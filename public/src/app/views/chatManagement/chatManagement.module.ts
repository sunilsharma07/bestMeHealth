import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { ChatManagementService } from "./chatManagement.services";
import { ChatManagementComponent } from "./chatManagement.component";

// multi-select dropdown
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

const routes: Routes = [
  {
    path: "", component: ChatManagementComponent
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
    ChatManagementComponent,
  ],
  providers: [ChatManagementService, CustomValidation]
})
export class ChatManagementModule { }
