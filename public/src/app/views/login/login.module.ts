import { NgModule } from "@angular/core";
import { LoginService } from "./login.services";
import { RouterModule } from "@angular/router";
// import { ToasterService } from "angular2-toaster";
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
  imports: [NgxUiLoaderModule],
  declarations: [],
  exports: [RouterModule],
  providers: [LoginService]
})
export class LoginModule { }
