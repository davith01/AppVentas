import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface DetailSales {
  date: string;
  category: string,
  quantity: number,
  unitPrice: number
}

export interface Client {
  id: number,
  name: string;
  selected?: boolean;
}

export interface ClientTransaction {
  id: number,
  date: string;
  transaction: string;
  quantity: number;
  price: number;
  paymentMethod?: string;
  syncRequired?: boolean;
  detail?: DetailSales[]
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly dataclientsUrl = 'assets/data/clients.json';
  private readonly dataclientsTransactionUrl = 'assets/data/client-transaction.json';
  clients: any;

  constructor(
    private http: HttpClient) { }

  listClients(): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      this.http.get<Client[]>(this.dataclientsUrl)
        .subscribe((response) => {
          this.clients = response;
          setTimeout(() => {
            resolve({ data: this.clients });
          }, 1000);

        });
    });
  }

  async getClient(clientId: string) {
    if (!this.clients) {
      await this.listClients();// Si la lista de clientes aún no está cargada, espera a que se cargue.
    }
    return new Promise((resolve, reject) => {
      const client = this.clients.find((client: any) => { return client.id == clientId });
      setTimeout(() => {
        resolve({ data: client });
      }, 1000);
    });
  }

  getClientTransaction(clientId: string): Promise<any | undefined> {

    return new Promise((resolve, reject) => {
      this.http.get<any[]>(this.dataclientsTransactionUrl)
        .subscribe((data) => {
          setTimeout(() => {
            resolve({ data: data });
          }, 1000);
        })
    });
  }

}
