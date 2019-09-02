import { Component, OnDestroy, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { navItems } from "./../../_nav";
import { menuPermission } from "./../../menu";
import { Router } from "@angular/router";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { AuthService } from "../../commenHelper/auth.services";

@Component({
  selector: "app-dashboard",
  templateUrl: "./default-layout.component.html"
})
export class DefaultLayoutComponent implements OnDestroy {
  toasterconfig: ToasterConfig = new ToasterConfig({
    positionClass: "toast-top-right",
    showCloseButton: false,
    animation: "flyLeft"
  });
  adminDetails;
  public navItems = navItems;
  public menuPermission = menuPermission;
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  currentYear;
  constructor(
    private authService: AuthService,
    public router: Router,
    @Inject(DOCUMENT) _document?: any
  ) {
    this.currentYear = new Date().getFullYear();
    this.changes = new MutationObserver(mutations => {
      this.sidebarMinimized = _document.body.classList.contains(
        "sidebar-minimized"
      );
    });
    this.element = _document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ["class"]
    });
    this.adminDetails = authService.getAdminDetails();
  }

  logout() {
    this.authService.clearAuthData();
    this.router.navigate(["/login"]);
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }
}
