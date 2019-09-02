import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class CommonService {
  private messageSource = new BehaviorSubject<string>("Test Service");
  currentMessage = this.messageSource.asObservable();

  constructor() {}

  changeMessage(message: string) {
    this.messageSource.next(message);
  }
}
