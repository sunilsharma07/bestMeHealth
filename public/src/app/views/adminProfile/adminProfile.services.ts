import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class AdminProfileService {
  constructor(public http: HttpClient) { }

  getAdminProfile(data) {
    return this.http.post(environment.base_url + "admin/getUserProfile", data);
  }

  updateAdminProfile(data) {
    return this.http.post(
      environment.base_url + "admin/updateUserProfile",
      data
    );
  }
}
