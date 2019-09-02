import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class TipManagementService {
  constructor(private http: HttpClient) {}

  getAllTipListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllTipListing",
      data
    );
  }

  addNewTip(data) {
    return this.http.post(environment.base_url + "admin/addNewTip ", data);
  }

  deleteTip(data) {
    return this.http.post(environment.base_url + "admin/deleteTip ", data);
  }

  viewTipDetails(data) {
    return this.http.post(environment.base_url + "admin/viewTipDetails ", data);
  }

  updateTip(data) {
    return this.http.post(environment.base_url + "admin/updateTip ", data);
  }
}
