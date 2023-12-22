import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private _storage: Storage | null = null;

  constructor(public storage: Storage) {  }

  /* Token Authentication Storage */
  async init() {
    this._storage = await this.storage.create();
  }

  setUserAuthToken(userAuth: any) { 
    this._storage?.set('userAuthToken', userAuth);
  }

  getUserAuthToken(){
    return this._storage?.get('userAuthToken');
  }

  removeUserAuthToken() {
    this._storage?.remove('userAuthToken');
  }

  /* Login function for service */
  login(userAuth: any) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({data : { login : { token : 'dqeASDFQWERAdfasxfaer'} }});
        //reject({graphQLErrors:[{extensions:{category:'authentication'}}]});
      }, 1000);
    });
  }

   

  /* Users list authentication Storage */
  addUserAuthStorage(userAuth: any) {
    //retrive users authentication list and replace current user if exists
    this._storage?.get('users-auth-list').then((usersAuthList: any) => {
      usersAuthList = usersAuthList ? usersAuthList.filter((dataAuth: any) => {
        return userAuth.email !== dataAuth.email;
      }) : [];

      //save user authentication list
      usersAuthList.push(userAuth);
      this.storage.set('users-auth-list', usersAuthList);
    });
  }

  //return true if user auth data match in the user auth list
  isUserAuthStorage(userAuth: any): Promise<boolean> {
    return new Promise(resolve => {
      this.storage.get('users-auth-list').then((usersAuthList: any) => {
        usersAuthList = usersAuthList ? usersAuthList.filter((dataAuth: any) => {
          return userAuth.email === dataAuth.email && userAuth.password === dataAuth.password;
        }) : [];

        //Return user authentication data if exists
        resolve(usersAuthList[0]);
      });
    });
  }

}
