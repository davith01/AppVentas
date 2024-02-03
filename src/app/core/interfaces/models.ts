import { SafeHtml } from "@angular/platform-browser";

export interface Version {
  version: number;
  syncRequired: boolean;
  date: Date
}

export enum AuthType {
  GoogleAuth = 'googleAuth',
  PinAuth = 'pinAuth'
}

export enum TargetType {
  Credit = 'credit',
  Debt = 'debt'
}

export interface Product {
  id: number;
  name: string;
}

export interface ProductCatalog {
  id: number;
  parent?: ProductCatalog;
  name: string;
  product?: Product;
  price?: number;
}

export interface TransactionType {
  id: number;
  name: string;
  targetType: TargetType;
  icon?: string;
  product?: Product;
  detail?: boolean;
}

export interface Client {
  id: number,
  name?: string;
  balance?: number;
}

export interface Provider {
  id: number,
  name: string;
  color: string;
}

export interface Delivery {
  id: number;
  date: string;
  description: string;
  transactionType?: TransactionType;
  transaction_type_id: number;
  transactions?: Transaction[];
  provider_ids: string;
  providers?: Provider[];
  totalUnits: number;
  totalPrice: number;
  syncRequired: boolean;
}

export interface Transaction {
  id: number,
  date: string;
  delivery?: Delivery;
  delivery_id? : number;
  transactionType?: TransactionType;  
  transaction_type_id: number;
  paymentMethod?: string;
  client?: Client;
  client_id?: number;
  units: number;
  price: number;
  balanceAfter: number,
  balanceBefore: number,
  syncRequired: boolean;
  transactionsDetail?: TransactionDetail[];
}

export interface TransactionDetail {
  productCatalog?: ProductCatalog,
  product_catalog_id?: number,
  units: number,
  price: number
}

export interface Color {
  color: string;
  background: string;
}

export interface UserAuth {
  id: number;
  authType: AuthType;
  email: string,
  pin: string;
  name: string;
  imageUrl?: string;
  imageUrlSafe?: SafeHtml;
  color: string;
  background: string;
  token: string;  
  version?: number;
}

export interface SortState {
  direction: string;
  field: string;
}


export interface Preload {
  clients: Client[],
  products: Product[],
  productCatalogs: ProductCatalog[],
  transactionTypes: TransactionType[],
  providers: Provider[],
  transactions: Transaction[],
  deliveries: Delivery[],
  version: number
}