import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly dataclientsUrl = '../../../assets/data/clients.json';
  private readonly dataclientsTransactionUrl = 'assets/data/client-transaction.json';
  clients: any;

  constructor(
    private http: HttpClient) { }

  listClients(): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(this.dataclientsUrl)
        .subscribe((response) => {
          this.clients = response;
          resolve({ data: this.clients });
        });
    });
  }

  async getClient(clientId: string) {
    if (!this.clients) {
      await this.listClients();// Si la lista de clientes aún no está cargada, espera a que se cargue.
    }
    return new Promise((resolve, reject) => {
      const client = this.clients.find((client: any) => { return client.id == clientId });
      resolve({ data: client });
    });
  }

  getClientTransaction(clientId: string): Promise<any | undefined> {

    return new Promise((resolve, reject) => {
      this.http.get<any[]>(this.dataclientsTransactionUrl)
      .subscribe((data) => {
        resolve({ data: data });
      })
    });
  }

}
