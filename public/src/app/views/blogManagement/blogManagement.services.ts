import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class BlogManagementService {
  constructor(private http: HttpClient) { }

  getAllBlogListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllBlogListing",
      data
    );
  }

  changedBlogStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedBlogStatus",
      data
    );
  }

  getBlogDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getBlogDetails",
      data
    );
  }

  addNewBlog(data) {
    return this.http.post(environment.base_url + "admin/addNewBlog", data);
  }

  updateBlog(data) {
    return this.http.post(environment.base_url + "admin/updateBlog", data);
  }

  deleteBlog(data) {
    return this.http.post(
      environment.base_url + "admin/deleteBlog",
      data
    );
  }
}
