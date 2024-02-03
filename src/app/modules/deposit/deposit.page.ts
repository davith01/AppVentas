import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Client, Transaction, SortState, fadeAnimation, UserAuth, TargetType, TransactionType, animImageSlider } from '@app/core';
import { DeliveryService, DialogService, ScreenSize, ScreenSizeService, StorageService } from '@app/services';
import { NavController } from '@ionic/angular';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';

const filterAnimation = trigger('filterAnimation', [
  transition(':enter, * => 0, * => -1', []),
  transition(':increment', [
    query(':enter', [
      style({ opacity: 0, width: '0px' }),
      stagger(50, [
        animate('300ms ease-out', style({ opacity: 1, width: '*' })),
      ]),
    ], { optional: true })
  ]),
  transition(':decrement', [
    query(':leave', [
      stagger(50, [
        animate('300ms ease-out', style({ opacity: 0, width: '0px' })),
      ]),
    ])
  ]),
]);

export interface ClientInputCss {
  client: Client,
  price: number,
  transaction?: Transaction
}

export interface DatesCss {
  date: string,
  transactionsCss: TransactionCss[]
}

export interface TransactionCss {
  transaction: Transaction,
  price?: number,
  isEdited: boolean
}


@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.page.html',
  styleUrls: ['./deposit.page.scss'],
  animations: [filterAnimation, fadeAnimation, animImageSlider]
})
export class DepositPage implements OnInit {

  datesCssOri: DatesCss[] = [];
  datesCss: DatesCss[] = [];
  clientsTotal = -1;
  loading = true;
  isLandscape = false;
  faMinus = faMinus;

  newDepositFilterDate: string = moment().format('YYYY-MM-DD');
  depositDate: string = moment().format('DD/MM/YYYY');

  showDateFilter = false;
  isFilterToday = false;
  onlyToday = false;
  filterDateStart: Date | undefined;
  filterDateEnd: Date | undefined;
  filterDateIni: string | undefined;
  filterDateFinal: string | undefined;
  counter = 1;
  isNewDeposit = false;
  isSmallScreen = false;
  clients: Client[] | undefined;
  transactions: Transaction[] | undefined;
  hasNewDepositChanged: boolean = false;

  sortState: SortState = { field: 'date', direction: 'desc' };
  transactionType: TransactionType | undefined;

  constructor(
    public navCtrl: NavController,
    public storageService: StorageService,
    private screenSizeService: ScreenSizeService,
    private dialogService: DialogService,
    private deliveryService: DeliveryService
  ) { }

  async ngOnInit() {
    this.isLandscape = this.screenSizeService.isLandscape;
    this.isSmallScreen = this.screenSizeService.isSmallScreen;
    // Suscribe al observable del servicio para recibir actualizaciones sobre el tamaño de la pantalla
    this.screenSizeService.isLandscape$.subscribe((screenSize:ScreenSize) => {
      this.isLandscape = screenSize.isLandscape;
      this.isSmallScreen = screenSize.isSmallScreen
    });

    this.initializeTransactionList();
    this.loading = false;
  }

  async initializeTransactionList() {
    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    this.clients = await this.storageService.getClients(userAuth) as Client[];
    const transactions = await this.storageService.getTransactions(userAuth) as Transaction[];
    const transactionTypes = await this.storageService.getTransactionTypes(userAuth) as TransactionType[];
    const creditTransactionTypes = transactionTypes.filter((tt) => tt.targetType == TargetType.Debt);
    this.transactionType = creditTransactionTypes[0];

    //create format the element datesCss
    this.clientsTotal = 0;
    this.transactions = transactions.filter(tx =>
      creditTransactionTypes.some(tt => tx.transaction_type_id === tt.id)
    );

    const sortFunction = (a: any, b: any) => {
      const dateA = moment(a.date, 'DD/MM/YYYY');
      const dateB = moment(b.date, 'DD/MM/YYYY');
      // return direction === 'asc' ? dateA.isAfter(dateB) ? 1 : -1 : dateB.isAfter(dateA) ? 1 : -1;
      return dateA.isAfter(dateB) ? 1 : -1; //'asc' ? dateA.isAfter(dateB) ? 1 : -1 : dateB.isAfter(dateA) ? 1 : -1
    };
    this.transactions.sort(sortFunction);

    this.transactions.forEach(trx => {
      trx.client = this.clients?.find(client => client.id === trx.client_id);
      this.clientsTotal++;

      const dateCss = this.datesCssOri.find(dateCssTmp => dateCssTmp.date === trx.date);
      if (!dateCss) this.datesCssOri.push({ date: trx.date, transactionsCss: [{ price: trx.price, transaction: trx, isEdited: false }] });
      else dateCss.transactionsCss.push({ price: trx.price, transaction: trx, isEdited: false });
    });

    this.datesCss = this.datesCssOri;
    this.confirmDateFilter();
  }

