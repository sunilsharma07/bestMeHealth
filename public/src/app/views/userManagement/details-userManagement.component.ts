import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService } from "angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { CustomValidation } from "../../commenHelper/customValidation";
import { UserManagementService } from "./userManagement.services";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { AuthService } from "../../commenHelper/auth.services";

@Component({
  templateUrl: "./details-userManagement.component.html"
})
export class DetailsUsermgmtComponent implements OnInit {
  modalRef: BsModalRef;
  detailsUserForm: FormGroup;
  addNoteForm: FormGroup;
  submitted: boolean = false;
  adminDetails: any;
  userId: any;
  action: string = "view";
  profilePic;
  userName: string = "";
  modalConfig = {
    animated: true,
    ignoreBackdropClick: true,
    keyboard: false,
    class: "modal-lg"
  };

  constructor(
    public route: ActivatedRoute,
    public customValidate: CustomValidation,
    private userManagementFactory: UserManagementService,
    private toasterService: ToasterService,
    private router: Router,
    private modalService: BsModalService,
    private authFactory: AuthService
  ) {}

  ngOnInit(): void {
    this.adminDetails = this.authFactory.getAdminDetails();
    this.detailsUserForm = new FormGroup({
      firstName: new FormControl("", []),
      lastName: new FormControl("", []),
      email: new FormControl("", []),
      phoneNumber: new FormControl("", []),
      address: new FormControl("", []),
      gender: new FormControl("", []),
      height: new FormControl("", []),
      weight: new FormControl("", []),
      rmr: new FormControl("", []),
      dietaryRequirement: new FormControl("", []),
      dateOfBirth: new FormControl("", []),
      physicalDisabilitiies: new FormControl("", []),
      allergies: new FormControl("", []),
      unfavoriteFood: new FormControl("", []),
      favoriteFood: new FormControl("", []),
      dailyEatFood: new FormControl("", []),
      goal: new FormControl("", []),
      activityLevel: new FormControl("", []),
      isWaitingForTopTier: new FormControl("", []),
      isReferred: new FormControl("", []),
      currentPlan: new FormControl("", []),
      profilePic: new FormControl("", []),
      profileType: new FormControl("", [])
    });
    this.route.params.subscribe(params => {
      this.userId = params.userId;
    });
    this.viewUsersDetails(this.userId);
  }

  onImageFoundError($event) {
    $event.target.src = `${environment.placeHolderImage}`;
  }

