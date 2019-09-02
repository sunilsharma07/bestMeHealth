import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class NotesManagementService {
  constructor(public http: HttpClient) {}

  getNotes(data) {
    return this.http.post(environment.base_url + "admin/getNotes", data);
  }

  updateNotes(data) {
    return this.http.post(environment.base_url + "admin/updateNotes", data);
  }

  deleteNotes(data) {
    return this.http.post(environment.base_url + "admin/deleteNotes", data);
  }
}
