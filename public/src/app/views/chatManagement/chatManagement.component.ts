import { Component, OnInit, ViewChild, ElementRef, Renderer2, ApplicationRef } from '@angular/core';
//import { Socket } from 'ng-socket-io';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { FileValidator } from '../../commenHelper/file-input.validator';
import { ChatManagementService } from './chatManagement.services';
import swal from 'sweetalert2';
import { CustomValidation } from "../../commenHelper/customValidation";
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../commenHelper/auth.services';
// import { Lightbox } from 'angular2-lightbox';

@Component({
  templateUrl: './chatManagement.component.html'
})

export class ChatManagementComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  /*constructor(private socket: Socket) { 
    
  }*/

  public chatForm: FormGroup;
  submitted: boolean = false;
  socket: any;
  user_data: any;
  socket_id: any;
  userImgPath: String = "";
  chatConversion: any;
  chatHistory: any = [];
  current_open_chat_index: Number = 0;
  current_open_chat_data: any;
  imageUrl: any;
  imageUploadExtentionError: boolean = false;
  uplodedImgId: String = "";
  test: Number = 0;
  broker_id: Number = 0;
  private _albums: Array<any> = [];
  cti: Number = 0;
  constructor(
    private fb: FormBuilder,
    public filevalidator: FileValidator,
    public ChatManagementService: ChatManagementService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private applicationRef: ApplicationRef,
    public customValidate: CustomValidation,
    private activeRoute: ActivatedRoute,
    public authFactory: AuthService,
    // private _lightbox: Lightbox
  ) {
    this.socket = io.connect(environment.socketUrl, {});
    // this.socket_id = this.socket.id;
    this.userImgPath = environment.userImgPath;
    this.broker_id = this.activeRoute.snapshot.params['broker_id'];
  }

  ngOnInit() {
    this.user_data = this.authFactory.getAdminDetails();
    this.creatForm();
  }
  ngAfterViewInit() {
    let vm = this;
    let socket = this.socket;
    socket.on('connected', function (data) {
      console.log('Socket Connected !');
      if (localStorage.getItem('carSummer_access_token') && localStorage.getItem('carSummer_user_data')) {
        vm.user_data = JSON.parse(localStorage.getItem('carSummer_user_data'));
      }
      socket.emit('user_join', { "user_id": vm.user_data._id, "socket_id": socket.id }, function (res) {
        vm.getChatConversion(1);
      });
    });

    socket.on('server_message', function (res) {
      if (res && res.status == 1) {
        for (let item of res.data) {
          if (item.conv_date && item.conv_date != "") {
            let today = (moment().format('DD/MM/YYYY'));
            if (today == moment(item.conv_date).format('DD/MM/YYYY')) {
              //item.created = moment(item.created).format(environment.chatTodayFormat)
              item.conv_date = moment.utc(item.conv_date).local().format(environment.chatTodayFormat);
            } else {
              //item.created = moment(item.created).format(environment.chatOtherdayFormat)
              item.conv_date = moment.utc(item.conv_date).local().format(environment.chatOtherdayFormat);
            }
          }
          vm.chatHistory.push(item);
          vm.getChatConversion();
          setTimeout(function () {
            var objDiv = document.getElementById("scroll_content");
            objDiv.scrollTop = objDiv.scrollHeight;
          }, 20);
        }
      }
    });
  }

  creatForm() {
    this.chatForm = this.fb.group({
      'message': [null, [Validators.required]],
      'chat_file': [null]
    });
  }

  setUserDefaultImage($event) {
    $event.target.src = `${environment.userImgNotFound}`;
  }

  // openLargeImage($event): void {
  //   // open lightbox
  //   let vm = this;
  //   const album = {
  //     src: $event.target.src,
  //     caption: "",
  //     thumb: $event.target.src
  //   };
  //   vm._albums = [];
  //   vm._albums.push(album);
  //   //console.log("vm._albums",vm._albums);
  //   this._lightbox.open(vm._albums, 0);
  // }


  getChatConversion(first_time = 0) {
    console.log('first time ', first_time)
    let vm = this;
    if (this.user_data) {
      this.socket.emit('get_chat_conversation', { "user_id": this.user_data._id }, function (res) {
        if (res && res.status == 1) {
          vm.chatConversion = res.data;
          console.log("vm.chatConversion", vm.chatConversion);
          let i = 0;
          let temp_conversation = [];
          let flag = 0;
          for (let item of vm.chatConversion) {
            if (first_time == 1 && flag == 0) {
              vm.getChatHistory(item.customerId, 0);
              flag = 1;
            } else if ((i == 0) && (vm.chatConversion.length > 0) && (first_time == 1)) {
              vm.getChatHistory(item.customerId, 0);
            } else if (first_time == 0) {

              setTimeout(function () {
                var elems = document.querySelectorAll(".friend_list");
                let j = 0;
                [].forEach.call(elems, function (el) {
                  if (j == vm.cti) {
                    el.classList.add("active");
                  }
                  j++;
                });
              }, 400);

            }
            if (item.conv_date && item.conv_date != "") {
              let today = (moment().format('DD/MM/YYYY'));
              if (today == moment(item.conv_date).format('DD/MM/YYYY')) {
                item.createdAt = moment(item.createdAt).format(environment.chatTodayFormat)
                item.conv_date = moment.utc(item.conv_date).local().format(environment.chatTodayFormat);
              } else {
                item.createdAt = moment(item.createdAt).format(environment.chatOtherdayFormat)
                item.conv_date = moment.utc(item.conv_date).local().format(environment.chatOtherdayFormat);
              }
            }
            i++;
          }
        }
      });
    }
  }

  getChatHistory(receiver_id, current_open_chat_index, event = null) {
    console.log("in chat history", receiver_id);
    var elems = document.querySelectorAll(".friend_list");
    [].forEach.call(elems, function (el) {
      el.classList.remove("active");
    });

    if (event) {
      event.target.classList.add('active');
    } else {
      setTimeout(function () {
        var elems = document.querySelectorAll(".friend_list");
        let i = 0;
        [].forEach.call(elems, function (el) {
          if (i == current_open_chat_index) {
            el.classList.add("active");
          }
          i++;
        });
      }, 1000);

    }

    this.current_open_chat_data = this.chatConversion[current_open_chat_index];
    let vm = this;
    vm.cti = current_open_chat_index;
    this.socket.emit('get_chat_history', { "sender_id": this.user_data._id, "receiver_id": receiver_id }, function (res) {
      if (res && res.status == 1) {
        vm.chatHistory = res.data;
        console.log("history-->", vm.chatHistory);
        for (let item of vm.chatHistory) {
          if (item.conv_date && item.conv_date != "") {
            let today = (moment().format('DD/MM/YYYY'));
            if (today == moment(item.conv_date).format('DD/MM/YYYY')) {
              item.createdAt = moment.utc(item.createdAt).local().format(environment.chatTodayFormat);
            } else {
              item.createdAt = moment.utc(item.createdAt).local().format(environment.chatOtherdayFormat);
            }
          }
        }
      }
    });

    setTimeout(function () {
      var objDiv = document.getElementById("scroll_content");
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 200);

  }

  chatFormSubmit() {
    this.submitted = true;
    let vm = this;
    if (this.chatForm.valid && this.chatForm.value.message.trim() != "") {
      let params = this.chatForm.value;
      params.message = params.message.trim();
      //console.log("params",params);
      let formdata: FormData = new FormData();
      for (var key in params) {
        formdata.append(key, params[key])
      }
      console.log(vm.current_open_chat_data)
      this.socket.emit('send_message', {
        "sender_id": vm.user_data._id,
        "receiver_id": vm.current_open_chat_data.customerId,
        "message": this.chatForm.value.message
      }, function (res) {
        console.log('send msg result', res)
        if (res && res.status == 1) {
          let pushData = {
            "chat_id": res.data[0].message_id,
            // "chat_image_name": null,
            // "chat_type": 0,
            // "conv_date": moment.utc(res.data[0].conv_date).local().format(environment.chatTodayFormat),
            //"created":moment(res.data[0].created).format(environment.chatTodayFormat),
            "createdAt": res.data[0].createdAt,
            // "image_id": null,
            "message": res.data[0].message,
            "message_id": res.data[0].message_id,
            // "msg_status": 0,
            // "offer_id": null,
            "senderId": vm.user_data._id,
            "receiverId": vm.current_open_chat_data.receiverId,
          }
          vm.chatHistory.push(pushData);
          vm.applicationRef.tick();
          vm.getChatConversion();
          vm.creatForm();

          setTimeout(function () {
            var objDiv = document.getElementById("scroll_content");
            objDiv.scrollTop = objDiv.scrollHeight;
          }, 20);
        } else {

        }
      });
    }
  }

  // Get Image
  chatFileUpload(e) {
    let vm = this;
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {
        this.imageUrl = reader.result;
      }

      if (!this.filevalidator.validateImageFile(file.name)) {
        this.imageUploadExtentionError = true;

        swal.fire("Error", "Please upload png, jpg or jpeg file", "warning");
      } else {
        this.imageUploadExtentionError = false;
        this.imageUrl = file;

        let formdata: FormData = new FormData();
        formdata.append('chat_image', this.imageUrl);

        this.ChatManagementService.chat_image_upload(formdata).subscribe(

          response => {
            if (response['response']['status_code'] == 200) {
              vm.uplodedImgId = response['response']['data']['image_id'];
              this.socket.emit('send_chat_file', {
                "sender_id": vm.user_data._id,
                "receiver_id": vm.current_open_chat_data.chat_receiver_id,
                "image_id": vm.uplodedImgId,
                "local_id": "0",
                "chat_type": "1"
              }, function (res) {
                if (res && res.status == 1) {
                  let pushData = {
                    "chat_id": res.data[0].message_id,
                    "chat_image_name": res.data[0].chat_image_name,
                    "chat_type": 1,
                    "conv_date": moment.utc(res.data[0].conv_date).local().format(environment.chatTodayFormat),
                    //"created":moment(res.data[0].created).format(environment.chatTodayFormat),
                    "created": res.data[0].created,
                    "image_id": vm.uplodedImgId,
                    "message": res.data[0].message,
                    "message_id": res.data[0].message_id,
                    "msg_status": 0,
                    "offer_id": null,
                    "sender_id": vm.user_data._id,
                    "receiver_id": vm.current_open_chat_data.chat_receiver_id,
                  }
                  vm.chatHistory.push(pushData);
                  vm.getChatConversion();
                  vm.creatForm();

                  setTimeout(function () {
                    var objDiv = document.getElementById("scroll_content");
                    objDiv.scrollTop = objDiv.scrollHeight;
                  }, 20);
                } else {
                  swal.fire("Error", "Oops something went wrong", "error");
                }
              });
            } else {
              swal.fire("Error", response['response']['message'], "error");
            }
          },
          error => {
            //alert
            swal.fire("Error", "Oops something went wrong", "error");
          }
        );
      }
      // reader.readAsDataURL(file); // Base 64 convert
    } else {
      this.imageUploadExtentionError = false;
      //alert
    }
  }
  displayOfferDeclineReason(message) {
    swal.fire("Reason", message);
  }

}
