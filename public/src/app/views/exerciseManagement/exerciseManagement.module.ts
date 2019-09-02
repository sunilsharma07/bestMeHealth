import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { ExerciseManagementService } from "./exerciseManagement.services";
import { ExerciseManagementComponent } from "./exerciseManagement.component";
import { DetailsExercisemgmtComponent } from "./details-exerciseManagement.component";

const routes: Routes = [
  { path: "", component: ExerciseManagementComponent },
  {
    path: "exerciseDetails/:exerciseId",
    component: DetailsExercisemgmtComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [ExerciseManagementComponent, DetailsExercisemgmtComponent],
  providers: [ExerciseManagementService]
})
export class ExerciseManagementModule {}