  getTransactionCount(): number {
    return this.datesCss.reduce((total, dateCss) => total + dateCss.transactionsCss.length, 0);
  }

  findClientByName(event: any) {
    this.datesCss = [];
    const query = typeof event == 'object' ? (event.target.value || '').trim().toLowerCase() : (event || '');
    this.datesCssOri.forEach((dateCss) => {
      for (let txCss of dateCss.transactionsCss) {
        if (txCss.transaction.client?.name?.toUpperCase().includes(query.toUpperCase())) {
          let date = txCss.transaction.date;
          let dateCss_;
          for (let dateCss of this.datesCss) {
            if (dateCss.date == date) {
              dateCss_ = dateCss;
            }
          }
          if (dateCss_) {
            dateCss_.transactionsCss.push({ price: txCss.price, transaction: txCss.transaction, isEdited: false });
          }
          else {
            this.datesCss.push({ date: date, transactionsCss: [{ price: txCss.price, transaction: txCss.transaction, isEdited: false }] });
          }
        }
      }
    });

    this.clientsTotal = this.datesCss.length
  }

  changeNewDepositFilterDate(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.depositDate = moment(dateTime.toDate()).format('DD/MM/YYYY');
      this.onNewDepositButton(dateTime.toDate());
      const modal = datetimeEl.parentNode.parentElement;
      if (modal) {
        modal.dismiss();
      }

    }
  }

  changeDateStart(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.isFilterToday = false;
      const modal = datetimeEl.parentNode.parentElement;
      if (modal) {
        modal.dismiss();
      }
    }
  }

  changeDateEnd(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.isFilterToday = false;
      const modal = datetimeEl.parentNode.parentElement;
      if (modal) {
        modal.dismiss();
      }
    }
  }


  async confirmDateFilter() {

    const loadingElement = await this.dialogService.showLoading();

    this.datesCss = this.datesCssOri?.filter((dateCss => {

      this.onlyToday = this.isFilterToday;
      this.filterDateIni = this.filterDateStart ? moment(this.filterDateStart).format('DD/MM/YYYY') : undefined;
      this.filterDateFinal = this.filterDateEnd ? moment(this.filterDateEnd).format('DD/MM/YYYY') : undefined;

      if (this.isFilterToday) {
        const today = moment().format('DD/MM/YYYY');
        return dateCss.date == today;
      }
      else if (this.filterDateStart) {
        const dateItem = moment(dateCss.date, 'DD/MM/YYYY');
        const dateStart = moment(this.filterDateStart);
        if (this.filterDateEnd) {
          const dateEnd = moment(this.filterDateEnd);
          return dateItem >= dateStart && dateItem <= dateEnd;
        }
        else {
          return dateItem >= dateStart;
        }
      }
      else return true;
    }));

    loadingElement.dismiss();
    this.showDateFilter = false;
  }

  clearDateFilter() {
    this.filterDateEnd = undefined;
    this.filterDateStart = undefined;
    this.confirmDateFilter();
    this.showDateFilter = false;
    this.isFilterToday = true;
  }

  presentAlertConfirm() {

    let pending = this.getTransactionPending();
    if (pending == 0) {
      this.dialogService.showAlert({
        subHeader: 'No se ha realizado nigun cambio',
        message: 'Desea salir de editor?',
        buttons: [
          {
            text: 'Cancelar',
            cssClass: "alert-button-cancel",
            role: 'cancel',
            handler: () => {

            },
          },
          {
            text: 'Confirmar',
            cssClass: 'alert-button-confirm',
            handler: () => {
              this.initializeTransactionList();
              this.isNewDeposit = false;
            },
          },
        ],
      });
    }
    else {
      const message = pending == 1 ? 'Se guardará 1 transación' : 'Se guardarán ' + pending + ' transacciones';
      this.dialogService.showAlert({
        header: '',
        subHeader: message,
        message: 'Desea continuar con la transacción?',
        buttons: [
          {
            text: 'Cancelar',
            cssClass: "alert-button-cancel",
            role: 'cancel',
            handler: () => {

            },
          },
          {
            text: 'Confirmar',
            cssClass: 'alert-button-confirm',
            handler: () => {
              this.onFinish();
            },
          },
        ],
      });
    }

  }

  async onFinish() {

    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    this.clients = await this.storageService.getClients(userAuth) as Client[];

    for (let dateCss of this.datesCss) {
      for (let transactionCSS of dateCss.transactionsCss) {
        if (transactionCSS.isEdited && transactionCSS.price && transactionCSS.isEdited && transactionCSS.transaction.client) {
          const transaction = transactionCSS.transaction;
          const client = transactionCSS.transaction.client;
          transaction.balanceBefore = client.balance || 0;
          client.balance = (client.balance || 0) - transactionCSS.price;
          transaction.balanceAfter = client.balance;
          transaction.price = -transactionCSS.price;
          transaction.date = this.depositDate;

          this.deliveryService.saveTransaction(userAuth, transactionCSS.transaction);
          this.deliveryService.saveClient(userAuth, client);
        }
      }
    }
    this.initializeTransactionList();
    this.isNewDeposit = false;
  }

  getTransactionPending() {
    let total = 0;
    for (let dateCss of this.datesCss) {
      for (let transactionCSS of dateCss.transactionsCss) {
        if (transactionCSS.isEdited) {
          total++;
        }
      }

    }
    return total;
  }

  onNewDepositClose() {
    this.isNewDeposit = !this.isNewDeposit;
    this.findClientByName('');
    this.confirmDateFilter();
  }

  onNewDepositButton(newDate?: Date) {
    const strDate = newDate ? moment(newDate).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY');
    this.loading = true;
    this.hasNewDepositChanged = false;
    this.isNewDeposit = true;
    const dateCss: DatesCss = { date: strDate, transactionsCss: [] };
    this.datesCss = [dateCss];
    this.clients?.forEach(async(client) => {

      let txPrice = this.transactions?.find((tx) => tx.client_id == client.id && tx.date == dateCss.date);

      client.balance = await this.getTotalCostByClientId(client);

      const transactionCss: TransactionCss = {
        isEdited: false,
        price: txPrice ? txPrice.price : undefined,
        transaction: txPrice ? txPrice : {
          date: this.depositDate,
          id: Number(new Date().getTime() + '' + client.id),
          transaction_type_id: this.transactionType ? this.transactionType.id : 2,
          transactionType: this.transactionType,
          balanceBefore: (client.balance || 0),
          balanceAfter: (client.balance || 0),
          price: 0,
          units: 1,
          client: client,
          client_id: client.id,
          syncRequired: false,
        }
      }

      dateCss.transactionsCss.push(transactionCss);
    });
    this.loading = false;
  }

  modifySyncronizeTransaction(transactionCss: TransactionCss) {
    transactionCss.isEdited = true;
    this.hasNewDepositChanged = true;
  }

  async getTotalCostByClientId(client: Client) {
    let balance = 0;
    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    const transactions = await this.storageService.getTransactions(userAuth) as Transaction[];

    if (transactions)
      transactions.forEach((transaction) => {
        if (transaction.client_id == client.id) {
          if (transaction.transactionsDetail && transaction.transactionsDetail.length > 0) {
            for (let detail of transaction.transactionsDetail) {
              balance += detail.price * detail.units;
            }
          }
          else {
            balance += transaction.price * transaction.units;
          }
        }
      });

    return balance;
  }
}
