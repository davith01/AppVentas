import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from './components.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { MaterialModule } from './material/material.module';


@NgModule({
  declarations: [AppComponent],
  imports: [ IonicStorageModule.forRoot(),BrowserModule, IonicModule.forRoot(), AppRoutingModule, BrowserAnimationsModule, ComponentsModule, MaterialModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
