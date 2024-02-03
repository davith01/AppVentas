import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.services';
import { Client, Delivery, ProductCatalog, Transaction, TransactionType, UserAuth } from '@app/core';
import * as moment from 'moment';
import { ClientInputCss } from '@app/modules/deposit/deposit.page';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService) {
  }

  async getDeliveries(userAuth: UserAuth): Promise<Delivery[]> {

    const deliveries = await this.storageService.getDeliveries(userAuth);
    const transactions = await this.storageService.getTransactions(userAuth);
    const providers = await this.storageService.getProviders(userAuth);

    const transactionTypes = await this.storageService.getTransactionTypes(userAuth);

    for (const delivery of deliveries) {
      delivery.transactions = transactions?.filter(transaction => transaction.delivery_id === delivery.id);
      const providerIds = JSON.parse(delivery.provider_ids);
      delivery.providers = providers?.filter(provider => providerIds.includes(Number(provider.id)));
      delivery.transactionType = transactionTypes?.find(transactionType => transactionType.id === delivery.transaction_type_id);
    }
    return deliveries;
  }

  async getTransactionsByClient(clientId: number): Promise<Transaction[] | undefined> {

    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    const transactions = await this.storageService.getTransactions(userAuth) as Transaction[];
    const productCatalogs = await this.storageService.getProductCatalogs(userAuth) as ProductCatalog[];
    const transactionTypes = await this.storageService.getTransactionTypes(userAuth) as TransactionType[];

    const sortFunction = (a: any, b: any) => {
      const dateA = moment(a.date, 'DD/MM/YYYY');
      const dateB = moment(b.date, 'DD/MM/YYYY');
      // return direction === 'asc' ? dateA.isAfter(dateB) ? 1 : -1 : dateB.isAfter(dateA) ? 1 : -1;
      return dateA.isAfter(dateB) ? 1 : -1;
    };

    return new Promise((resolve, reject) => {
      const filteredTransactions = transactions?.filter(tx => tx.client_id === clientId);
      let balance = 0;
      filteredTransactions.sort(sortFunction);

      filteredTransactions?.forEach(tx => {

        tx.units = Number(tx.units);
        tx.transactionType = transactionTypes.find(transactionType => transactionType.id == tx.transaction_type_id);
        let totalDetail = 0;
        if (tx.transactionsDetail && tx.transactionsDetail.length > 0) {
          tx.transactionsDetail?.forEach(detail => {
            detail.productCatalog = productCatalogs.find(pc => pc.id == detail.product_catalog_id);
            detail.price = Number(detail.price);
            detail.units = Number(detail.units);
            totalDetail += Number(detail.price) * Number(detail.units);
          });
        }
        else {
          totalDetail = (tx.price * tx.units);
        }
        balance += totalDetail;
        tx.balanceAfter = balance;
      });

      resolve(filteredTransactions);
    });

  }

  //Save delivery
  async saveDelivery(userAuth: UserAuth, delivery: Delivery) : Promise<boolean> {
    //TODO: Invocar servicio para guardar en bd..  
    let hasError = false;
    if (delivery.syncRequired) {
      hasError = true;
    }
    
    delivery.syncRequired = hasError;

    const deliveryList: Delivery[] = await this.getDeliveries(userAuth) || [];
    const selectedIndex = deliveryList.findIndex(selectedItem => selectedItem.id === delivery.id);

    if (selectedIndex !== -1) {
      deliveryList[selectedIndex] = delivery;
    } else {
      deliveryList.push(delivery);
    }

    this.storageService.setDeliveries(userAuth, deliveryList);
    
    return true;
  }

  async saveTransaction(userAuth: UserAuth, transaction: Transaction):Promise<boolean> {

    //Save Transaction
    //TODO: Invocar servicio para guardar en bd..
    let hasError = false;
    if (transaction.syncRequired) {
      hasError = true;
    }

    transaction.syncRequired = hasError;

    //Modify transaction List in cache
    const transactions = await this.storageService.getTransactions(userAuth) as Transaction[];
    const selectedIndex = transactions.findIndex(t => t.id == transaction.id);
    if (selectedIndex !== -1) {
      transactions[selectedIndex] = transaction;
    }
    else {
      transactions.push(transaction);
    }
    await this.storageService.setTransactions(userAuth, transactions);

    return true;
  }

  async saveClient(userAuth: UserAuth, client: Client) {

    //Modify clients as the balance will change
    const clients = await this.storageService.getClients(userAuth) as Client[];
    const selectedClientIndex = clients.findIndex(c => c.id == client.id);
    if (selectedClientIndex !== -1) {
      clients[selectedClientIndex] = client;
    }
    await this.storageService.setClients(userAuth, clients);
  }

}
