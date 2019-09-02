import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { AuthService } from "./auth.services";
import { NgxPermissionsService } from "ngx-permissions";
@Injectable()
export class UserAuth implements CanActivate {
  perm: any;
  adminData: any;
  constructor(
    private router: Router,
    private authService: AuthService,
    private permissionFactory: NgxPermissionsService
  ) {
    // this.perm = this.authService.getPermission();
  }

  canActivate() {
    this.perm = this.authService.getPermission();
    if (this.authService.getAdminDetails() && this.perm.length) {
      this.permissionFactory.loadPermissions(this.perm);
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }

  canLoad() {
    if (this.authService.getAdminDetails() && this.perm.length) {
      this.permissionFactory.loadPermissions(this.perm);
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
