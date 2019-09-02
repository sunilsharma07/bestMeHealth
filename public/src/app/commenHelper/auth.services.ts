import { Injectable, OnInit } from "@angular/core";

@Injectable()
export class AuthService implements OnInit {
  cache: Object = null;
  token: String = "";
  constructor() {
    let adminDetails = JSON.parse(localStorage.getItem("adminDetails"));
  }

  ngOnInit() {}

  setAuthData(data) {
    if (data) {
      this.cache = data;
      localStorage.setItem("adminDetails", JSON.stringify(data));
    }
  }

  setPermissionData(data) {
    if (data) {
      localStorage.setItem("permissions", JSON.stringify(data));
    }
  }

  getPermission() {
    return JSON.parse(localStorage.getItem("permissions"));
  }

  getAdminDetails() {
    return JSON.parse(localStorage.getItem("adminDetails"));
  }

  clearAuthData() {
    this.cache = null;
    localStorage.clear();
  }
}
