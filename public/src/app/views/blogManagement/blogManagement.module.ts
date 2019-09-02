import { NgModule } from "@angular/core";
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";
import { CustomValidation } from "../../commenHelper/customValidation";
import { ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { BlogManagementService } from "./blogManagement.services";
import { BlogManagementComponent } from "./blogManagement.component";
import { DetailsBlogmgmtComponent } from "./details-blogManagement.component";
import { AddBlogComponent } from "./add-blogManagement.component";

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

const routes: Routes = [
	{
		path: "", component: BlogManagementComponent
	},
	{
		path: "blogDetails/:blogId",
		component: DetailsBlogmgmtComponent
	},
	{
		path: "addBlog",
		component: AddBlogComponent
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
	declarations: [
		BlogManagementComponent,
		DetailsBlogmgmtComponent,
		AddBlogComponent
	],
	providers: [BlogManagementService, CustomValidation]
})
export class BlogManagementModule { }
