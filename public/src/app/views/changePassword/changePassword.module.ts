import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ChangePasswordComponent } from "./changePassword.component";
import { ChangePasswordService } from "./changePassword.services";
import { AuthService } from "../../commenHelper/auth.services";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

const routes: Routes = [{ path: "", component: ChangePasswordComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [ChangePasswordComponent],
  providers: [AuthService, ChangePasswordService],
  exports: [RouterModule]
})
export class ChangePasswordModule {}
