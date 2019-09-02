import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class CategoryManagementService {
  constructor(private http: HttpClient) { }

  getAllCategoryListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllCategoryListing",
      data
    );
  }

  changedCategoryStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedCategoryStatus",
      data
    );
  }

  getCategoryDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getCategoryDetails",
      data
    );
  }

  addNewCategory(data) {
    return this.http.post(environment.base_url + "admin/addNewCategory", data);
  }

  updateCategory(data) {
    return this.http.post(environment.base_url + "admin/updateCategory", data);
  }

  deleteCategory(data) {
    return this.http.post(
      environment.base_url + "admin/deleteCategory",
      data
    );
  }
}
