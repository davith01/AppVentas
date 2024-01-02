import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface TransactionType {
  id: number;
  name: string;
  typeTransaction: string;
  icon: string;
  detail: boolean;
}

export interface SortState {
  direction: string;
  field: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionTypeService {

  constructor(
    private http: HttpClient) {
  }

  getList(): Promise<TransactionType[]> {

    const dataTypesUrl = 'assets/data/transaction-type.json';

    return new Promise((resolve, reject) => {
      this.http.get<TransactionType[]>(dataTypesUrl)
        .subscribe((data: TransactionType[]) => {
          resolve(data);
        });
    });
  }

}
