import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class ChangedSlotsService {
  constructor(public http: HttpClient) {}

  changedSlots(data) {
    return this.http.post(environment.base_url + "admin/changedSlots", data);
  }

  getOldSelectedSlots(data) {
    return this.http.post(
      environment.base_url + "admin/getOldSelectedSlots",
      data
    );
  }
}
