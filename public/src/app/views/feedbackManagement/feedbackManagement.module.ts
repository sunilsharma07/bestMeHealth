import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { FeedbackManagementService } from "./feedbackManagement.services";
import { FeedbackManagementComponent } from "./feedbackManagement.component";

const routes: Routes = [{ path: "", component: FeedbackManagementComponent }];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [FeedbackManagementComponent],
  providers: [FeedbackManagementService]
})
export class FeedbackManagementModule {}
