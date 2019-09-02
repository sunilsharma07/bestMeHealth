import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class FeedbackManagementService {
  constructor(private http: HttpClient) {}

  getAllFeedbackListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllFeedbackListing",
      data
    );
  }
}
