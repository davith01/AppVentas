import { NgModule } from '@angular/core';
import { AliasProviderPipe, CurrencyFormatPipe, DateFormatPipe } from './core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { NetworkStatusComponent } from './modules/network-status/network-status.component';
import { IconLogoComponent } from './modules/icon-logo/icon-logo.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [
        CurrencyFormatPipe,
        DateFormatPipe,
        NetworkStatusComponent,
        IconLogoComponent,
        AliasProviderPipe
    ],
    providers: [],
    imports: [
        MatNativeDateModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        FontAwesomeModule
    ],
    exports: [
        CurrencyFormatPipe,
        DateFormatPipe,
        MatNativeDateModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        NetworkStatusComponent,
        IconLogoComponent,
        AliasProviderPipe
    ]
})
export class ComponentsModule { }
