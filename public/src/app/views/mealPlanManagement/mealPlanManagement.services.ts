import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class MealPlanService {
  constructor(public http: HttpClient) {}

  getFoodCategory() {
    return this.http.get(environment.base_url + "admin/getFoodCategory");
  }
}
