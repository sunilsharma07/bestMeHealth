import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class ChefManagementService {
  constructor(private http: HttpClient) { }

  getPermissionList() {
    return this.http.get(
      environment.base_url + "admin/getPermissionList"
    );
  }

  getAllChefListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllChefListing",
      data
    );
  }

  changedChefStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedChefStatus",
      data
    );
  }

  getChefDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getChefDetails",
      data
    );
  }

  addNewChef(data) {
    return this.http.post(environment.base_url + "admin/addNewChef", data);
  }

  updateChef(data) {
    return this.http.post(environment.base_url + "admin/updateUserPermissions", data);
  }
}