  viewUsersDetails(user_id): void {
    let userId = { _id: user_id };
    let formattedDob;
    let goal;
    let activityLevel;
    let currentPlanId;
    this.userManagementFactory.getUsersDetails(userId).subscribe(
      response => {
        this.action = "view";
        let getUsersDetails = JSON.parse(JSON.stringify(response));
        if (
          getUsersDetails.data.mediaId &&
          getUsersDetails.data.mediaId != ""
        ) {
          this.profilePic =
            environment.customer_image_url + getUsersDetails.data.mediaId;
        } else {
          this.profilePic = environment.placeHolderImage;
        }
        // Format Of DOB
        if (getUsersDetails.data.dateOfBirth) {
          let dob = new Date(getUsersDetails.data.dateOfBirth);
          let getDate = dob.getDate();
          let getMonth = dob.getMonth() + 1;
          let getYear = dob.getFullYear();
          formattedDob = getDate + "/" + getMonth + "/" + getYear;
        } else {
          formattedDob = "N/A";
        }
        // Format Of Goal 1=loss weight, 2=gain weight, 3=maintain weight
        if (getUsersDetails.data.goal && getUsersDetails.data.goal == 1) {
          goal = "Loss Weight";
        } else if (
          getUsersDetails.data.goal &&
          getUsersDetails.data.goal == 2
        ) {
          goal = "Gain Weight";
        } else if (
          getUsersDetails.data.goal &&
          getUsersDetails.data.goal == 3
        ) {
          goal = "Maintain Weight";
        } else {
          goal = "N/A";
        }
        // Format Activity Level 1=Sedentory, 2=Active, 3=Very Active, 4=Super Active
        if (
          getUsersDetails.data.activityLevel &&
          getUsersDetails.data.activityLevel == 1
        ) {
          activityLevel = "Sedentory";
        } else if (
          getUsersDetails.data.activityLevel &&
          getUsersDetails.data.activityLevel == 2
        ) {
          activityLevel = "Active";
        } else if (
          getUsersDetails.data.activityLevel &&
          getUsersDetails.data.activityLevel == 3
        ) {
          activityLevel = "Very Active";
        } else if (
          getUsersDetails.data.activityLevel &&
          getUsersDetails.data.activityLevel == 4
        ) {
          activityLevel = "Super Active";
        } else {
          activityLevel = "N/A";
        }
        // Format Current Plan 0=Free, 1=Bottom Tier, 2=Middle Tier, 3=Top Tier
        if (
          getUsersDetails.data.currentPlanId &&
          getUsersDetails.data.currentPlanId == 0
        ) {
          currentPlanId = "Free";
        } else if (
          getUsersDetails.data.currentPlanId &&
          getUsersDetails.data.currentPlanId == 1
        ) {
          currentPlanId = "Bottom Tier";
        } else if (
          getUsersDetails.data.currentPlanId &&
          getUsersDetails.data.currentPlanId == 2
        ) {
          currentPlanId = "Middle Tier";
        } else if (
          getUsersDetails.data.currentPlanId &&
          getUsersDetails.data.currentPlanId == 3
        ) {
          currentPlanId = "Top Tier";
        } else {
          currentPlanId = "Free";
        }
        this.userName =
          getUsersDetails.data.firstName + " " + getUsersDetails.data.lastName;
        this.detailsUserForm.patchValue({
          firstName: getUsersDetails.data.firstName || "N/A",
          lastName: getUsersDetails.data.lastName || "N/A",
          email: getUsersDetails.data.email || "N/A",
          phoneNumber: getUsersDetails.data.phoneNumber || "N/A",
          address: getUsersDetails.data.address || "N/A",
          gender: getUsersDetails.data.gender || "N/A",
          height: getUsersDetails.data.height || "N/A",
          weight: getUsersDetails.data.weight || "N/A",
          rmr: getUsersDetails.data.rmr || "N/A",
          dietaryRequirement: getUsersDetails.data.dietaryRequirement || "N/A",
          dateOfBirth: formattedDob,
          physicalDisabilitiies: getUsersDetails.data.physicalDisabilitiies,
          allergies: getUsersDetails.data.allergies,
          unfavoriteFood: getUsersDetails.data.unfavoriteFood,
          favoriteFood: getUsersDetails.data.favoriteFood,
          dailyEatFood: getUsersDetails.data.dailyEatFood,
          goal: goal,
          activityLevel: activityLevel,
          isWaitingForTopTier: getUsersDetails.data.isWaitingForTopTier.toString(),
          isReferred: getUsersDetails.data.isReferred.toString(),
          currentPlan: currentPlanId,
          profilePic: this.profilePic,
          profileType: getUsersDetails.data.profileType
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

  navigateToMealPlan() {
    this.router.navigate([
      "/mealPlanManagement",
      this.userId,
      btoa(this.userName)
    ]);
  }

  addNotesBtn(template: TemplateRef<any>) {
    this.submitted = false;
    this.modalRef = this.modalService.show(template, this.modalConfig);
    this.addNoteForm = new FormGroup({
      notes: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(this.customValidate.white_space_first_char)
      ])
    });
  }

  addNoteFormSubmit() {
    this.submitted = true;
    let sendDataToApi = {
      notes: this.addNoteForm.value.notes,
      userId: this.userId,
      addedBy: this.adminDetails._id,
      whoAdded: this.adminDetails.firstName + " " + this.adminDetails.lastName,
      adminRole: this.adminDetails.userType
    };
    if (this.addNoteForm.valid) {
      this.userManagementFactory.addUsersNotes(sendDataToApi).subscribe(
        response => {
          let getResponse = JSON.parse(JSON.stringify(response));
          if (getResponse.status == 200) {
            this.modalRef.hide();
            this.toasterService.pop("success", "Success", getResponse.message);
          } else {
            this.toasterService.pop("error", "Error", getResponse.message);
          }
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
}
