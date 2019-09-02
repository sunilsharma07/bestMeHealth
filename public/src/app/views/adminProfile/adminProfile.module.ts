import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthService } from "../../commenHelper/auth.services";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AdminProfileComponent } from "./adminProfile.component";
import { AdminProfileService } from "./adminProfile.services";

const routes: Routes = [{ path: "", component: AdminProfileComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [AdminProfileComponent],
  providers: [AuthService, AdminProfileService],
  exports: [RouterModule]
})
export class AdminProfileModule {}
