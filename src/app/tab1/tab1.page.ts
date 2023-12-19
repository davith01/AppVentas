import { Component, HostBinding, OnInit } from '@angular/core';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { NavController } from '@ionic/angular';
import { UsersService } from '../services/users.service';
import { SynchronizeEventService } from '../services/synchronize event';

export const CLIENTS = [
  { id: 11, name: 'VENTAS AL DIA' },
  { id: 12, name: 'PASTRANA' },
  { id: 13, name: 'CITRUS  AL POR MAYOR' },
  { id: 14, name: 'RAMIRO ARDILA' },
  { id: 15, name: 'PEPE' },
  { id: 16, name: 'HERMANA PEPE' },
  { id: 17, name: 'JAIRO SIERRA' },
  { id: 18, name: 'ECOFRESH' },
  { id: 19, name: 'ROGER' },
  { id: 20, name: 'EDISON VENTA ' }
];

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.client, form', [
          style({ opacity: 0, transform: 'translateY(-100px)' }),
          stagger(-30, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))
          ])
        ])
      ])
    ]),
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

  constructor(
    public navCtrl: NavController,
    public usersService: UsersService,
    public synchronizeEvent: SynchronizeEventService) { }

  goToLogin() {
    this.usersService.removeUserAuthToken();
    this.navCtrl.navigateRoot('/login');
  }

  @HostBinding('@pageAnimations')
  public animatePage = true;

  _clients: any = [];
  clientsTotal = -1;

  get clients() {
    return this._clients;
  }

  ngOnInit() {
    this._clients = CLIENTS;
  }

  findClient(event: any) {
    let query = event.target.value.toLowerCase();
    query = query ? query.trim() : '';

    this._clients = CLIENTS.filter(client => client.name.toLowerCase().includes(query.toLowerCase()));
    const newTotal = this._clients.length;

    if (!query) {
      this.clientsTotal = -1;
    }
    else if (this.clientsTotal !== newTotal) {
      this.clientsTotal = newTotal;
    }

  }
}