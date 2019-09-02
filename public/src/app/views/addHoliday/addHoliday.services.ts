import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class AddHolidayService {
  constructor(public http: HttpClient) {}

  addHolidayDate(data) {
    return this.http.post(environment.base_url + "admin/addHolidayDate", data);
  }

  getHolidayDate(data) {
    return this.http.post(environment.base_url + "admin/getHolidayDate", data);
  }

  deleteHolidayDate(data) {
    return this.http.post(
      environment.base_url + "admin/deleteHolidayDate",
      data
    );
  }
}
