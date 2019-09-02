import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ChangedSlotsComponent } from "./changedSlots.component";
import { ChangedSlotsService } from "./changedSlots.services";
import { AuthService } from "../../commenHelper/auth.services";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TabsModule } from "ngx-bootstrap/tabs";

const routes: Routes = [{ path: "", component: ChangedSlotsComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TabsModule
  ],
  declarations: [ChangedSlotsComponent],
  providers: [AuthService, ChangedSlotsService],
  exports: [RouterModule]
})
export class ChangedSlotsModule {}
