import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, LoginPageRoutingModule],
  declarations: [LoginPage],
  providers: [FingerprintAIO]
})
export class LoginPageModule { }
