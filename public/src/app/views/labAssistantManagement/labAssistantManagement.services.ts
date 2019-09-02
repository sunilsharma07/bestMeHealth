import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class LabAssistantManagementService {
  constructor(private http: HttpClient) { }

  getPermissionList() {
    return this.http.get(
      environment.base_url + "admin/getPermissionList"
    );
  }

  getAllLabAssistantListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllLabAssistantListing",
      data
    );
  }

  changedLabAssistantStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedLabAssistantStatus",
      data
    );
  }

  getLabAssistantDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getLabAssistantDetails",
      data
    );
  }

  addNewLabAssistant(data) {
    return this.http.post(environment.base_url + "admin/addNewLabAssistant", data);
  }

  updateLabAssistant(data) {
    return this.http.post(environment.base_url + "admin/updateUserPermissions", data);
  }
}
