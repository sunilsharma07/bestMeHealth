import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class SetNewPasswordService {
  constructor(public http: HttpClient) { }

  setUserPassword(data) {
    return this.http.post(
      environment.base_url + "auth/setUserPassword",
      data
    );
  }
}
