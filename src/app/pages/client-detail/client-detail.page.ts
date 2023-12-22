import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';
import { ClientService } from 'src/app/services/api/clients.service';
import { MatPaginator } from '@angular/material/paginator';

import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export interface ClientTransaction {
  date: string;
  transaction: string;
  quantity: number;
  price: number;
}

export interface SortState {
  direction: string;
  field: string;
}

const ELEMENT_DATA: (ClientTransaction)[] = [
  { date: '01/01/2024', transaction: 'Saldo', quantity: 1, price: 30110000 },
  { date: '02/01/2024', transaction: 'Abono', quantity: 1, price: -2000000 },
  { date: '2/01/2024', transaction: 'Venta Platanos', quantity: 55, price: 90105000 },
  { date: '03/01/2024', transaction: 'Abono', quantity: 1, price: -2000000 },
  { date: '04/01/2024', transaction: 'Abono', quantity: 1, price: -2000000 },
  { date: '05/01/2024', transaction: 'Venta Platanos', quantity: 85, price: 89730000 },
  { date: '07/01/2024', transaction: 'Venta Platanos', quantity: 30, price: 94105000 },
];

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.page.html',
  styleUrls: ['./client-detail.page.scss'],
})
export class ClientDetailPage implements OnInit {

  clientId: string = '';
  client: any;

  //displayedColumns: string[] = ['date', 'transaction', 'quantity', 'price'];

  //dataSource = new MatTableDataSource(ELEMENT_DATA);

  clickedRows = new Set<ClientTransaction>();
  dataClientTransaction: (ClientTransaction)[] | undefined;
  sortState: SortState = { field: 'date', direction: 'desc' };

  //resultsLength = 0;
  //isLoadingResults = true;
  //isRateLimitReached = false;
  //@ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  // @ViewChild('sort') sort: MatSort | undefined;
  //@ViewChild(MatSort) sort: MatSort | undefined;


  constructor(
    public activatedRoute: ActivatedRoute,
    public clientService: ClientService,
    private _liveAnnouncer: LiveAnnouncer) {

    // Retrieve parameters from the URL
    this.activatedRoute.queryParams.subscribe((params) => {
      this.clientId = params['clientId'];
      this.clientService.getClient(this.clientId)
        .then((response: any) => {
          this.client = response.data;
          //this.dataSource = new MatTableDataSource<ClientTransaction>(ELEMENT_DATA)!;
          this.dataClientTransaction = ELEMENT_DATA;
          this.renderSort();
        });

    });
  }

  ngOnInit() {
    const m = document.querySelectorAll('ion-icon').forEach((icon: HTMLElement) => {
      console.log(icon.shadowRoot?.childNodes[0]);
    });
  }

  ngAfterViewInit() {
    /*this.sort?.sortChange.subscribe(() => {if(this.paginator) this.paginator.pageIndex = 0});
    if (this.dataSource && this.sort) {
      this.dataSource.sort = this.sort;
    }*/
  }

  getTotalCost() {
    if (this.dataClientTransaction)
      return this.dataClientTransaction.map(t => t.price).reduce((acc, value) => acc + value, 0);
    else return 0;
  }

  isNegative(value: number): boolean {
    return value < 0;
  }

  changeSort(field: string) {
    if (this.sortState.field == field) {
      if (this.sortState.direction == '') {
        this.sortState.direction = 'desc';
      }
      else if (this.sortState.direction == 'desc') {
        this.sortState.direction = 'asc';
      }
      else if (this.sortState.direction == 'asc') {
        this.sortState.direction = 'desc';
      }
    } else {
      this.sortState.field = field;
      this.sortState.direction = 'desc';
    }
    this.renderSort();
  }

  renderSort() {
    if (this.sortState.direction != '') {

      this.dataClientTransaction = ELEMENT_DATA;

      if (this.sortState.field == 'date') {
        this.dataClientTransaction = ELEMENT_DATA;
        this.dataClientTransaction.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (this.sortState.direction == 'asc') {
            return dateA.getTime() - dateB.getTime();
          }
          else { return dateB.getTime() - dateA.getTime(); }
        });
      }
      else if (this.sortState.field == 'price') {
        this.dataClientTransaction.sort((a: ClientTransaction, b: ClientTransaction) => {
          if (this.sortState.direction == 'asc') {
            return a.price - b.price;
          } else { return b.price - a.price; }
        });
      }
      else if (this.sortState.field == 'quantity') {
        this.dataClientTransaction.sort((a: ClientTransaction, b: ClientTransaction) => {
          if (this.sortState.direction == 'asc') {
            return a.quantity - b.quantity;
          } else { return b.quantity - a.quantity; }
        });
      }
      else if (this.sortState.field == 'transaction') {
        this.dataClientTransaction.sort((a: any, b: any) => {
          if (this.sortState.direction == 'asc') {
            return a.transaction > b.transaction ? 1 : -1;
          } else { return a.transaction > b.transaction ? -1 : 1; }
        });
      }
    } else {
      this.dataClientTransaction = ELEMENT_DATA;
    }
  }
}
