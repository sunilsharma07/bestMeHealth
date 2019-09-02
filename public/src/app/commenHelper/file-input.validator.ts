import { Directive } from "@angular/core";
import { NG_VALIDATORS, Validator, FormControl } from "@angular/forms";

@Directive({
  selector: "[requireFile]",
  providers: [
    { provide: NG_VALIDATORS, useExisting: FileValidator, multi: false },
  ]
})
export class FileValidator implements Validator {
  static validate(c: FormControl): { [key: string]: any } {
    return c.value == null || c.value.length == 0 ? { "required": true } : null;
  }

  validate(c: FormControl): { [key: string]: any } {
    return FileValidator.validate(c);
  }

  validateImageFile(name: String) {
    let validFormats = ["png", "jpg", "jpeg"];
    let ext = name.substring(name.lastIndexOf(".") + 1);
    if (validFormats.indexOf(ext.toLowerCase()) === -1) {
      return false;
    } else {
      return true;
    }
  }

  validateCsvFile(name: String) {
    let validFormats = ["csv"];
    let ext = name.substring(name.lastIndexOf(".") + 1);
    if (validFormats.indexOf(ext.toLowerCase()) === -1) {
      return false;
    } else {
      return true;
    }
  }
}