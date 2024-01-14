import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { NavController } from '@ionic/angular';
import { Client, ClientService, ScreenSizeService } from '@app/services';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  animations: [

    trigger('filterAnimation', [
      transition(':enter, * => 0, * => -1', []),
      transition(':increment', [
        query(':enter', [
          style({ opacity: 0, width: '0px' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, width: '*' })),
          ]),
        ], { optional: true })
      ]),
      transition(':decrement', [
        query(':leave', [
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 0, width: '0px' })),
          ]),
        ])
      ]),
    ]),
  ]
})
export class Tab1Page implements OnInit {

  _clientsFilter: Client[] = [];
  clients: Client[] = [];
  clientsTotal = -1;
  loading = false;
  isLandscape = false;


  constructor(
    public navCtrl: NavController,
    public clientService: ClientService,
    private screenSizeService: ScreenSizeService
    ) {
  } 

  async ngOnInit() {
    // Suscribe al observable del servicio para recibir actualizaciones sobre el tamaño de la pantalla
    this.screenSizeService.isLandscape$.subscribe((isLandscape) => {
      this.isLandscape = isLandscape;
    });
    
    // this.pageSelectedEvent.setEvent('tabs/tab1');
    const response = await this.clientService.listClients();
    this.clients = response.data;
    this._clientsFilter = response.data;
    this.loading = true;
  }

  findClient(event: any) {
    const query = (event.target.value || '').trim().toLowerCase();
    this._clientsFilter = query ? this.clients.filter(client => client.name.toLowerCase().includes(query)) : this.clients;
    this.clientsTotal = query ? this._clientsFilter.length : -1;
  }
  
  goToClientDetail(clientId: any) {
    this.navCtrl.navigateForward('client-detail', {
      queryParams: {
        clientId: clientId
      },
    });
  }
  
}