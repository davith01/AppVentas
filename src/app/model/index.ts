
export interface TransactionType {
  id: number;
  name: string;
  typeTransaction: string;
  icon: string;
}

export interface DetailSales {
  date: string;
  category: string,
  quantity: number,
  unitPrice: number
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

export interface SortState {
  direction: string;
  field: string;
}

