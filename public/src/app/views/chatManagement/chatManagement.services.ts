import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class ChatManagementService {
  constructor(private http: HttpClient) { }

  chat_image_upload(data) {
    return this.http.post(
      environment.base_url + "admin/getPermissionList", data
    );
  }

}
