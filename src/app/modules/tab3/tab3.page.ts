import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  options = [
    { title: 'Nombres y Logo', image: 'assets/icon/names.png' },
    { title: 'Colores', image: 'assets/icon/theme.png' },
    { title: 'Lista de Transacciones', image: 'assets/icon/transaction.png' },
  ];

  constructor(private router: Router) {} 

  navigateToOption(option: any) {
    // Implementa la lógica de navegación a la opción seleccionada
    console.log('Navigating to:', option.title);
    // Puedes usar el Router para navegar a la página correspondiente
    // this.router.navigate(['/configuracion', option.title.toLowerCase()]);
  }

}
