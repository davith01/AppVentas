import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'Fecha',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: any): string {
    let dateItem;

    if (typeof value == 'object' && value.getTime) {
      dateItem = moment(value.getTime());
    } else if (typeof value === 'number' && !isNaN(value)) {
      dateItem = moment(value);
    } else if (moment(value, 'DD/MM/YYYY', true).isValid()) {
      dateItem = moment(value, 'DD/MM/YYYY', true);
    }

    // Formato colombiano: DD/MM/YYYY
    return dateItem ? dateItem.format('DD/MM/YYYY') : '';
  }
}
