import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClientDetailPageRoutingModule } from './client-detail-routing.module';
import { ClientDetailPage } from './client-detail.page';
import { TransactionDebtFormComponent } from '../transaction-debt-form/transaction-debt-form.component';
import { ComponentsModule } from '@app/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    ClientDetailPageRoutingModule
  ],
  declarations: [ClientDetailPage, TransactionDebtFormComponent],
})
export class ClientDetailPageModule {}
