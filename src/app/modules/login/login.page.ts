import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DialogService, FirebaseAuthenticationService } from '@app/core';
import { StorageService, UsersService } from '@app/services';
import { environment } from '@env/environment';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showFingerPrint = true;
  urlIcon: string = '';
  urlIconHtml: SafeHtml | undefined;

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

  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
    private readonly dialogService: DialogService,
    private readonly router: Router,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
    private sanitizer: DomSanitizer,
    private platform: Platform,
    private fingerprintAIO: FingerprintAIO
  ) { }

  public async ngOnInit() {
    this.urlIcon = await this.storageService.getUrlIcon();
    this.urlIcon = this.urlIcon || environment.urlIcon;
    this.urlIconHtml = this.sanitizer.bypassSecurityTrustUrl(this.urlIcon);
    if (this.platform.is('capacitor')) {
      this.fingerprintAIO.isAvailable().then((result) => {
        //'finger' | 'face' | 'biometric'
        this.isFingerprintAvailable = result;
        }).catch((err) => {
        console.log({ err });
      });
    }   

    this.firebaseAuthenticationService.getRedirectResult().then((result) => {
      if (result?.user) {
        this.goToHome();
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
          await this.goToHome();
        } finally {
          await loadingElement?.dismiss();
        }
      }
    );
  }

  performBiometricVerification() {
    this.fingerprintAIO.show({
      disableBackup: true
    })
    .then((result: any) => this.dialogService.showErrorAlert(result))
    .catch((error: any) => this.dialogService.showErrorAlert(error));

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
    await this.signInWith(SignInProvider.google);
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
      let userAuth = { 'email': this.signinForm.value.email, 'password': this.signinForm.value.password };

      // Invoque the services login 
      this.usersService.login(userAuth)
        .then(async (response: any) => {

          loadingElement.dismiss();

          if (response.data && response.data.login) {
            userAuth = Object.assign(userAuth, response.data.login);
            await this.storageService.setUserAuth(userAuth);
            this.goToHome();
          }
        }, (error) => {
          loadingElement.dismiss();
          this.dialogService.showMessage('No se puede iniciar sesion');
        });
    }
  }

  private async goToHome(): Promise<void> {
    await this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
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
