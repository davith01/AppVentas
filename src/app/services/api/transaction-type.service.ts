import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';
import { TransactionType } from 'src/app/model';


@Injectable({
  providedIn: 'root'
})
export class TransactionTypeService {

  private _storage: Storage | null = null;
  private readonly dataTypesUrl = 'assets/data/transaction-type.json';


  constructor(
    public storage: Storage,
    private http: HttpClient) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  getList(): Promise<TransactionType[] | undefined> {
    return this.http.get<TransactionType[]>(this.dataTypesUrl).toPromise();
  }

}
