import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'COP',
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number): string {

    // Redondear el número a su valor entero
    const roundedValue = Math.round(value);
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
  
      return formattedValue;
  }
}
