import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class ExerciseManagementService {
  constructor(private http: HttpClient) {}

  getAllExerciseListing() {
    return this.http.get(environment.base_url + "admin/getAllExerciseListing");
  }

  changedExerciseStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedExerciseStatus",
      data
    );
  }

  viewExerciseDetails(data) {
    return this.http.post(
      environment.base_url + "admin/viewExerciseDetails",
      data
    );
  }
}
