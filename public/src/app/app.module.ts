import { BrowserModule } from "@angular/platform-browser";

import { NgModule } from "@angular/core";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";

import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PERFECT_SCROLLBAR_CONFIG } from "ngx-perfect-scrollbar";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgxPermissionsModule } from "ngx-permissions";
import { NgxUiLoaderModule } from 'ngx-ui-loader';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from "./app.component";

// Import containers
import { DefaultLayoutComponent } from "./containers";

import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { LoginComponent } from "./views/login/login.component";
import { RegisterComponent } from "./views/register/register.component";

import { FileValueAccessor } from './commenHelper/file-control-value-accessor'
import { FileValidator } from './commenHelper/file-input.validator'

const APP_CONTAINERS = [DefaultLayoutComponent];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule
} from "@coreui/angular";

// Import routing module
import { AppRoutingModule } from "./app.routing";

// Import 3rd party components
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";
import { ChartsModule } from "ng2-charts/ng2-charts";
import { LoginService } from "./views/login/login.services";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ToasterService, ToasterModule } from "angular2-toaster";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UserAuth } from "./commenHelper/userAuth";
import { AuthService } from "./commenHelper/auth.services";
import { TokenInterceptor } from "./commenHelper/interceptor";
import { CustomValidation } from "./commenHelper/customValidation";
import { SetNewPasswordComponent } from "./views/setNewPassword/setNewPassword.component";
import { SetNewPasswordService } from "./views/setNewPassword/setNewPassword.services";
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    HttpClientModule,
    BrowserModule,
    NgxPermissionsModule.forRoot(),
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    ReactiveFormsModule,
    FormsModule,
    ToasterModule.forRoot(),
    NgxUiLoaderModule,
    DragDropModule
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    SetNewPasswordComponent,
    RegisterComponent,
    FileValueAccessor,
    FileValidator
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    CustomValidation,
    UserAuth,
    AuthService,
    ToasterService,
    LoginService,
    SetNewPasswordService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    FileValidator
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
