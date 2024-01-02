import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { NavController } from '@ionic/angular';
import { ClientService } from '@app/services';

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

  _clients = [];
  _clientsOri: any;
  clientsTotal = -1;

  constructor(
    public navCtrl: NavController,
    public clientService: ClientService) {
  }

  get clients() {
    return this._clients;
  }

  async ngOnInit() {
   // this.pageSelectedEvent.setEvent('tabs/tab1');
   const response = await this.clientService.listClients();   
   this._clientsOri = response.data;
   this._clients = response.data;

  }

  findClient(event: any) {
    let query = event.target.value.toLowerCase();
    query = query ? query.trim() : '';

    this._clients = this._clientsOri.filter((client: any) => client.name.toLowerCase().includes(query.toLowerCase()));
    const newTotal = this._clients.length;

    if (!query) {
      this.clientsTotal = -1;
    }
    else if (this.clientsTotal !== newTotal) {
      this.clientsTotal = newTotal;
    }

  }

  goToClientDetail(clientId: any) {
    // Navigate to Page2 and pass parameters
    this.navCtrl.navigateForward('client-detail', {
      queryParams: {
        clientId: clientId
      },
    });
  }
}