import {AfterViewInit, Component, ElementRef, forwardRef, ViewChild, Injectable} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, NgControl} from "@angular/forms";

@Component({
  selector: 'app-email-address',
  templateUrl: './email-address.component.html',
  styleUrls: ['./email-address.component.css'],
  providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailAddressComponent),
      multi: true
    }]
})
export class EmailAddressComponent implements ControlValueAccessor, AfterViewInit {

  @ViewChild('ref') inputElement : ElementRef;

  onChange: (value: string) => void = () => {};
  onTouch: () => void = () => {};
  value = '';

  ngAfterViewInit(): void {
    this.setValue(this.value);
  }

  handleInput($event) {
    if(this.inputElement){
      $event.target.value = this.format($event.target.value);
      if(($event.target.value.match(/@(?=(?:(?:[^"]*"){2})*[^"]*$)/g) || []).length < 2)
        this.setValue(this.format($event.target.value));
        this.onChange(this.value);
        this.onTouch();
      } else {
        $event.target.value = this.format(this.value);
        $event.preventDefault();
      }
  }

  private setValue(value: string) {
    this.value = value;
    if (this.inputElement) {
      this.inputElement.nativeElement.value = this.value;
    }
  }

  private format(value : string) : string {
    if(value) {
    //https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript
      var email = value.split(/@(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      var local = "";
      var domain = "";
      var result = "";

      if(email.length == 1) {
         local = this.formatLocal(email[0]);
      } else {
         local = this.formatLocal(email[0]);
         domain = "@" + this.formatDomain(email[1]);
      }
      return local + domain;
    }
    return "";
  }

  private formatLocal(value : string) : string {
    var local = "";
    if(value) {
      local += value;
      return local;
    }
    return "";
  }

  private formatDomain(value : string) : string {
    var domain = "";
    if(value) {
      domain += value;
      return domain;
    }
    return "";
  }

  writeValue(value: any) {
    this.setValue(value);
  }

  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

}
