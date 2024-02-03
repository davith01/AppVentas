import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DialogService, FirebaseAuthenticationService, UserAuth } from '@app/core';
import { StorageService, UsersService } from '@app/services';
import { environment } from '@env/environment';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio';
import { AlertButton, AlertInput, AlertOptions, IonModal, Platform } from '@ionic/angular';
import { SignInResult } from '@capacitor-firebase/authentication';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { RedirectService } from '@app/services/redirect/redirect.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  urlIcon: string = '';
  faGear = faGear;
  urlIconHtml: SafeHtml | undefined;
  presentingElement: any;
  appName = environment.appName;
  labelConfigInput = 'http://localhost/';

  @ViewChild('modalFingerprint', { static: true }) modalFingerprint: IonModal | undefined;

  EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  signinForm = new FormGroup({
    email: new FormControl('', [Validators.required/*, Validators.pattern(this.EMAILPATTERN)*/]),
    password: new FormControl('', Validators.required),
  });

  // Validation error messages that will be displayed for each form field with errors.
  validation_messages = {
    'email': [
      { type: 'email', message: 'email inválido' },
      { type: 'required', message: 'Campo requerido.' }
    ],
    'password': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };

  isFingerprintAvailable: string | undefined;
  listUserAuthCache = [];
  loadingPreviousLogin: HTMLIonLoadingElement | undefined;

  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
    private readonly dialogService: DialogService,
    private readonly router: Router,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
    private sanitizer: DomSanitizer,
    private platform: Platform,
    private redirectService: RedirectService
  ) {
    this.initializeConfigProxy();
  }

  async ngOnInit() {

    //Permite abrir el modal que muestra los usuarios que ya tienen una cache asociada
    this.presentingElement = document.querySelector<HTMLElement>('.ion-page');

    this.storageService.getUrlIcon().subscribe((urlIcon) => {
      this.urlIcon = urlIcon;
    });
    
    this.urlIcon = this.urlIcon || environment.urlIcon;
    this.urlIconHtml = this.sanitizer.bypassSecurityTrustUrl(this.urlIcon);

    this.initializeAuthCache();
    const isPreviousLogin: boolean = await this.storageService.isPreviousLogin();
    if (isPreviousLogin) {
      this.loadingPreviousLogin = await this.dialogService.showLoading();
      await this.storageService.setIsPreviousLogin(!isPreviousLogin);
    }

    this.firebaseAuthenticationService.getRedirectResult()
      .then(async (singIn: SignInResult | undefined) => {
        //Google Authentication success
        if (singIn && singIn.user && singIn.user.emailVerified) {

          this.usersService.loginWithGoogle(singIn.user)
            .then(async (userAuth: UserAuth) => {
              //Login Authentication success
              this.loadingPreviousLogin?.dismiss();
              this.goToHome();
            }, (error) => {
              this.loadingPreviousLogin?.dismiss();
              this.dialogService.showMessage(JSON.stringify(error));
            }).catch((e)=>{
              this.loadingPreviousLogin?.dismiss();
              this.dialogService.showMessage(JSON.stringify(e));
            });
        }
        else {
          this.loadingPreviousLogin?.dismiss();
        }
      });

    this.firebaseAuthenticationService.phoneVerificationCompleted$.subscribe(
      () => this.goToHome()
    );

    this.firebaseAuthenticationService.phoneCodeSent$.subscribe(
      async (event) => {
        const verificationCode = await this.showInputVerificationCodeAlert();
        if (!verificationCode) {
          return;
        }
        let loadingElement: HTMLIonLoadingElement | undefined;
        try {
          loadingElement = await this.dialogService.showLoading();
          await this.firebaseAuthenticationService.confirmVerificationCode({
            verificationCode,
            verificationId: event.verificationId,
          });
          await loadingElement?.dismiss();
          await this.goToHome();
        } finally {
          await loadingElement?.dismiss();
        }
      });

    if (this.platform.is('capacitor')) {
      FingerprintAIO.isAvailable()
        .then(result => {
          this.isFingerprintAvailable = result;
        })
        .catch(err => { console.log(err); this.dialogService.showMessage(JSON.stringify(err)) });
    }

  }

  async initializeConfigProxy() {
    let valueInput = '';
    const config = await this.storageService.getConfig();
    if (config) {
      valueInput = config;
    }
    else {
      await this.storageService.setConfig(this.labelConfigInput);
    }
  }

  public async signInWithApple(): Promise<void> {
    await this.signInWith(SignInProvider.apple);
  }

  public async signInWithFacebook(): Promise<void> {
    await this.signInWith(SignInProvider.facebook);
  }

  public async signInWithGithub(): Promise<void> {
    await this.signInWith(SignInProvider.github);
  }

  public async signInWithGoogle(): Promise<void> {
   
    await this.storageService.setIsPreviousLogin(true);

    this.signInWith(SignInProvider.google).then((e) =>  alert(e), (e) => {

      if (JSON.stringify(e).includes('network-request-failed')) {
        this.dialogService.showErrorAlert({ header: 'Error de conexión', message: 'invocando el servicio de Google' });
      }
      else {
        this.dialogService.showErrorAlert({ message: e });
      }
    });
  }

  public async signInWithMicrosoft(): Promise<void> {
    await this.signInWith(SignInProvider.microsoft);
  }

  public async signInWithPlayGames(): Promise<void> {
    await this.signInWith(SignInProvider.playgames);
  }

  public async signInWithTwitter(): Promise<void> {
    await this.signInWith(SignInProvider.twitter);
  }

  public async signInWithYahoo(): Promise<void> {
    await this.signInWith(SignInProvider.yahoo);
  }

  public async signInWithPhoneNumber(): Promise<void> {
    let loadingElement: HTMLIonLoadingElement | undefined;
    try {
      const phoneNumber = await this.showInputPhoneNumberAlert();
      if (!phoneNumber) {
        return;
      }
      loadingElement = await this.dialogService.showLoading();
      await this.firebaseAuthenticationService.signInWithPhoneNumber({
        phoneNumber,
      });
      await loadingElement.dismiss();
    } finally {
      await loadingElement?.dismiss();
    }
  }

  private async signInWith(provider: SignInProvider): Promise<void> {
    const loadingElement = await this.dialogService.showLoading();
    try {
      switch (provider) {
        case SignInProvider.apple:
          await this.firebaseAuthenticationService.signInWithApple();
          break;
        case SignInProvider.facebook:
          await this.firebaseAuthenticationService.signInWithFacebook();
          break;
        case SignInProvider.github:
          await this.firebaseAuthenticationService.signInWithGithub();
          break;
        case SignInProvider.google:
          await this.firebaseAuthenticationService.signInWithGoogle();
          break;
        case SignInProvider.microsoft:
          await this.firebaseAuthenticationService.signInWithMicrosoft();
          break;
        case SignInProvider.playgames:
          await this.firebaseAuthenticationService.signInWithPlayGames();
          break;
        case SignInProvider.twitter:
          await this.firebaseAuthenticationService.signInWithTwitter();
          break;
        case SignInProvider.yahoo:
          await this.firebaseAuthenticationService.signInWithYahoo();
          break;
      }
      await this.goToHome();
    } finally {
      await loadingElement.dismiss();
    }
  }

  private async showInputPhoneNumberAlert(): Promise<string | undefined> {
    const data = await this.dialogService.showInputAlert({
      inputs: [
        {
          name: 'phoneNumber',
          type: 'text',
          placeholder: 'Phone Number',
        },
      ],
    });
    if (!data) {
      return;
    }
    return data.phoneNumber;
  }

  private async showInputVerificationCodeAlert(): Promise<string | undefined> {
    const data = await this.dialogService.showInputAlert({
      inputs: [
        {
          name: 'verificationCode',
          type: 'text',
          placeholder: 'Verification Code',
        },
      ],
    });
    if (!data) {
      return;
    }
    return data.verificationCode;
  }

  async onLogin() {

    if (this.signinForm.valid) {

      const loadingElement = await this.dialogService.showLoading();

      const email = this.signinForm.value.email || '';
      const password = this.signinForm.value.password || '';

      // Invoque the services login 
      this.usersService.login(email, password)
        .then((userAuth: UserAuth) => {
          loadingElement.dismiss();
          this.goToHome();
        }, (error) => {
          loadingElement.dismiss();
          this.dialogService.showMessage(JSON.stringify(error));
        });
    }
  }

  private async goToHome(): Promise<void> {
    //await this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
    this.redirectService.redirectTo('/tabs/tab1');
  }


  /**
 * Performs biometric verification using FingerprintAIO.
 * It shows the fingerprint authentication dialog with specified options.
 */
  async initializeAuthCache() {
    const list = await this.storageService.getUserAuthList();
    if (list) {
      this.listUserAuthCache = list.map((authCache: any) => {
        return Object.assign(authCache, {
          imageUrlSafe: this.sanitizer.bypassSecurityTrustResourceUrl(authCache.imageUrl)
        });
      });
    }
  }

  onFingerPrint(userAuthCache: UserAuth) {

    FingerprintAIO.show({
      disableBackup: true,
      cancelButtonTitle: 'Cancelar'
    })
      .then(async (result: any) => {

        const loadingElement = await this.dialogService.showLoading();
        await this.storageService.setUserAuth(userAuthCache);
        loadingElement.dismiss();
        this.goToHome();

      })
      .catch((error: any) => this.dialogService.showErrorAlert(error));
  }

  onPinAuth(userAuthCache: UserAuth) {
    let op: AlertOptions = {
      message: 'Ingresa tu PIN de acceso',
      inputs: [{
        type: 'number',
        placeholder: 'PIN (max 4 caracteres)',
        min: 1000,
        max: 9999,
      }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Alert canceled');
          },
        },
        {
          text: 'Entrar',
          role: 'confirm',
          handler: async (data: any) => {
            if (data[0] == userAuthCache.pin) {
              const loadingElement = await this.dialogService.showLoading();
              await this.storageService.setUserAuth(userAuthCache);
              loadingElement.dismiss();
              this.goToHome();
            }
            else {
              this.dialogService.showMessage('Pin incorrecto, por favor intenta de nuevo');
            }
          },
        },
      ]
    }
    this.dialogService.showInputAlert(op)
  }

  onCacheLogin(userAuthCache: UserAuth) {

    this.modalFingerprint?.dismiss();

    if (this.isFingerprintAvailable) {
      this.onFingerPrint(userAuthCache);
    } else {
      this.onPinAuth(userAuthCache);
    }
  }

  async onShowConfig() {
    const urlConfigCache = await this.storageService.getConfig();
    this.dialogService.showAlert({
      inputs: [
        {
          placeholder: this.labelConfigInput,
          value: urlConfigCache
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Alert canceled');
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: async (data: any) => {
            if (data && data[0]) {
              this.labelConfigInput = data[0];
              await this.storageService.setConfig(this.labelConfigInput);
            }
            else {
              this.dialogService.showErrorAlert({ message: 'El campo no puede estar vacio' });
            }
          },
        },
      ]
    });
  }
}

enum SignInProvider {
  apple = 'apple',
  facebook = 'facebook',
  github = 'github',
  google = 'google',
  microsoft = 'microsoft',
  playgames = 'playgames',
  twitter = 'twitter',
  yahoo = 'yahoo',
}
