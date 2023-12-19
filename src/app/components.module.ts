import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NetworkStatusComponent } from './components/network-status/network-status.component';


@NgModule({
    declarations: [NetworkStatusComponent],
    imports: [CommonModule,IonicModule],
    exports: [NetworkStatusComponent]
})
export class ComponentsModule {}
