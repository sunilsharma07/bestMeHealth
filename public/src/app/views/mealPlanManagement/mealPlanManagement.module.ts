import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthService } from "../../commenHelper/auth.services";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TabsModule } from "ngx-bootstrap/tabs";
import { MealPlanService } from "./mealPlanManagement.services";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { DataTablesModule } from "angular-datatables";
import { MealPlanComponent } from "./mealPlanManagement.component";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";

const routes: Routes = [{ path: "", component: MealPlanComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    DataTablesModule,
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    NgMultiSelectDropDownModule
  ],
  declarations: [MealPlanComponent],
  providers: [AuthService, MealPlanService],
  exports: [RouterModule]
})
export class MealPlanManagementModule {}
