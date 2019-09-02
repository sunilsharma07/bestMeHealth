import { Component, OnInit } from "@angular/core";
import { ExerciseManagementService } from "./exerciseManagement.services";
import { FormGroup, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ToasterService } from "angular2-toaster";

@Component({
  templateUrl: "./details-exerciseManagement.component.html"
})
export class DetailsExercisemgmtComponent implements OnInit {
  action: string = "view";
  detailsExerciseForm: FormGroup;
  exerciseId: string;
  equipment: Array<string> = [];
  muscleSecondary: Array<string> = [];
  muscles: Array<string> = [];
  description;

  constructor(
    public route: ActivatedRoute,
    public exerciseFactory: ExerciseManagementService,
    public toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.exerciseId = params.exerciseId;
    });
    this.detailsExerciseForm = new FormGroup({
      name: new FormControl("", []),
      category: new FormControl("", [])
      // description: new FormControl("", [])
    });
    this.viewExerciseDetails();
  }

  viewExerciseDetails(): void {
    let exerciseId = { _id: this.exerciseId };
    this.exerciseFactory.viewExerciseDetails(exerciseId).subscribe(
      response => {
        this.action = "view";
        let getExerciseDetails = JSON.parse(JSON.stringify(response));
        this.equipment = getExerciseDetails.data.equipment;
        this.muscleSecondary = getExerciseDetails.data.muscleSecondary;
        this.muscles = getExerciseDetails.data.muscles;
        this.description = getExerciseDetails.data.description;
        this.detailsExerciseForm.patchValue({
          name: getExerciseDetails.data.name || "N/A",
          category: getExerciseDetails.data.category || "N/A"
          // description: getExerciseDetails.data.description || "N/A"
        });
      },
      error => {
        this.toasterService.pop(
          "error",
          "Error",
          "Oops! something went wrong !."
        );
      }
    );
  }
}
