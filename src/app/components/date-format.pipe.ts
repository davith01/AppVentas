import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'Fecha',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string | null {

    if (value) {
      // Formato colombiano: DD/MM/YYYY
      const datePipe: DatePipe = new DatePipe('en-US');
      return datePipe.transform(value, 'dd/MM/yyyy');
    }
    return '';
  }
}
