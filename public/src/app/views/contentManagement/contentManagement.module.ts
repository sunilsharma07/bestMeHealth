import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { ContentManagementService } from "./contentManagement.services";
import { ContentManagementComponent } from "./contentManagement.component";
import { DetailsContentmgmtComponent } from "./details-contentManagement.component";

const routes: Routes = [
  {
    path: "",
    component: ContentManagementComponent
  },
  {
    path: "contentDetails/:contentId",
    component: DetailsContentmgmtComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DataTablesModule,
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  declarations: [ContentManagementComponent, DetailsContentmgmtComponent],
  providers: [ContentManagementService, CustomValidation]
})
export class ContentManagementModule {}
