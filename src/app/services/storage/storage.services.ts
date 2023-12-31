import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

const USER_AUTH = 'UserAuth';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public setUserAuth(value: any) {
    this._storage?.set(USER_AUTH, value);
  }

  public getUserAuth() {
    return this._storage?.get(USER_AUTH);
  }

  public removeUserAuth() {
    this._storage?.remove(USER_AUTH);
  }
}