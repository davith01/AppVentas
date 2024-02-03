import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { trigger, state, style, animate, transition } from '@angular/animations';

const bannerState =  trigger('banner-state', [
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
]);

@Component({
  selector: 'app-network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.scss'],
  animations: [ bannerState  ]
})
export class NetworkStatusComponent {

  @Output() networkStatusChange: EventEmitter<any> = new EventEmitter();

  networkStatus: boolean = true;
  animationState: String = 'hidden';

  constructor(private zone: NgZone) {
    this.initStatus();
    Network.addListener('networkStatusChange', this.onNetworkStatusChange);
  }

  async initStatus() {
    const status = await Network.getStatus();
    this.networkStatus = status.connected;
    this.onNetworkStatusChange(status);
  }

  onNetworkStatusChange = (status: ConnectionStatus) => {
    this.zone.run(() => {
      this.networkStatus = status.connected;
      this.animationState = this.networkStatus ? 'hidden' : 'show';
      if (this.networkStatusChange) {
        this.networkStatusChange.emit(status);
      }
    });
  }

}
