import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  TemplateRef
} from "@angular/core";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../commenHelper/auth.services";
import { NotesManagementService } from "./notesManagement.services";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import swal from "sweetalert2";
import { CustomValidation } from '../../commenHelper/customValidation';

@Component({
  selector: "app-notesManagement",
  templateUrl: "./notesManagement.component.html"
})
export class NotesManagementComponent
  implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings = {};
  notes: Array<any>;
  adminDetails;
  noteId;

  updateNoteForm: FormGroup;
  modalRef: BsModalRef;
  modalConfig = {
    animated: true,
    ignoreBackdropClick: true,
    keyboard: false,
    class: "modal-lg"
  };
  submitted: boolean = false;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject();

  userId: string;
  isGetSelfNote: boolean = false;
  constructor(
    public route: ActivatedRoute,
    public notesFactory: NotesManagementService,
    public toasterService: ToasterService,
    public authFactory: AuthService,
    private modalService: BsModalService,
    public router: Router,
    public customValidate: CustomValidation,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params.userId;
      if (params.getMyNotes && params.getMyNotes == "getMyNotes") {
        this.isGetSelfNote = true;
      }
    });
    this.adminDetails = this.authFactory.getAdminDetails();
    this.getNotes();
  }

  getNotes() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.userId = this.userId;
        if (this.isGetSelfNote == true) {
          dataTablesParameters.addedBy = this.adminDetails._id;
        }
        this.notesFactory.getNotes(dataTablesParameters).subscribe(
          respones => {
            let resData = JSON.parse(JSON.stringify(respones));
            this.notes = resData.data.data;
            callback({
              recordsTotal: resData.data.recordsTotal,
              recordsFiltered: resData.data.recordsFiltered,
              data: []
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
      },
      scrollCollapse: true,
      columns: this.isGetSelfNote
        ? [
            { data: "notes" },
            { data: "whoAdded" },
            { data: "adminRole" },
            { data: "action", searchable: false, orderable: false }
          ]
        : [{ data: "notes" }, { data: "whoAdded" }, { data: "adminRole" }]
    };
  }

  deleteNotes(noteId) {
    swal
      .fire({
        title: "Are you sure?",
        text: "You want to delete this note?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
        confirmButtonColor: "#E5A630"
      })
      .then(result => {
        if (result.value) {
          let sendDataToApi = {
            addedBy: this.adminDetails._id,
            _id: noteId,
            userId: this.userId
          };
          this.notesFactory.deleteNotes(sendDataToApi).subscribe(
            response => {
              swal.fire(
                "Deleted",
                "Note has been deleted successfully",
                "success"
              );
              this.rerender();
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

  editNoteBtn(template: TemplateRef<any>, note, note_id) {
    this.noteId = note_id;
    this.submitted = false;
    this.modalRef = this.modalService.show(template, this.modalConfig);
    this.updateNoteForm = new FormGroup({
      notes: new FormControl(note.trim(), [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(this.customValidate.white_space_first_char)
      ])
    });
  }

  updateNoteFormSubmit() {
    this.submitted = true;
    if (this.updateNoteForm.valid) {
      let sendDataToApi = {
        _id: this.noteId,
        addedBy: this.adminDetails._id,
        notes: this.updateNoteForm.value.notes,
        userId: this.userId
      };
      this.notesFactory.updateNotes(sendDataToApi).subscribe(
        response => {
          let finalResult = JSON.parse(JSON.stringify(response));
          if (finalResult.status == 200) {
            this.modalRef.hide();
            this.toasterService.pop("success", "Success", finalResult.message);
            this.rerender();
          } else {
            this.toasterService.pop(
              "error",
              "Error",
              "Oops! Something went wrong."
            );
          }
        },
        error => {
          this.toasterService.pop(
            "error",
            "Error",
            "Oops! Something went wrong."
          );
        }
      );
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
