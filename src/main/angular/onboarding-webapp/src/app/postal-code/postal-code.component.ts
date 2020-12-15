import {AfterViewInit, Component, ElementRef, forwardRef, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-postal-code',
  templateUrl: './postal-code.component.html',
  styleUrls: ['./postal-code.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PostalCodeComponent),
    multi: true
  }]
})
export class PostalCodeComponent implements ControlValueAccessor, AfterViewInit {

  @ViewChild('ref') inputElement: ElementRef;

  onChange: (value: string) => void = () => {
  };
  onTouch: () => void = () => {
  };

  value = '';

  handleInput($event) {
    //doesn't match the pattern
    // if(true) {
    //   this.setValue(this.value);
    //   return false;
    // }
    this.setValue(this.format($event.target.value));

    this.onChange(this.value);
    this.onTouch();
  }

  format(value: string) {
    if(value) {
      value = value.replace(/\W/g, "");
      var letters = value.replace(/\d/g, "").toUpperCase();
      var numbers = value.replace(/\D/g, "");

      return (letters.length >= 1 ? letters.substring(0,1) : "") +
              (numbers.length >= 1 ? numbers.substring(0,1) : "") +
              (letters.length >= 2 && numbers.length >= 1 ? letters.substring(1,2) : "") +
              (numbers.length >= 2 && letters.length >= 2 ? " " + numbers.substring(1,2) : "") +
              (letters.length >= 3 && numbers.length >= 2 ? letters.substring(2,3) : "") +
              (numbers.length >= 3 && letters.length >= 3 ? numbers.substring(2,3) : "");
    }
    return "";
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

}
