import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";
import "rxjs/add/operator/do";
import { Router } from "@angular/router";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { AuthService } from "./auth.services";
import { Observable } from "rxjs";
import { NgxUiLoaderService } from "ngx-ui-loader";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    public toasterService: ToasterService,
    private ngxService: NgxUiLoaderService
  ) { }

  // intercept(
  //   req: HttpRequest<any>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<any>> {
  //   const authReq = req.clone({
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "my-auth-token"
  //     })
  //   });

  //   console.log("Intercepted HTTP call", authReq);

  //   return next.handle(authReq);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.ngxService.start();

    const adminDetails = this.authService.getAdminDetails();

    if (
      adminDetails &&
      adminDetails.accessToken &&
      adminDetails.accessToken != ""
    ) {
      request = request.clone({
        setHeaders: {
          Authorization: adminDetails.accessToken
        }
      });
    }

    return next.handle(request).do(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.ngxService.stop();
          if (event.body.response && event.body.response.status == 401) {
            // Set you logic
          }
        }
      },
      (err: any) => {
        this.ngxService.stop();
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401) {
            this.toasterService.pop(
              "error",
              "Error",
              "Your Session Has Expired. Please Login Again."
            );
            this.authService.clearAuthData();
            setTimeout(() => {
              this.router.navigate(["/login"]);
            }, 1000);
          }
        }
      }
    );
  }
}
