// transaction-form.component.ts
import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionDetail, TransactionType, UserAuth } from '@app/core';
import { StorageService } from '@app/services';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-transaction-debt-form',
  templateUrl: './transaction-debt-form.component.html',
  styleUrls: ['./transaction-debt-form.component.scss'],
})
export class TransactionDebtFormComponent implements OnInit {
  
  @Input() typeTransaction: string = 'Debt';

  transactionForm: FormGroup;
  transactionDate: Date | undefined;
  amount: number = 0;
  showDateTransaction = true;
  transactionTypes: TransactionType[] | undefined;
  transactionSelect: TransactionType | undefined;
  transactionDetail: TransactionDetail[] | undefined ;
  categoryDetails = ['buenas', 'picadas', 'segundarias'];

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {
    const currentDate: moment.Moment = moment();
    this.transactionForm = this.formBuilder.group({
      transactionType: ['', Validators.required],
      transactionDate: [currentDate.format('YYYY-MM-DD'), Validators.required],
      amount: [''],
      units: [''],
      comment: ['']
    });
  }

  async ngOnInit() {

    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    const transactionTypes = await this.storageService.getTransactionTypes(userAuth) as TransactionType[];
    this.transactionTypes = transactionTypes.filter((transaction: TransactionType) => {
      return transaction.targetType == this.typeTransaction;
    });

  }

  changeDateTransaction(event: any) {

    const datetime = event.target;
    //const result = formatISO(new Date(this.callDate))
    const modal = event.target.parentNode.parentElement;
    if (datetime && modal) {
      [
        {  "category": "", "units": 1, "price": 0 },
        {  "category": "", "units": 1, "price": 0 },
        {  "category": "", "units": 1, "price": 0 }
      ];
      modal.dismiss();
    }
  }

  closeDateTransaction(event: any) {
    const datetime = event.target;
    this.showDateTransaction = false;
  }

  submitForm() {
    if (this.transactionForm.valid) {
      const formData = this.transactionForm.value;
      // Aquí puedes realizar acciones con los datos del formulario, como enviarlos al servidor, almacenar en la base de datos, etc.
      console.log('Datos del formulario:', formData);
      return this.modalCtrl.dismiss(formData, 'confirm');
    }
    else return;
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  @HostListener('input', ['$event']) onInput(event: any) {
    if (event.target.parentNode.parentNode.parentNode.id == 'monto') {
      let inputValue: number = event.target.value;
      this.amount = inputValue;
    }
  }

  newDetailSales() {
    const newDetail: TransactionDetail =
      {  "units": 1, "price": 0 };

    this.transactionDetail?.push(newDetail);
  }

  transactionChange() {
    const transactionTypeId = this.transactionForm.value.transactionType;

    const findItems = this.transactionTypes?.filter((transaction) => {
      return transaction.id == transactionTypeId
    });

    if (findItems) {
      this.transactionSelect = findItems[0];
      const currentDate: moment.Moment = moment();

      //si el tipo de transacciones no tiene detalles, el campo de monto es obligatorio
      if (this.transactionSelect.detail) {
        const amountControl = this.transactionForm.get('amount');
        amountControl?.clearValidators();
        amountControl?.setValidators([Validators.required]);
        amountControl?.updateValueAndValidity();
      }
    }
  }
}
