import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ToasterService } from "angular2-toaster";
import { ExerciseManagementService } from "./exerciseManagement.services";
import swal from "sweetalert2";

@Component({
  templateUrl: "exerciseManagement.component.html"
})
export class ExerciseManagementComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  exerciseList: any;

  constructor(
    private http: HttpClient,
    public exerciseFactory: ExerciseManagementService,
    public toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getAllExerciseListing();
  }

  changedExerciseStatus(exerciseId, type, i) {
    if (type === "inactive") {
      var text = "You want to in-active this exercise?";
      var confirmButtonText = "Yes, in-active it!";
      var confirmButtonColor = "#E5A630";
      var succTitle = "In-Activated";
      var succMsg = "Exercise has been in-activated successfully";
    } else {
      var text = "You want to active this exercise?";
      var confirmButtonText = "Yes, active it!";
      var confirmButtonColor = "#008000";
      var succTitle = "Activated";
      var succMsg = "Exercise has been activated successfully";
    }
    swal
      .fire({
        title: "Are you sure?",
        text: text,
        type: "warning",
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
        confirmButtonColor: confirmButtonColor
      })
      .then(result => {
        if (result.value) {
          let sendDatatoApi = { _id: exerciseId };
          this.exerciseFactory.changedExerciseStatus(sendDatatoApi).subscribe(
            response => {
              this.exerciseList[i].isActive =
                this.exerciseList[i].isActive === true ? false : true;
              swal.fire(succTitle, succMsg, "success");
            },
            error => {
              this.toasterService.pop(
                "error",
                "Error",
                "Oops! something went wrong !."
              );
            }
          );
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.fire("Cancelled", "", "error");
        }
      });
  }

  getAllExerciseListing() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      retrieve: true,
      columns: [
        { title: "Name" },
        { title: "Category" },
        { title: "Action", searchable: false, orderable: false }
      ]
    };
    this.exerciseFactory.getAllExerciseListing().subscribe(
      response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          this.exerciseList = finalResult.data;
          this.dtTrigger.next();
        } else {
          this.toasterService.clear();
          this.toasterService.pop("error", "Error", finalResult.message);
        }
      },
      error => {
        this.toasterService.clear();
        this.toasterService.pop(
          "error",
          "Error",
          "Oops! something went wrong !."
        );
      }
    );
  }
}
