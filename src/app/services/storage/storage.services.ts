import { Storage } from '@ionic/storage-angular';
import { Client, Delivery, Product, ProductCatalog, Provider, Transaction, TransactionType, UserAuth, Version } from '@app/core';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const USER_AUTH = 'UserAuth';
const USER_AUTH_LIST = 'UserAuthList';
const PREVIOUS_LOGIN = 'previousLogin';
const URL_ICON = 'urlIcon';
const CURRENT_DELIVERY = 'DeliveryCurrent';
const DELIVERY_LIST = 'Deliveries';
const CLIENT_LIST = 'Clients';
const CONFIG = 'config';
const VERSION = 'version';
const TRANSACTIONS = 'transactions';
const PRODUCTS = 'Products';
const PRODUCT_CATALOGS = 'ProductCatalogs';
const TRANSACTIONTYPES = 'TransactionTypes';
const PROVIDERS = 'Providers';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private _storage: Storage | null = null;
  private urlIconSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  setUrlIcon(value: any) {
    this._storage?.set(URL_ICON, value);
    this.urlIconSubject.next(value);
  }

  getUrlIcon(): Observable<any> {
    return this.urlIconSubject.asObservable();
  }  

  //User authentication
  setUserAuth(value: UserAuth) {
    return this._storage?.set(USER_AUTH, value);
  }

  getUserAuth(): Promise<UserAuth> | undefined {
    return this._storage?.get(USER_AUTH);
  }

  removeUserAuth() {
    this._storage?.remove(USER_AUTH);
  }

  async setUserAuthList(userAuth: UserAuth) {
    const list = (await this.getUserAuthList()) || [];
    const index = list.findIndex((item: any) => item.email === userAuth.email);
    // const newData = { color:email: userAuth.email, name: userAuth.name, imageUrl: userAuth.imageUrl, color: userAuth.color, authType: userAuth.authType };
    if (index !== -1) {
      Object.assign(list[index], userAuth);
    } else {
      list.push(userAuth);
    }

    return this._storage?.set(USER_AUTH_LIST, list);
  }

  getUserAuthList() {
    return this._storage?.get(USER_AUTH_LIST);
  }

  isPreviousLogin() {
    return this._storage?.get(PREVIOUS_LOGIN);
  }

  setIsPreviousLogin(previousLogin: boolean) {
    return this._storage?.set(PREVIOUS_LOGIN, previousLogin);
  }

  

  removeUrlIcon() {
    this._storage?.remove(URL_ICON);
  }

  //return delivery in course
  async getCurrentDelivery(userAuth: UserAuth) : Promise<any>{
    const key = `${CURRENT_DELIVERY}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  //set delivery in course
  async setCurrentDelivery(userAuth: UserAuth, delivery: any) {
    const key = `${CURRENT_DELIVERY}-id-${userAuth?.id}`;
    return this._storage?.set(key, delivery);
  }

  async removeCurrentDelivery(userAuth: UserAuth) {
    const key = `${CURRENT_DELIVERY}-id-${userAuth?.id}`;
    return this._storage?.set(key, undefined);
  }

  //return all deliveries
  async getDeliveries(userAuth: UserAuth): Promise<Delivery[]> {
    const key = `${DELIVERY_LIST}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }
   
  async setDeliveries(userAuth:UserAuth,deliveryList: Delivery[]) {
    const key = `${DELIVERY_LIST}-id-${userAuth?.id}`;
    return this._storage?.set(key, deliveryList);
  }

   //Config
  setConfig(value: string) {
    return this._storage?.set(CONFIG, value);
  }

  getConfig(): Promise<string> | undefined {
    return this._storage?.get(CONFIG);
  }

  //return all clients
  getClients(userAuth: UserAuth) {
    const key = `${CLIENT_LIST}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  setClients(userAuth: UserAuth, clientList: Client[]) {
    const key = `${CLIENT_LIST}-id-${userAuth?.id}`;
    return this._storage?.set(key, clientList);
  }
 
  //return version
  getVersion(userAuth: UserAuth): Promise<Version> | undefined {
    const key = `${VERSION}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  setVersion(userAuth: UserAuth, version: Version) {
    const key = `${VERSION}-id-${userAuth?.id}`;
    return this._storage?.set(key, version);
  }

   //return transactions
   getTransactions(userAuth: UserAuth): Promise<Transaction[]> | undefined {
    const key = `${TRANSACTIONS}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  setTransactions(userAuth: UserAuth, transactions: Transaction[]) {
    const key = `${TRANSACTIONS}-id-${userAuth?.id}`;
    return this._storage?.set(key, transactions);
  }

   //return products
   getProducts(userAuth: UserAuth): Promise<Product> | undefined {
    const key = `${PRODUCTS}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  setProducts(userAuth: UserAuth, transactions: Product[]) {
    const key = `${PRODUCTS}-id-${userAuth?.id}`;
    return this._storage?.set(key, transactions);
  }

  //return productCatalogs
  getProductCatalogs(userAuth: UserAuth): Promise<ProductCatalog[]> | undefined {
    const key = `${PRODUCT_CATALOGS}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  setProductCatalogs(userAuth: UserAuth, productCatalogs: ProductCatalog[]) {
    const key = `${PRODUCT_CATALOGS}-id-${userAuth?.id}`;
    return this._storage?.set(key, productCatalogs);
  }

  //return transactions_types
  getTransactionTypes(userAuth: UserAuth): Promise<TransactionType[]> | undefined {
    const key = `${TRANSACTIONTYPES}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  setTransactionTypes(userAuth: UserAuth, transactions: TransactionType[]) {    
    const key = `${TRANSACTIONTYPES}-id-${userAuth?.id}`;
    return this._storage?.set(key, transactions);
  }

  //return providers
  getProviders(userAuth: UserAuth): Promise<Provider[]> | undefined {
    const key = `${PROVIDERS}-id-${userAuth?.id}`;
    return this._storage?.get(key);
  }

  setProviders(userAuth: UserAuth, providers: Provider[]) {    
    const key = `${PROVIDERS}-id-${userAuth?.id}`;
    return this._storage?.set(key, providers);
  }
}