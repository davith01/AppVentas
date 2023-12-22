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


@NgModule({
    declarations: [NetworkStatusComponent, LoadingComponent,CurrencyFormatPipe],
    providers: [],
    imports: [
        CommonModule, IonicModule,
        MatSortModule, MatProgressSpinnerModule, MatTableModule, MatPaginatorModule,
        CurrencyPipe, DatePipe],
    exports: [NetworkStatusComponent, LoadingComponent, CurrencyFormatPipe,
        MatSortModule, MatProgressSpinnerModule, MatTableModule, MatPaginatorModule]
})
export class ComponentsModule { }
