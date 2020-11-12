import {AfterViewInit, Component, ElementRef, forwardRef, ViewChild, Injectable} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, NgControl} from "@angular/forms";

@Component({
  selector: 'app-phone-number',
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.css'],
  providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneNumberComponent),
      multi: true
    }]
})

export class PhoneNumberComponent implements ControlValueAccessor, AfterViewInit {

    @ViewChild('ref') inputElement: ElementRef;

    onChange: (value: string) => void = () => {};
    onTouch: () => void = () => {};
    value = '';

    handleInput($event) {
      if(this.inputElement){
        if(this.inputElement.nativeElement.validity && !this.inputElement.nativeElement.validity.valid
           && $event.target.value.length > 13){
             $event.target.value = this.value;
             $event.preventDefault();
        } else {
           this.setValue(this.format($event.target.value));
           this.onChange(this.value);
           this.onTouch();
        }
      }
    }

    ngAfterViewInit(): void {
      this.setValue(this.value);
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

    private setValue(value: string) {
      this.value = value;
      if (this.inputElement) {
        this.inputElement.nativeElement.value = this.value;
      }
    }

    format(value: string){
      if(value) {
        value = value.replace(/\D/g, "");
        return (value.length > 0 ? "(" + value.substring(0,3) : "") +
               (value.length > 3 ? ")" : "") +
               (value.length > 3 ? value.substring(3,6) : "") +
               (value.length > 6 ? "-" : "") +
               (value.length > 6 ? value.substring(6,10) : "");
      }
      return "";
    }

}
