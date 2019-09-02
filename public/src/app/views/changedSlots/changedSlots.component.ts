import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, FormArray } from "@angular/forms";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router } from "@angular/router";
import { ChangedSlotsService } from "./changedSlots.services";
import { CustomValidation } from "../../commenHelper/customValidation";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { AuthService } from "../../commenHelper/auth.services";
import { tabs, slots } from "../../../app/commenHelper/config";

@Component({
  selector: "app-changedSlots",
  templateUrl: "./changedSlots.component.html"
})
export class ChangedSlotsComponent implements OnInit {
  @ViewChild("staticTabs") staticTabs: TabsetComponent;
  changedSlotsForm: FormGroup;
  submitted: boolean = false;
  enableSaveBtn: boolean = false;
  isFirstTime: boolean = true;
  isSlotAdded: boolean = false;
  tabs = tabs;
  slots: any = slots;
  oldSlots: any = [];
  day: string = "Monday";
  dayListArr = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];
  formBuilder = new FormBuilder();
  getSelectedSlots: any = [];
  getFinalSlot: any = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };
  disabledDayArr = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7
  };
  adminDetails: any;

  constructor(
    public changeSlotsFactory: ChangedSlotsService,
    public toasterService: ToasterService,
    public router: Router,
    public customValidation: CustomValidation,
    public authFacotry: AuthService
  ) {}

  ngOnInit() {
    this.changedSlotsForm = this.formBuilder.group({
      monday: this.formBuilder.array(this.slots.map(x => !1)),
      tuesday: this.formBuilder.array(this.slots.map(x => !1)),
      wednesday: this.formBuilder.array(this.slots.map(x => !1)),
      thursday: this.formBuilder.array(this.slots.map(x => !1)),
      friday: this.formBuilder.array(this.slots.map(x => !1)),
      saturday: this.formBuilder.array(this.slots.map(x => !1)),
      sunday: this.formBuilder.array(this.slots.map(x => !1))
    });
    this.adminDetails = this.authFacotry.getAdminDetails();
    this.getOldSelectedSlots();
    this.changedSlotsForm.valueChanges.subscribe(val => {
      let i = 1;
      this.dayListArr.forEach(day => {
        let dayWiseList = this.getSelectedValue(day);
        if (dayWiseList && dayWiseList.length > 0) {
          this.staticTabs.tabs[i].disabled = false;
        }
        // else {
        //   if (typeof this.dayListArr[i] != "undefined") {
        //     let nextDayData = this.getSelectedValue(this.dayListArr[i]);
        //     if (nextDayData <= 0 && i < 7) {
        //       this.staticTabs.tabs[i].disabled = true;
        //     }
        //   }
        // }
        i++;
      });
    });
  }

  getOldSelectedSlots() {
    let sendDataToApi = {
      _id: this.adminDetails._id
    };
    this.changeSlotsFactory.getOldSelectedSlots(sendDataToApi).subscribe(
      response => {
        let finalResult = JSON.parse(JSON.stringify(response));
        if (finalResult.status == 200) {
          if (finalResult.data.slots) {
            this.isSlotAdded = true;
            const slotArr = finalResult.data.slots;
            this.dayListArr.forEach(day => {
              const linesFormArray = this.changedSlotsForm.get(
                day
              ) as FormArray;

              slotArr[day].forEach(element => {
                let findIndex = slots.findIndex(item => item.value == element);
                if (findIndex > -1) {
                  linesFormArray.at(findIndex).patchValue(true);
                }
              });
            });

            this.oldSlots = finalResult.data.slots;
            this.isFirstTime = false;
          } else {
            this.isFirstTime = true;
          }
        } else {
          this.toasterService.pop("error", "Error", finalResult.message);
        }
        this.disabledTabs();
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

  onTabSelect(e): void {
    this.day = e.heading;
    if (this.day == "Sunday") {
      this.enableSaveBtn = true;
    }
  }

  skipBtn(): void {
    this.staticTabs.tabs[this.disabledDayArr[this.day]].disabled = false;
    this.staticTabs.tabs[this.disabledDayArr[this.day]].active = true;
  }

  // saveAndContinue(isSkip: boolean = false): void {
  //   this.getSelectedSlots = this.getSelectedValue(this.day);
  //   this.getFinalSlot[this.day.toLowerCase()] = this.getSelectedSlots;
  //   if (isSkip === false) {
  //     switch (this.day) {
  //       case "Monday":
  //         if (this.getFinalSlot.monday.length) {
  //           this.staticTabs.tabs[1].disabled = false;
  //         } else {
  //           this.toasterService.pop(
  //             "error",
  //             "Error",
  //             "Please select at least one slot."
  //           );
  //           this.staticTabs.tabs[1].disabled = true;
  //           this.staticTabs.tabs[2].disabled = true;
  //           this.staticTabs.tabs[3].disabled = true;
  //           this.staticTabs.tabs[4].disabled = true;
  //           this.staticTabs.tabs[5].disabled = true;
  //           this.staticTabs.tabs[6].disabled = true;
  //         }
  //         break;
  //       case "Tuesday":
  //         if (this.getFinalSlot.tuesday.length) {
  //           this.staticTabs.tabs[1].disabled = false;
  //           this.staticTabs.tabs[2].disabled = false;
  //         } else {
  //           this.toasterService.pop(
  //             "error",
  //             "Error",
  //             "Please select at least one slot."
  //           );
  //           this.staticTabs.tabs[2].disabled = true;
  //           this.staticTabs.tabs[3].disabled = true;
  //           this.staticTabs.tabs[4].disabled = true;
  //           this.staticTabs.tabs[5].disabled = true;
  //           this.staticTabs.tabs[6].disabled = true;
  //         }
  //         break;
  //       case "Wednesday":
  //         if (this.getFinalSlot.wednesday.length) {
  //           this.staticTabs.tabs[1].disabled = false;
  //           this.staticTabs.tabs[2].disabled = false;
  //           this.staticTabs.tabs[3].disabled = false;
  //         } else {
  //           this.toasterService.pop(
  //             "error",
  //             "Error",
  //             "Please select at least one slot."
  //           );
  //           this.staticTabs.tabs[3].disabled = true;
  //           this.staticTabs.tabs[4].disabled = true;
  //           this.staticTabs.tabs[5].disabled = true;
  //           this.staticTabs.tabs[6].disabled = true;
  //         }
  //         break;
  //       case "Thursday":
  //         if (this.getFinalSlot.thursday.length) {
  //           this.staticTabs.tabs[1].disabled = false;
  //           this.staticTabs.tabs[2].disabled = false;
  //           this.staticTabs.tabs[3].disabled = false;
  //           this.staticTabs.tabs[4].disabled = false;
  //         } else {
  //           this.toasterService.pop(
  //             "error",
  //             "Error",
  //             "Please select at least one slot."
  //           );
  //           this.staticTabs.tabs[4].disabled = true;
  //           this.staticTabs.tabs[5].disabled = true;
  //           this.staticTabs.tabs[6].disabled = true;
  //         }
  //         break;
  //       case "Friday":
  //         if (this.getFinalSlot.friday.length) {
  //           this.staticTabs.tabs[1].disabled = false;
  //           this.staticTabs.tabs[2].disabled = false;
  //           this.staticTabs.tabs[3].disabled = false;
  //           this.staticTabs.tabs[4].disabled = false;
  //           this.staticTabs.tabs[5].disabled = false;
  //         } else {
  //           this.toasterService.pop(
  //             "error",
  //             "Error",
  //             "Please select at least one slot."
  //           );
  //           this.staticTabs.tabs[5].disabled = true;
  //           this.staticTabs.tabs[6].disabled = true;
  //         }
  //         break;
  //       case "Saturday":
  //         if (this.getFinalSlot.saturday.length) {
  //           this.staticTabs.tabs[1].disabled = false;
  //           this.staticTabs.tabs[2].disabled = false;
  //           this.staticTabs.tabs[3].disabled = false;
  //           this.staticTabs.tabs[4].disabled = false;
  //           this.staticTabs.tabs[5].disabled = false;
  //           this.staticTabs.tabs[6].disabled = false;
  //         } else {
  //           this.toasterService.pop(
  //             "error",
  //             "Error",
  //             "Please select at least one slot."
  //           );
  //           this.staticTabs.tabs[6].disabled = true;
  //         }
  //         break;
  //       case "Sunday":
  //         if (this.getFinalSlot.sunday.length) {
  //           this.enableSaveBtn = true;
  //         } else {
  //           this.toasterService.pop(
  //             "error",
  //             "Error",
  //             "Please select at least one slot."
  //           );
  //         }
  //         break;
  //     }
  //   } else {
  //     if (
  //       typeof this.staticTabs.tabs[this.disabledDayArr[this.day]] !=
  //       "undefined"
  //     ) {
  //       this.staticTabs.tabs[this.disabledDayArr[this.day]].disabled = false;
  //       this.staticTabs.tabs[this.disabledDayArr[this.day]].active = true;
  //     }
  //   }
  // }

  changedSlotsFormSubmit(): void {
    // if (this.day == "Sunday") {
    //   this.saveAndContinue();
    // }

    this.dayListArr.forEach(day => {
      this.getSelectedSlots = this.getSelectedValue(day);
      this.getFinalSlot[day.toLowerCase()] = this.getSelectedSlots;
    });

    let sendDataToApi = {
      _id: this.adminDetails._id,
      slots: this.getFinalSlot
    };
    if (
      this.getFinalSlot.monday.length ||
      this.getFinalSlot.tuesday.length ||
      this.getFinalSlot.wednesday.length ||
      this.getFinalSlot.thursday.length ||
      this.getFinalSlot.friday.length ||
      this.getFinalSlot.saturday.length ||
      this.getFinalSlot.sunday.length
    ) {
      this.changeSlotsFactory.changedSlots(sendDataToApi).subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.toasterService.pop("success", "Success", finalResult.message);
            this.getOldSelectedSlots();
          } else {
            this.toasterService.pop("error", "Error", finalResult.message);
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
    } else {
      this.toasterService.clear();
      this.toasterService.pop(
        "error",
        "Error",
        "Please select at least one slot."
      );
    }
  }

  disabledTabs() {
    if (this.isSlotAdded) {
      this.staticTabs.tabs[1].disabled = false;
      this.staticTabs.tabs[2].disabled = false;
      this.staticTabs.tabs[3].disabled = false;
      this.staticTabs.tabs[4].disabled = false;
      this.staticTabs.tabs[5].disabled = false;
      this.staticTabs.tabs[6].disabled = false;
    } else {
      this.staticTabs.tabs[1].disabled = true;
      this.staticTabs.tabs[2].disabled = true;
      this.staticTabs.tabs[3].disabled = true;
      this.staticTabs.tabs[4].disabled = true;
      this.staticTabs.tabs[5].disabled = true;
      this.staticTabs.tabs[6].disabled = true;
    }
  }

  updateSlots() {
    this.dayListArr.forEach(day => {
      this.getSelectedSlots = this.getSelectedValue(day);
      this.getFinalSlot[day.toLowerCase()] = this.getSelectedSlots;
    });
  }

  getSelectedValue(day: string) {
    let slots: any = [];
    let currDayValues = this.changedSlotsForm.controls[day.toLowerCase()];
    let finalValues = currDayValues.value;
    finalValues.map((x, i) => {
      if (x === true) {
        slots.push((i + 1).toString());
      }
    });
    return slots;
  }
}
