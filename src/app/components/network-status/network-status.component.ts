import { Component, OnInit } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.scss'],
  animations: [
    trigger('banner-state', [
      state('show', style({
        display: 'block',
        height: '*',
      })),
      state('hidden', style({
        opacity: '0',
        display: 'none',
        height: '0px',
      })),
      transition('show => hidden', animate('5000ms ease-in-out')),
      transition('hidden => show', animate('1000ms ease-in-out')),
    ])
  ]
})
export class NetworkStatusComponent implements OnInit {

  status: boolean = true;
  animationState: String = 'hidden';

  constructor() { this.initStatus(); }

  async initStatus() {

    this.status = (await Network.getStatus()).connected; 
    
    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      this.status = status.connected;
      if (this.status) {
        this.animationState = 'hidden';
      }
      else {
        this.animationState = 'show';
      }
      console.log(JSON.stringify(this.status));
    });
  }

  ngOnInit() { }

}
