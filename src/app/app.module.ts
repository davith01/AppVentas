import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from './components.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Registra el idioma español
registerLocaleData(localeEs);


@NgModule({
  declarations: [AppComponent],
  imports: [ HttpClientModule,FormsModule,ReactiveFormsModule, IonicStorageModule.forRoot(), BrowserModule, IonicModule.forRoot(), AppRoutingModule, BrowserAnimationsModule, ComponentsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, { provide: LOCALE_ID, useValue: 'es' } ],
  bootstrap: [AppComponent],
})
export class AppModule { }
