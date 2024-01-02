import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ModalController, IonModal, AlertController, ToastController, IonPopover, IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { ClientService, ClientTransaction, SortState, TransactionType, TransactionTypeService } from '@app/services';
import { TransactionDebtFormComponent } from '../transaction-debt-form/transaction-debt-form.component';


const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter',
      [style({ opacity: 0 }), stagger('100ms', animate('500ms ease-out', style({ opacity: 1 })))],
      { optional: true }
    ),
    query(':leave',
      animate('500ms', style({ opacity: 0 })),
      { optional: true }
    )
  ])
]);

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0, height: '0', }),
    animate('200ms ease-out', style({ opacity: 1, height: '*' }))]
  ),
  transition(':leave',
    [style({ opacity: 1, height: '*' }), animate('300ms', style({ opacity: 0, height: '0', }))]
  )
]);

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.page.html',
  styleUrls: ['./client-detail.page.scss'],
  animations: [listAnimation, fadeAnimation],
})
export class ClientDetailPage implements OnInit {

  clientId: string = '';
  client: any;

  clickedRows = new Set<ClientTransaction>();
  dataClientTransaction: (ClientTransaction)[] | undefined;
  dataClientTransactionOri: (ClientTransaction)[] | undefined;
  sortState: SortState = { field: 'date', direction: 'desc' };

  detailSalesSelected: number = 0;

  @ViewChild(IonModal) modal: IonModal | undefined;
  @ViewChild('popoverTransaction') popoverTransaction: IonPopover | undefined;


  transactionTypes: TransactionType[] | undefined;

  constructor(
    public activatedRoute: ActivatedRoute,
    public clientService: ClientService,
    private modalController: ModalController,
    private alertController: AlertController,
    private transactionTypeService: TransactionTypeService,
    private toastController: ToastController) {

      
  }

  async ngOnInit() {

    this.transactionTypes = await this.transactionTypeService.getList();

    // Retrieve parameters from the URL
    this.activatedRoute.queryParams.subscribe((params) => {

      this.clientId = params['clientId'];
      this.clientService.getClient(this.clientId)
        .then((response: any) => {
          this.client = response.data;
        });

      this.clientService.getClientTransaction(this.clientId)
        .then((response: any) => {
          this.dataClientTransaction = response.data;
          this.dataClientTransactionOri = response.data;
          this.renderSort();
        });

    });
  }

  getTotalCost() {
    if (this.dataClientTransactionOri)
      return this.dataClientTransactionOri.map(t => t.price).reduce((acc, value) => acc + value, 0);
    else return 0;
  }

  isNegative(value: number): boolean {
    return value < 0;
  }

  showTransactionDetail(element: ClientTransaction) {
    if (this.detailSalesSelected == element.id) {
      this.detailSalesSelected = 0;
      this.clickedRows.clear();
    }
    else {
      this.detailSalesSelected = element.id;
      this.clickedRows.clear();
      this.clickedRows.add(element);
    }
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

    if (direction !== '') {
      const sortFunction = (a: any, b: any) => {
        if (field === 'date') {
          const dateA = moment(a.date, 'DD/MM/YYYY');
          const dateB = moment(b.date, 'DD/MM/YYYY');
          return direction === 'asc' ? dateA.isAfter(dateB) ? 1 : -1 : dateB.isAfter(dateA) ? 1 : -1;
        } else if (field === 'price' || field === 'quantity') {
          return direction === 'asc' ? a[field] - b[field] : b[field] - a[field];
        } else if (field === 'transaction') {
          return direction === 'asc' ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field]);
        }
      };

      this.dataClientTransaction?.sort(sortFunction);
    } else {
      this.dataClientTransaction = this.dataClientTransactionOri;
    }
  }



  showDateFilter = false;
  filterDate = '';
  dateFilterStart: any;
  dateFilterEnd: any;

  confirmDateFilter() {

    this.dataClientTransaction = this.dataClientTransactionOri?.filter((element => {

      if (this.dateFilterStart) {
        const dateItem = moment(element.date, 'DD/MM/YYYY');

        if (this.dateFilterEnd) {
          return dateItem >= this.dateFilterStart && dateItem <= this.dateFilterEnd;
        }
        else {
          return dateItem >= this.dateFilterStart;
        }
      }
      else return true;
    }));

    this.renderSort();
  }

  clearDateFilter() {
    this.dateFilterEnd = null;
    this.dateFilterStart = null;
    this.confirmDateFilter();
  }

  async openModalPay() {
    const alert = await this.alertController.create({
      header: 'Formulario de Alerta',
      inputs: [
        {
          name: 'transactionType',
          type: 'text',
          placeholder: 'Tipo de Transacción'
        },
        {
          name: 'transactionDate',
          type: 'date',
          placeholder: 'Fecha de Transacción'
        },
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Monto'
        },
        {
          name: 'paymentMethod',
          type: 'text',
          placeholder: 'Método de Pago'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Guardar',
          handler: (data) => {
            console.log('Datos guardados:', data);
            // Aquí puedes realizar acciones con los datos del formulario
          }
        }
      ]
    });

    await alert.present();
  }

  async openModalDebt() {
    const modal = await this.modalController.create({
      component: TransactionDebtFormComponent, // Reemplaza TuModalComponent con el nombre real de tu componente modal
      componentProps: {

      },
      cssClass: 'modal-transaction-form',
      /*backdropDismiss: false*/
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    // Este código se ejecuta cuando el modal se cierra
    if (data) {
      console.log('Modal cerrado con datos:', data);
      //data.amount *= -1;
      this.addTransacction(data);
    }
  }

  addTransacction(data: any) {

    const transactionIdToFind = data.transactionType;
    const transactionType = this.transactionTypes?.find(type => type.id === transactionIdToFind);

    const transactionDate = moment(data.transactionDate).format('DD/MM/YYYY');

    //se adicionan los datos al arreglo de transacciones
    const element: ClientTransaction = {
      id: this.dataClientTransactionOri ? this.dataClientTransactionOri.length + 1 : 1,
      date: transactionDate,
      transaction: transactionType ? transactionType.name : '',
      quantity: data.quantity,
      price: data.amount,
      syncRequired: true,
      paymentMethod: data.paymentMethod
    }
    this.dataClientTransactionOri?.push(element);
    this.closePopover();
    this.presentToast('top', 'Registro adicionado exitosamente');
    this.renderSort();
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

  showElementInTable(element: ClientTransaction) {
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
}
