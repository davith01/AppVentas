import { Component, HostBinding, OnInit } from '@angular/core';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { NavController } from '@ionic/angular';
import { UsersService } from '../services/api/users.service';
import { PageSelectedEventService } from '../services/page-selected-events';
import { ClientService } from '../services/api/clients.service';

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
export class Tab1Page {

  _clients: any ;
  _clientsOri: any ;
  clientsTotal = -1;

  constructor(
    public navCtrl: NavController,
    public usersService: UsersService,
    public clientService: ClientService,
    public pageSelectedEvent: PageSelectedEventService) {
      
    this.clientService.listClients()
      .then((response: any) => {
        this._clientsOri = response.data;
        this._clients = response.data;
      }).catch(e => console.log(e));
  }

  get clients() {
    return this._clients;
  }

  ngOnInit() {
    this.pageSelectedEvent.setEvent('tabs/tab1');
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

  goToClient(clientId: any) {
    // Navigate to Page2 and pass parameters
    this.navCtrl.navigateForward('client-detail', {
      queryParams: {
        clientId: clientId
      },
    });
  }
}