import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class LoginService {
  private data: any;
  constructor(private http: HttpClient) {}

  adminLogin(data) {
    return this.http.post(environment.base_url + "auth/adminLogin", data);
  }
}
