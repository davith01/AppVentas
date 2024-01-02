// transaction-form.component.ts
import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetailSales, TransactionType, TransactionTypeService } from '@app/services';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-transaction-debt-form',
  templateUrl: './transaction-debt-form.component.html',
  styleUrls: ['./transaction-debt-form.component.scss'],
})
export class TransactionDebtFormComponent implements OnInit {

  transactionForm: FormGroup;
  transactionDate: Date | undefined;
  amount: number = 0;
  showDateTransaction = true;
  transactionTypes: TransactionType[] | undefined;
  elementDetails: DetailSales[] = [
    { "date": "", "category": "", "quantity": 1, "unitPrice": 0 },
    { "date": "", "category": "", "quantity": 1, "unitPrice": 0 },
    { "date": "", "category": "", "quantity": 1, "unitPrice": 0 }
  ];
  categoryDetails =  ['buenas', 'picadas', 'segundarias'];

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private transactionTypeService: TransactionTypeService) {

    const currentDate: moment.Moment = moment();

    this.transactionForm = this.formBuilder.group({
      transactionType: ['', Validators.required],
      transactionDate: [currentDate.format('YYYY-MM-DD'), Validators.required],
      amount: ['', Validators.required],
      quantity: ['1', Validators.required]
    });
  }

  async ngOnInit() {
    
    const transactionList = await this.transactionTypeService.getList();
    this.transactionTypes = transactionList.filter((transaction: TransactionType)=>{
      return transaction.typeTransaction == 'Debt';
    });

  }

  changeDateTransaction(event: any) {

    const datetime = event.target;
    //const result = formatISO(new Date(this.callDate))
    const modal = event.target.parentNode.parentElement;
    if (datetime && modal) {
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

  selectType(type: TransactionType) {

  }

  @HostListener('input', ['$event']) onInput(event: any) {

    if (event.target.parentNode.parentNode.parentNode.id == 'monto') {
      let inputValue: number = event.target.value;
      this.amount = inputValue;
    }
  }

  newDetailSales(){
    const newDetail : DetailSales= 
      { "date": "", "category": "Bolsas Segundas", "quantity": 1, "unitPrice": 0 };

    this.elementDetails.push(newDetail);
  }
}
