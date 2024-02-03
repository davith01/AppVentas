import { Injectable } from '@angular/core';
import { User } from '@capacitor-firebase/authentication';
import { StorageService } from '../storage/storage.services';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthType, Color, Preload, UserAuth } from '@app/core';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = 'appVentas/api/login.php';
  private apiPreloadUrl = 'appVentas/api/preload.php';

  constructor(
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
    private http: HttpClient) { }

  /* Login function for service */
  login(email: string, pin: string): Promise<UserAuth> {

    return new Promise(async (resolve, reject) => {

      //const data = { email, pin: CryptoJS.AES.encrypt(pin, '123').toString()};
      const data = { email, pin };

      const configProxy = await this.storageService.getConfig();
      const url = configProxy + '/' + this.apiUrl;

      this.http.post(url, data)
        .subscribe(async (response: any) => {
          if (response) {
            const userAuth: UserAuth = await this.parseUserAuth(response, AuthType.PinAuth);
            resolve(userAuth);
          } else {
            reject('Error usuario o clave incorrectos');
          }

        }, (error) => {
          if (JSON.stringify(error).indexOf('"HttpErrorResponse"') > 0) {
            reject('No se pudo iniciar sesión: Servicio no disponible');
          }
          else {
            reject(`No se pudo iniciar sesión: ${JSON.stringify(error)}`);
          }
        });

    });
  }

  loginWithGoogle(user: User): Promise<UserAuth> {

    return new Promise(async (resolve, reject) => {
      const email = user.email;
      if (email) {

        const data = { email, authtype: 'googleAuth' };

        const configProxy = await this.storageService.getConfig();
        const url = configProxy + '/' + this.apiUrl;

        this.http.post(url, data)
          .subscribe({
            next: async (response: any) => {
              if (response) {
                response.imageUrl = user.photoUrl;
                const userAuth: UserAuth = await this.parseUserAuth(response, AuthType.GoogleAuth);
                resolve(userAuth);
              } else {
                reject('Error usuario o clave incorrectos');
              }
            }, error: (error) => {
              if (JSON.stringify(error).indexOf('"HttpErrorResponse"') > 0) {
                reject('No se pudo iniciar sesión: Servicio no disponible');
              }
              else {
                reject(`No se pudo iniciar sesión: ${JSON.stringify(error)}`);
              }
            }
          });
      }
      else { reject('No se pudo iniciar sesión: Error al recibir parámetros'); }

    });
  }

  async parseUserAuth(response: any, authType: AuthType) {

    let authlist = await this.storageService.getUserAuthList();
    authlist = authlist || [];
    const selectedIndex = authlist.findIndex((userAuthSelected: any) => userAuthSelected.email === response.email);
    const color = this.makeColor(response.email, authlist.length);
   
    const userAuth: UserAuth = Object.assign({}, response, {
      color: color.color,
      background: color.background,
      authType: authType,
    });
    
    if (selectedIndex === -1) {
      authlist.push(userAuth);
    }
    else {
      authlist[selectedIndex] = userAuth;
    }

    await this.storageService.setUserAuth(userAuth);
    await this.storageService.setUserAuthList(userAuth);

    return userAuth;
  }

  makeToken(length: number): string {
    const char = 'ABCDEFGQZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * char.length);
      token += char.charAt(randomIndex);
    }

    return token;
  }

  makeColor(name: string, listLength: number): Color {
    const colors = ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#000000', '#000000', '#ffffff', '#ffffff'];
    const background = ['#cb4335', '#7d3c98', '#2e86c1', '#138d75', '#28b463', '#d68910', '#ca6f1e', '#ba4a00', '#a93226', '#884ea0', '#2471a3', '#17a589', '#229954', '#d4ac0d', '#d0d3d4', '#a6acaf', '#839192', '#707b7c', '#2e4053', '#273746'];

    return { color: colors[listLength], background: background[listLength] };
  }



  preload(): Promise<Preload> {

    return new Promise(async (resolve, reject) => {

      const userAuth = await this.storageService.getUserAuth();
      const data = { email: userAuth?.email, token: userAuth?.token, version: userAuth?.version, action: 'loadAll'};

      const configProxy = await this.storageService.getConfig();
      const url = configProxy + '/' + this.apiPreloadUrl;

      this.http.post(url, data)
        .subscribe({
          complete() {
            
          },
          next: (response: any) => {
            if (response) {
              resolve(response);
            } else {
              reject('Error consultando datos');
            }
          }, error: (error) => {
            if (JSON.stringify(error).indexOf('"HttpErrorResponse"') > 0) {
              reject('No se pudo iniciar sesión: Servicio no disponible');
            }
            else {
              reject(`No se pudo iniciar sesión: ${JSON.stringify(error)}`);
            }
          }
        });

    });
  }
}
