import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { UsersService } from './services/api/users.service';
import { PageSelectedEventService } from './services/page-selected-events';
import { ConnectionStatus, Network } from '@capacitor/network';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
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
    ]),
    trigger('router-outlet', [
      state('show', style({
        top: '2.5rem',
      })),
      state('hidden', style({
        top: '0',
      })),
      transition('show => hidden', animate('1000ms ease-in-out')),
      transition('hidden => show', animate('1000ms ease-in-out')),
    ])
  ]
})
export class AppComponent {

  pageSelected: string = '';
  networkStatus: boolean = false;
  animationState: String = 'hidden';
  animationStateRouter: String = 'hidden';

  constructor(
    private usersService: UsersService,
    private navCtrl: NavController,
    private pageSelectedEvent: PageSelectedEventService,
    private alertController: AlertController) {

    this.initStatus();
    this.usersService.init();

    //create subscriber event
    this.pageSelectedEvent.getEvent().subscribe((data => {
      this.pageSelected = data;
    }));

    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      this.networkStatus = status.connected;
      if (status.connected) {
        this.animationState = 'hidden';
        setTimeout(() => {
          this.animationStateRouter = 'hidden';
        }, 2000);

      }
      else {
        this.animationState = 'show';
        this.animationStateRouter = 'show';
      }
    });
  }

  async initStatus() {
    this.networkStatus = (await Network.getStatus()).connected;
  }

  onLogout() {
    //emit value for the page change
    this.pageSelectedEvent.setEvent('login');
    //remove the cache data
    this.usersService.removeUserAuthToken();
    //redirect to login page
    this.navCtrl.navigateRoot('/login');
  }

  async presentAlerLogout() {
    const alert = await this.alertController.create({
      header: '¿Seguro que desea cerrar la sesión?',
      subHeader: '',
      message: 'Esta acción cerrará su sesión actual.',
      buttons: [
        {
          text: 'Cancelar',
          cssClass: "alert-button-cancel",
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'Cerrar Sesión',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.onLogout();
          },
        },
      ],
    });

    await alert.present();
  }

} 
