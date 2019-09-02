import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class ChangePasswordService {
  constructor(public http: HttpClient) {}

  changePassword(data) {
    return this.http.post(environment.base_url + "admin/changePassword", data);
  }
}
