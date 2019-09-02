import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class ContentManagementService {
  constructor(private http: HttpClient) {}

  getAllContentListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllContentListing",
      data
    );
  }

  getContentDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getContentDetails",
      data
    );
  }

  updateContent(data) {
    return this.http.post(environment.base_url + "admin/updateContent", data);
  }
}
