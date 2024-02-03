import { Component, NgZone, OnInit } from '@angular/core';
import { AuthType, FirebaseAuthenticationService, fadeAnimation } from './core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AlertController, NavController } from '@ionic/angular';
import { StorageService } from './services';
import { ConnectionStatus, Network } from '@capacitor/network';
import { register } from 'swiper/element/bundle';
import { ScreenOrientation, OrientationType } from '@capawesome/capacitor-screen-orientation';
import { faGear,faGears,faIcons } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

register();

const routerOutlet = trigger('router-outlet', [
  state('show', style({
    top: '2.5rem',
  })),
  state('hidden', style({
    top: '0',
  })),
  transition('show => hidden', animate('1000ms ease-in-out')),
  transition('hidden => show', animate('1000ms ease-in-out')),
]);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  animations: [routerOutlet, fadeAnimation ]
})
export class AppComponent implements OnInit {

  pageSelected: string = '';
  animationState: String = 'hidden';
  networkStatus: boolean = false;
  faGear = faGear;
  faGears = faGears;
  faIcons = faIcons;
  isConfigMenuOpen = false;

  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
    private readonly navCtrl: NavController,
    private readonly storageService: StorageService,
    private readonly alertController: AlertController,
    private readonly zone: NgZone,
    private readonly router: Router,
  ) {
    this.initializeApp();
    this.initNetworkStatus();
  }

  private async initializeApp(): Promise<void> {
    await this.firebaseAuthenticationService.initialize();
  }

  async ngOnInit() {
    //this.lock();
  }

  async onLogout() {

    const userAuth = await this.storageService.getUserAuth();
    if (userAuth?.authType == AuthType.GoogleAuth) {
      await this.firebaseAuthenticationService.signOut();
    }

    //remove the cache data
    await this.storageService.removeUserAuth();

    //redirect to login page    
    await this.navCtrl.navigateRoot('/login');
    await this.router.navigate(['/login'], { replaceUrl: true });
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

  async lock() {
    await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE });
  };

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

  menuWillClose(){
    this.isConfigMenuOpen = false;
  }
}
