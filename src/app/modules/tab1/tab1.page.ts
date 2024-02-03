import { Component, OnInit } from '@angular/core';
import {  DialogService, PreloadService, ScreenSize, ScreenSizeService, StorageService } from '@app/services';
import { Client, UserAuth, filterAnimation } from '@app/core';
import { RedirectService } from '@app/services/redirect/redirect.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  animations: [filterAnimation]
})
export class Tab1Page implements OnInit {

  _clientsFilter: Client[] | undefined;
  clients: Client[] | undefined;
  clientsTotal = -1;
  loading = false;
  isLandscape = false;

  constructor(
    private preloadService: PreloadService,
    private storageService: StorageService,
    private screenSizeService: ScreenSizeService,
    private dialogService: DialogService,
    private redirectService: RedirectService
  ) {
  }

  async ngOnInit() {

    const loadingElement = await this.dialogService.showLoading();

    this.isLandscape = this.screenSizeService.isLandscape;
    // Suscribe al observable del servicio para recibir actualizaciones sobre el tamaño de la pantalla
    this.screenSizeService.isLandscape$.subscribe((screenSize:ScreenSize) => {
      this.isLandscape = screenSize.isLandscape;
    });
    
    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    await this.preloadService.sync(userAuth);

    this.clients = this._clientsFilter = await this.storageService.getClients(userAuth) as Client[];

    this.loading = true;
    loadingElement.dismiss();
  }  

  findClient(event: any) {
    const query = (event.target.value || '').trim().toLowerCase();
    this._clientsFilter = query ? this.clients?.filter(client => client?.name?.toLowerCase().includes(query)) : this.clients;
    this.clientsTotal = query && this._clientsFilter ? this._clientsFilter.length : -1;
  }

  goToClientDetail(clientId: any) {
    this.redirectService.redirectTo('client-detail', { clientId: clientId });
  }

}