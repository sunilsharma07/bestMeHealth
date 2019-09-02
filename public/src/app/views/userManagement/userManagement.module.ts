import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { UserManagementService } from "./userManagement.services";
import { UserManagementComponent } from "./userManagement.component";
import { Routes, RouterModule } from "@angular/router";
import { DetailsUsermgmtComponent } from "./details-userManagement.component";
import { ModalModule } from "ngx-bootstrap/modal";

const routes: Routes = [
  { path: "", component: UserManagementComponent },
  {
    path: "userDetails/:userId",
    component: DetailsUsermgmtComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule,
    ModalModule.forRoot()
  ],
  declarations: [UserManagementComponent, DetailsUsermgmtComponent],
  providers: [UserManagementService, CustomValidation]
})
export class UserManagementModule {}
