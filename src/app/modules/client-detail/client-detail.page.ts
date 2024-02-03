import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, IonModal, AlertController, ToastController, IonPopover, IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { DeliveryService, DialogService, ScreenSize, ScreenSizeService, StorageService } from '@app/services';
import { TransactionDebtFormComponent } from '../transaction-debt-form/transaction-debt-form.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '@env/environment';
import { Transaction, SortState, TransactionType, fadeAnimation, UserAuth, Client, TransactionDetail } from '@app/core';

interface TransactionCss {
  date: string;
  transactions: Transaction[];
};

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.page.html',
  styleUrls: ['./client-detail.page.scss'],
  animations: [fadeAnimation],
})
export class ClientDetailPage implements OnInit {

  clientId: number | undefined;
  client: Client | undefined;
  transactionsOri: Transaction[] | undefined;
  clickedRows = new Set<Transaction>();
  dataTransactionsCss: TransactionCss[] = [];
  sortState: SortState = { field: 'date', direction: 'asc' };
  detailSalesSelected: number = 0;
  transactionTypes: TransactionType[] | undefined;
  isLandscape = false;
  isSmallScreen = false;
  filterDateStart: Date | undefined;
  filterDateEnd: Date | undefined;

  showDateFilter = false;
  filterDate = '';
  screenHeight = 0;
  lastTrx: number | undefined;

  @ViewChild(IonModal) modal: IonModal | undefined;
  @ViewChild('popoverTransaction') popoverTransaction: IonPopover | undefined;
 

  constructor(
    private activatedRoute: ActivatedRoute,
    private deliveryServices: DeliveryService,
    private storageService: StorageService,
    private screenSizeService: ScreenSizeService,
    private dialogService: DialogService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  async ngOnInit() {

    this.screenHeight = window.innerHeight || document.documentElement.clientWidth || document.body.clientWidth;

    this.isLandscape = this.screenSizeService.isLandscape;
    // Suscribe al observable del servicio para recibir actualizaciones sobre el tamaño de la pantalla
    this.screenSizeService.isLandscape$.subscribe((screenSize:ScreenSize) => {
      this.isLandscape = screenSize.isLandscape;
      this.screenHeight = window.innerHeight || document.documentElement.clientWidth || document.body.clientWidth;

      let offsetHeight_0 = (document.getElementById('div-0')?.offsetHeight) || 0;
      let offsetHeight_1 = (document.getElementById('div-1')?.offsetHeight) || 0;
      let offsetHeight_2 = (document.getElementById('div-2')?.offsetHeight) || 0;
      this.screenHeight = this.screenHeight - offsetHeight_0 - offsetHeight_1 - offsetHeight_2;
      this.screenHeight -= 30;

    });

    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    this.transactionTypes = await this.storageService.getTransactionTypes(userAuth) as TransactionType[];
    const clients = await this.storageService.getClients(userAuth) as Client[];

    // Retrieve parameters from the URL
    this.activatedRoute.queryParams.subscribe(async (params) => {

      this.clientId = params['clientId'];

      if (this.clientId) {
        this.clientId = Number(this.clientId);
        this.client = clients.find((client) => client.id == this.clientId);
        this.transactionsOri = await this.deliveryServices.getTransactionsByClient(this.clientId);

        this.renderSort();
        let balance = 0;
      
        this.transactionsOri?.forEach((tx: Transaction) => {
          this.lastTrx = tx.id;
          tx.balanceBefore = balance;
          balance += (tx.transactionsDetail ? tx.price : tx.price * tx.units);
          tx.balanceAfter = balance;
        });

        this.setDataTransactionsCss(this.transactionsOri);
      }

    });
  }

  // Método para verificar el tamaño de la pantalla 
  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 460;
  }

  getTotalCost() {
    let total = 0;
    if (this.transactionsOri)
      this.transactionsOri.forEach((transaction) => {
        if (transaction.transactionsDetail && transaction.transactionsDetail.length > 0) {
          for (let detail of transaction.transactionsDetail) {
            total += detail.price * detail.units;
          }
        }
        else {
          total += transaction.price * transaction.units;
        }
      });
    return total;
  }

  isNegative(value: number): boolean {
    return value < 0;
  }

  showTransactionDetail(element: Transaction) {
    if (this.detailSalesSelected == element.id) {
      this.detailSalesSelected = 0;
      this.clickedRows.clear();
    }
    else {
      this.detailSalesSelected = element.id as number;
      this.clickedRows.clear();
      this.clickedRows.add(element);
    }
  }

