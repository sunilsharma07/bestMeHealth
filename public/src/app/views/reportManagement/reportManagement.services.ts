import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class ReportManagementService {
  constructor(private http: HttpClient) { }

  getPermissionList() {
    return this.http.get(
      environment.base_url + "admin/getPermissionList"
    );
  }

  getTempRecord(data) {
    return this.http.post(
      environment.base_url + "admin/getTempReport",
      data
    );
  }

  getCategory() {
    return this.http.get(
      environment.base_url + "admin/getMicronutrientsReportCategory"
    );
  }

  getCategoryContent() {
    return this.http.get(
      environment.base_url + "admin/getMicronutrientsReportCategoryContent"
    );
  }

  addTempRecord(data) {
    return this.http.post(environment.base_url + "admin/addTempReport", data);
  }

  deleteTempRecord(data) {
    return this.http.post(
      environment.base_url + "admin/deleteTempReport",
      data
    );
  }

  addTestReport(data) {
    return this.http.post(environment.base_url + "admin/addTestReport", data);
  }

  uploadTestReport(data) {
    return this.http.post(environment.base_url + "admin/uploadTestReport", data);
  }

  addMicronutrientsTestReport(data) {
    return this.http.post(environment.base_url + "admin/addMicronutrientsTestReport", data);
  }

  getAllTestListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllTestListing",
      data
    );
  }

  getFit132ReportResult(data) {
    return this.http.post(environment.base_url + "admin/getFit132TestResult", data);
  }

  updateFit132ReportResult(data) {
    return this.http.post(environment.base_url + "admin/updateFit132TestResult", data);
  }

  getMicronutrientsReportResult(data) {
    return this.http.post(environment.base_url + "admin/getMicronutrientsTestResult", data);
  }

  updateMicronutrientsReportResult(data) {
    return this.http.post(environment.base_url + "admin/updateFit132TestResult", data);
  }
}
