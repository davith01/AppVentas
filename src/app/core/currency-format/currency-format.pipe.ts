import { Directive, ElementRef, HostListener, Input, Pipe, PipeTransform } from '@angular/core';
import { NgControl } from '@angular/forms';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'COP',
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: any): string {

    return formatCurrencyExp(value);
  }
}


export function formatCurrencyExp(numberT: any) {
  /*
    if (numberT == '0' || numberT == undefined) { return '$ 0'; }
  
    // Redondear el número a su valor entero
    const roundedValue = Math.round(numberT);
    // Determinar si el número es negativo
    const isNegative = roundedValue < 0;
    // Obtener el valor absoluto del número
    const absoluteValue = Math.abs(roundedValue);
  
    // Personalizacion del formato de moneda 
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,  // Establecer a 0 para eliminar los decimales
      maximumFractionDigits: 0,  // Establecer a 0 para eliminar los decimales
    });
  
    // Aplicar paréntesis si el número es negativo, de lo contrario, simplemente aplicar el formato
    const formattedValue = isNegative ? `(${formatter.format(absoluteValue)})` : formatter.format(absoluteValue);
  
    return formattedValue;*/
  if (numberT == undefined) return '$ 0';
  
  const numericValue = new BigNumber(numberT.toString().replace(/[^0-9]/g, '')).toNumber();
  const formattedValue = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);

  return formattedValue;
}


@Directive({
  selector: '[appCurrencyFormat]'
})
export class CurrencyFormatDirective {
  constructor(private el: ElementRef, private control: NgControl) { }

  @Input('appCurrencyFormat') decimalPlaces: number = 2;

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event: any) {
    this.format(event);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event: KeyboardEvent) {
    // Handle backspace to prevent deleting the currency symbol
    const inputValue = this.el.nativeElement.value;
    if (inputValue.length === 1) {
      this.control?.control?.setValue('0');
    }
  }

  format(value: string) {
    if (value) {
      const numericValue = parseFloat(value.replace(/[^0-9]/g, ''));
      const formattedValue = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numericValue);

      this.control?.control?.setValue(formattedValue);
    }
  }
}