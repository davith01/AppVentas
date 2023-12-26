import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NetworkStatusComponent } from './components/network-status/network-status.component';
import { MatTableModule } from '@angular/material/table';
import { LoadingComponent } from './components/loading/loading.component';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CurrencyFormatPipe } from './components/currency-format.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { DateFormatPipe } from './components/date-format.pipe';
import { TransactionDebtFormComponent } from './pages/client-detail/transaction-debt-form/transaction-debt-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [TransactionDebtFormComponent,NetworkStatusComponent, LoadingComponent, CurrencyFormatPipe,DateFormatPipe],
    providers: [],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule, IonicModule,
        MatSortModule, MatProgressSpinnerModule, MatTableModule, MatPaginatorModule,
        MatFormFieldModule, MatInputModule, MatDatepickerModule, MatCardModule, MatNativeDateModule, MatIconModule,
        CurrencyPipe, DatePipe],
    exports: [NetworkStatusComponent, LoadingComponent, CurrencyFormatPipe,
        MatFormFieldModule, MatInputModule, MatDatepickerModule, MatCardModule, MatNativeDateModule, MatIconModule,
        MatSortModule, MatProgressSpinnerModule, MatTableModule, MatPaginatorModule,
        DateFormatPipe]
})
export class ComponentsModule { }
