import { Component, NgZone } from '@angular/core';
import { FirebaseAuthenticationService } from './core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AlertController, NavController } from '@ionic/angular';
import { StorageService } from './services';
import { ConnectionStatus, Network } from '@capacitor/network';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  animations: [
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
  animationState: String = 'hidden';
  networkStatus: boolean = false;

  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
    private readonly navCtrl: NavController,
    private readonly storageService: StorageService,
    private readonly alertController: AlertController,
    private readonly zone: NgZone) {

    this.initializeApp();
    this.initNetworkStatus();
  }

  private async initializeApp(): Promise<void> {
    await this.firebaseAuthenticationService.initialize();
  }

  async onLogout() {
    //emit value for the page change
    //this.pageSelectedEvent.setEvent('login');
    //remove the cache data
    this.storageService.removeUserAuth();

    await this.firebaseAuthenticationService.signOut();

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

  async initNetworkStatus() {
    const status = await Network.getStatus();
    this.networkStatus = status.connected;
    this.onNetworkStatusChange(status);

    Network.addListener('networkStatusChange', this.onNetworkStatusChange);
  }

  onNetworkStatusChange = (status: ConnectionStatus) => {
    this.zone.run(() => {
      this.animationState = status.connected ? 'hidden' : 'show';
    });
  }

}
