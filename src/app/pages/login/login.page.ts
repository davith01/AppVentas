import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/api/users.service';
import { PageSelectedEventService } from 'src/app/services/page-selected-events';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: any;
  password: any;
  showFingerPrint = false;

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
  }


  constructor(public router: Router,
    public usersService: UsersService,
    public loadingCtrl: LoadingController,
    public pageSelectedEvent: PageSelectedEventService,
    public toastCtrl: ToastController) {

    this.usersService.removeUserAuthToken();
  }

  ngOnInit() {
    this.pageSelectedEvent.setEvent('login');
  }

  goToHome() {
    //continue with access to the app
    this.router.navigateByUrl('/tabs/tab1');
  }

  async onLogin(type: string, data: any) {

    if (this.signinForm.valid) {
      let loading: any = null;
      try {

        loading = await this.loadingCtrl.create({
          message: 'Por favor espere'
        });
        await loading.present();


      } catch (e) { }
      let userAuth = { 'email': data.email, 'password': data.password };

      // Invoque the services login 
      this.usersService.login(userAuth)
        .then((response: any) => {
          try { loading.dismiss(); } catch (e) { }
          if (response.data && response.data.login) {
            userAuth = Object.assign(userAuth, response.data.login);
            this.usersService.setUserAuthToken(userAuth);
            this.usersService.addUserAuthStorage(userAuth);
            this.goToHome();
          }
        }, (error: any) => {
          try { loading.dismiss(); } catch (e) { }
          const next = this.showError(error);
          if (next) {

            //get user auth storage
            this.usersService.isUserAuthStorage(userAuth)
              .then((isValid: boolean) => {
                if (isValid) {
                  this.usersService.setUserAuthToken(userAuth);
                  this.goToHome();
                }
                else {
                  this.showMessage('No se puede iniciar sesion');
                }
              });
          }
        });
    }
  }

  showError(error: any): boolean {

    if (error.graphQLErrors) {
      for (let err of error.graphQLErrors) {
        if (err.extensions.category === 'authentication') {
          this.showMessage('Usuario o clave incorrectos');
          return false;
        }
      }
    }
    return true;
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

}
