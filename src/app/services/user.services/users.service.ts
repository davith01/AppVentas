import { Injectable } from '@angular/core';
 
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() {  }

  /* Login function for service */
  login(userAuth: any) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({data : { login : { token : 'dqeASDFQWERAdfasxfaer'} }});
        //reject({graphQLErrors:[{extensions:{category:'authentication'}}]});
      }, 1000);
    });
  }
}
