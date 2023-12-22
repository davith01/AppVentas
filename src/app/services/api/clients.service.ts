import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';


export const CLIENTS = [
  { id: 11, name: 'VENTAS AL DIA' },
  { id: 12, name: 'PASTRANA' },
  { id: 13, name: 'CITRUS  AL POR MAYOR' },
  { id: 14, name: 'RAMIRO ARDILA' },
  { id: 15, name: 'PEPE' },
  { id: 16, name: 'HERMANA PEPE' },
  { id: 17, name: 'JAIRO SIERRA' },
  { id: 18, name: 'ECOFRESH' },
  { id: 19, name: 'ROGER' },
  { id: 20, name: 'EDISON VENTA ' }
];


@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private clients : any = [];

  constructor(public storage: Storage) {  }

  async listClients() { 
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.clients = CLIENTS;
        resolve({ data :  CLIENTS });
      }, 1000);
    });
    
  }
 
  getClient(clientId: string){
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if( !this.clients ) this.listClients();
        const client = this.clients.find((client: any)=>{return client.id == clientId});
        resolve({ data : client });
      }, 1000);
    });
  }
}
