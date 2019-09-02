import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SetNewPasswordService } from "./setNewPassword.services";
import { SetNewPasswordComponent } from "./setNewPassword.component";

const routes: Routes = [{ path: "", component: SetNewPasswordComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [],
  providers: [SetNewPasswordService],
  exports: [RouterModule]
})
export class SetNewPasswordModule { }
