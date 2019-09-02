import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class UserManagementService {
  constructor(private http: HttpClient) {}

  getAllUserListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllUserListing",
      data
    );
  }

  getUsersDetails(data) {
    return this.http.post(environment.base_url + "admin/getUsersDetails", data);
  }

  changedUserStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedUserStatus",
      data
    );
  }

  addUsersNotes(data) {
    return this.http.post(environment.base_url + "admin/addUsersNotes", data);
  }
}
