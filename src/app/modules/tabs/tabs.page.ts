import { Component, OnInit } from '@angular/core';
import { DialogService } from '@app/services';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { ActionSheetButton, AlertOptions } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  newAgenda: boolean = false;
  faGear = faGear;

  constructor(private dialogService: DialogService) { }

  ngOnInit() {
  }

  async showConfigOption() {
    const buttons: ActionSheetButton[] = [
      {
        text: 'Catálogo de productos',
        data: {
          action: 'delete',
        },
      },
      {
        text: 'Icono y nombre',
        data: {
          action: 'share',
        },
      }
    ];
    await this.dialogService.showActionSheet(buttons,'Configuración');
  }
}
