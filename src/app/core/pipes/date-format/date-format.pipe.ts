import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/es';  // Importa el paquete de idioma español

@Pipe({
  name: 'Fecha',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: any): string {
    let dateItem;
    if(!value) return '';
    if (typeof value == 'object' && value.getTime) {
      dateItem = moment(value.getTime());
    } else if (typeof value === 'number' && !isNaN(value)) {
      dateItem = moment(value);
    } else if (moment(value, 'DD/MM/YYYY', true).isValid()) {
      dateItem = moment(value, 'DD/MM/YYYY', true);
    } else if (moment(value, 'YYYY-MM-DD', true).isValid()) {
      dateItem = moment(value, 'YYYY-MM-DD', true);
    }
    moment.locale('es'); // Establece el idioma español

    // Formato colombiano: DD/MMM/YYYY DD: día, MMM: mes en letras
    if (dateItem) {
      return dateItem?.format('DD/MMM/YYYY').replace(/\b\w/g, l => l.toUpperCase()).replace('.','');
    }
    else {
      return '';
    }
  }
}
