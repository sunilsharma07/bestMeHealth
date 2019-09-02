import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class DoctorManagementService {
  constructor(private http: HttpClient) { }

  getPermissionList() {
    return this.http.get(
      environment.base_url + "admin/getPermissionList"
    );
  }

  getAllDoctorListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllDoctorListing",
      data
    );
  }

  changedDoctorstatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedDoctorstatus",
      data
    );
  }

  getDoctorDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getDoctorDetails",
      data
    );
  }

  addNewDoctor(data) {
    return this.http.post(environment.base_url + "admin/addNewDoctor", data);
  }

  updateDoctor(data) {
    return this.http.post(environment.base_url + "admin/updateUserPermissions", data);
  }
}
