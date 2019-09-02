import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class CookingVideoManagementService {
  constructor(private http: HttpClient) {}

  getCookingVideoListing() {
    return this.http.get(environment.base_url + "admin/getCookingVideoListing");
  }

  addNewCookingVideo(data) {
    return this.http.post(
      environment.base_url + "admin/addNewCookingVideo",
      data
    );
  }
}