  subTotalTransactionDetail(td: TransactionDetail) {
    return Number(td.price) * Number(td.units);
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
    const { direction, field } = this.sortState;

    if (direction == '') {
      this.sortState = { field: 'date', direction: 'asc' };
    }
    const sortFunction = (a: any, b: any) => {
      if (field === 'date') {
        if (a.date == b.date) {
          return direction === 'asc' ? a.id > b.id ? 1 : -1 : b.id > a.id ? 1 : -1
        }
        else {
          const dateA = moment(a.date, 'DD/MM/YYYY');
          const dateB = moment(b.date, 'DD/MM/YYYY');
          return direction === 'asc' ? dateA.isAfter(dateB) ? 1 : -1 : dateB.isAfter(dateA) ? 1 : -1;
        }
      } else if (field === 'price' || field === 'units' || field === 'balanceAfter') {
        return direction === 'asc' ? a[field] - b[field] : b[field] - a[field];
      } else if (field === 'transaction') {
        return direction === 'asc' ? a.transactionType?.name.localeCompare((b.transactionType as TransactionType).name) : b.transactionType?.name.localeCompare((a.transactionType as TransactionType).name);
      }
    };

    this.transactionsOri?.sort(sortFunction);
    this.setDataTransactionsCss(this.transactionsOri);
  }

  setDataTransactionsCss(transactions: Transaction[] | undefined) {
    //Ordenar las transacciones por fecha
    this.dataTransactionsCss = [];
    transactions?.forEach((tx: Transaction) => {
      console.log(tx);
      const selectIndx = this.dataTransactionsCss.findIndex(dtcss => dtcss.date == tx.date);
      if (selectIndx !== -1) {
        this.dataTransactionsCss[selectIndx].transactions?.push(tx);
      }
      else {
        this.dataTransactionsCss.push({
          date: tx.date,
          transactions: [tx]
        });
      }
    });
  }

  async confirmDateFilter() {

    const loadingElement = await this.dialogService.showLoading();

    this.renderSort();
    const transactions = this.transactionsOri?.filter((element => {

      if (this.filterDateStart) {
        const dateItem = moment(element.date, 'DD/MM/YYYY');
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
    this.setDataTransactionsCss(transactions);

    loadingElement.dismiss();
    this.showDateFilter = false;
  }

  clearDateFilter() {
    this.filterDateEnd = undefined;
    this.filterDateStart = undefined;
    this.confirmDateFilter();
    this.showDateFilter = false;
  }

  async openModalPay() {
    const modal = await this.modalController.create({
      component: TransactionDebtFormComponent, // Reemplaza TuModalComponent con el nombre real de tu componente modal
      componentProps: {
        typeTransaction: 'Credit'
      },
      cssClass: 'modal-transaction-form',
      /*backdropDismiss: false*/
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    // Este código se ejecuta cuando el modal se cierra
    if (data) {
      console.log('Modal cerrado con datos:', data);
      data.amount *= -1;
      this.addTransacction(data);
    }
  }

  async openModalDebt() {
    const modal = await this.modalController.create({
      component: TransactionDebtFormComponent, // Reemplaza TuModalComponent con el nombre real de tu componente modal
      componentProps: {
        typeTransaction: 'Debt'
      },
      cssClass: 'modal-transaction-form',
      /*backdropDismiss: false*/
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    // Este código se ejecuta cuando el modal se cierra
    if (data) {
      console.log('Modal cerrado con datos:', data);
      this.addTransacction(data);
    }
  }

  async addTransacction(data: any) {

    const transactionIdToFind = data.transactionType;
    const transactionType = this.transactionTypes?.find(type => type.id === transactionIdToFind);
    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    const transactionDate = moment(data.transactionDate).format('DD/MM/YYYY');

    //se adicionan los datos al arreglo de transacciones
    const price = Number(data.amount);
    const clientBalance = this.client?.balance ?? 0;
    const element: Transaction = {
      id: new Date().getTime(),
      date: transactionDate,
      transactionType: transactionType as TransactionType,
      transaction_type_id: (transactionType as TransactionType).id,
      units: data.units || 1,
      client: this.client,
      client_id: this.client?.id,
      price: price,
      balanceAfter: clientBalance + price,
      balanceBefore: clientBalance,
      paymentMethod: data.paymentMethod,
      syncRequired: true
    }
    this.transactionsOri?.push(element);
    this.renderSort();
    this.setDataTransactionsCss(this.transactionsOri);
    //this.clearDateFilter();
    this.closePopover();
    this.presentToast('top', 'Registro adicionado exitosamente');

    this.showTransactionDetail(element);
    setTimeout(() => {
      this.showElementInTable(element);
    }, 500);

  }

  closeModalPlay() {
    this.modalController.dismiss();
  }


  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  closePopover() {
    if (this.popoverTransaction) {
      this.popoverTransaction.dismiss();
    }
  }

  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;

  showElementInTable(element: Transaction) {
    // Realiza las acciones necesarias antes de mostrar el detalle

    // Desplaza el scroll hacia el elemento específico
    if (this.content) {
      const elementId = `table-id-${element.id}`;
      const tableElement = document.getElementById(elementId);

      if (tableElement) {
        this.content.scrollToPoint(0, tableElement.offsetTop, 500);
      }
    }
  }

  changeDateStart(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.filterDateStart = dateTime.toDate();
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
      this.filterDateEnd = dateTime.toDate();
      const modal = datetimeEl.parentNode.parentElement;
      if (modal) {
        modal.dismiss();
      }
    }
  }

}
