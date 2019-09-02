import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class AdminManagementService {
  constructor(private http: HttpClient) { }

  getPermissionList() {
    return this.http.get(
      environment.base_url + "admin/getPermissionList"
    );
  }

  getAllAdminListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllAdminListing",
      data
    );
  }

  changedAdminStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedAdminStatus",
      data
    );
  }

  getAdminDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getAdminDetails",
      data
    );
  }

  addNewAdmin(data) {
    return this.http.post(environment.base_url + "admin/addNewAdmin", data);
  }

  updateAdmin(data) {
    return this.http.post(environment.base_url + "admin/updateUserPermissions", data);
  }
}
