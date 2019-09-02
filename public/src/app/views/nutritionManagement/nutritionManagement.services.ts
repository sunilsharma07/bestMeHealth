import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class NutritionManagementService {
  constructor(private http: HttpClient) { }

  getPermissionList() {
    return this.http.get(
      environment.base_url + "admin/getPermissionList"
    );
  }

  getAllNutritionListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllNutritionListing",
      data
    );
  }

  changedNutritionStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedNutritionStatus",
      data
    );
  }

  getNutritionDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getNutritionDetails",
      data
    );
  }

  addNewNutrition(data) {
    return this.http.post(environment.base_url + "admin/addNutrition", data);
  }

  updateNutrition(data) {
    return this.http.post(environment.base_url + "admin/updateUserPermissions", data);
  }
}
