import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable()
export class RecipeManagementService {
  constructor(private http: HttpClient) {}

  getAllRecipeListing(data) {
    return this.http.post(
      environment.base_url + "admin/getAllRecipeListing",
      data
    );
  }

  changedRecipeStatus(data) {
    return this.http.post(
      environment.base_url + "admin/changedRecipeStatus",
      data
    );
  }

  getRecipeDetails(data) {
    return this.http.post(
      environment.base_url + "admin/getRecipeDetails",
      data
    );
  }

  addRecipe(data) {
    return this.http.post(environment.base_url + "admin/addRecipe", data);
  }

  getIngredients() {
    return this.http.get(environment.base_url + "admin/getIngredients");
  }

  getFoodCategory() {
    return this.http.get(environment.base_url + "admin/getFoodCategory");
  }
}
