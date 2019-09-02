import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthService } from "../../commenHelper/auth.services";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TabsModule } from "ngx-bootstrap/tabs";
import { AddHolidayService } from "./addHoliday.services";
import { AddHolidayComponent } from "./addHoliday.component";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { DataTablesModule } from "angular-datatables";

const routes: Routes = [{ path: "", component: AddHolidayComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    DataTablesModule,
    BsDatepickerModule.forRoot()
  ],
  declarations: [AddHolidayComponent],
  providers: [AuthService, AddHolidayService],
  exports: [RouterModule]
})
export class AddHolidayModule {}
