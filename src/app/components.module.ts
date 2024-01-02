import { NgModule } from '@angular/core';
import { CurrencyFormatPipe, DateFormatPipe } from './core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { NetworkStatusComponent } from './modules/network-status/network-status.component';

@NgModule({
    declarations: [
        CurrencyFormatPipe,
        DateFormatPipe,
        NetworkStatusComponent
    ],
    providers: [],
    imports: [
        MatNativeDateModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule
    ],
    exports: [
        CurrencyFormatPipe,
        DateFormatPipe,
        MatNativeDateModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        NetworkStatusComponent
    ]
})
export class ComponentsModule { }
