import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthService } from "../../commenHelper/auth.services";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NotesManagementService } from "./notesManagement.services";
import { NotesManagementComponent } from "./notesManagement.component";
import { ModalModule } from "ngx-bootstrap/modal";
import { DataTablesModule } from "angular-datatables";

const routes: Routes = [
  { path: "", component: NotesManagementComponent },
  { path: ":getMyNotes", component: NotesManagementComponent }
];

@NgModule({
  imports: [
    CommonModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    ModalModule.forRoot()
  ],
  declarations: [NotesManagementComponent],
  providers: [AuthService, NotesManagementService],
  exports: [RouterModule]
})
export class NotesManagementManagementModule {}
