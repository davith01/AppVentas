import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import type { GestureDetail } from '@ionic/angular';
import { GestureController, IonContent } from '@ionic/angular';
import { DeliveryService, DialogService, ScreenSize, ScreenSizeService, StorageService } from '@app/services';
import * as moment from 'moment';
import { Client, Transaction, Delivery, ProductCatalog, Provider, TransactionType, UserAuth, formatCurrencyExp, animImageSlider, Version } from '@app/core';
import { RedirectService } from '@app/services/redirect/redirect.service';
import { ActivatedRoute } from '@angular/router';

export interface ClientCss {
  client: Client,
  selected: boolean
}

export interface ProductCatalogCss {
  productCatalog: ProductCatalog,
  clientsCss: ClientProductCss[],
  selected: boolean,
  price: number
}

export interface ClientProductCss {
  client: Client,
  unit: number,
  price?: number,
  selected: boolean
}

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
  animations: [animImageSlider]
})
export class DeliveryPage implements OnInit {

  counter: number = 1;
  _clientsFilter: ClientCss[] = [];
  clients: ClientCss[] = [];
  clientsTotal = -1;
  providers: Provider[] = [];
  _providersFilter: Provider[] = [];
  providersTotal = -1;
  productCatalogs: ProductCatalogCss[] = [];
  validate = false;
  transactionDate = moment().format('DD/MM/YYYY');
  description: string = '';
  showClientInItem = true;
  isLandscape: boolean | undefined;
  isCardActive = false;
  isNextHighlighted = false;
  isPreviousHighlighted = false;
  transactionType: TransactionType | undefined;
  userAuth: UserAuth | undefined;
  providersIdsSelected: number[] = [];
  loaded = false;
  deliveryId: number = new Date().getTime();

  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;
  @ViewChild('debug', { read: ElementRef }) debug: ElementRef<HTMLParagraphElement> | undefined;

  constructor(
    private gestureCtrl: GestureController,
    private cdRef: ChangeDetectorRef,
    private dialog: DialogService,
    private screenSizeService: ScreenSizeService,
    private dialogService: DialogService,
    private storageService: StorageService,
    private redirectService: RedirectService,
    private deliveryService: DeliveryService,
    private activatedRoute: ActivatedRoute,
  ) { }

  async ngOnInit() {

    const loadingElement = await this.dialogService.showLoading();

    this.isLandscape = this.screenSizeService.isLandscape;
    // Suscribe al observable del servicio para recibir actualizaciones sobre el tamaño de la pantalla
    this.screenSizeService.isLandscape$.subscribe((screenSize:ScreenSize) => {
      this.isLandscape = screenSize.isLandscape;
    });

    this.userAuth = await this.storageService.getUserAuth() as UserAuth;
    const productCatalogs = await this.storageService.getProductCatalogs(this.userAuth) as ProductCatalog[];

    const transactionTypes = await this.storageService.getTransactionTypes(this.userAuth);
    this.transactionType = transactionTypes?.find((transactionType) => transactionType.id == Number('1'));

    this.providers = await this.storageService.getProviders(this.userAuth) as Provider[];
    this._providersFilter = this.providers;
    const clients = await this.storageService.getClients(this.userAuth) as Client[];
    this.clients = clients.map((client) => {
      return {
        client: client,
        selected: false
      }
    });
    this._clientsFilter = this.clients;

    this.productCatalogs = productCatalogs.map(productCatalogs => {
      return {
        productCatalog: productCatalogs,
        clientsCss: this.clients.map((clientCss: ClientCss): ClientProductCss => { return { client: clientCss.client, unit: 0, selected: false } }),
        selected: false,
        price: productCatalogs.price || 0
      }
    });

    loadingElement.dismiss();


    this.activatedRoute.queryParams.subscribe(async (params) => {

      const deliveryId = params['deliveryId'];
      if (deliveryId) {
        this.getDeliveryById(Number(deliveryId));
      } else {
        const deliveryTemp = await this.storageService.getCurrentDelivery(this.userAuth as UserAuth);
        if (deliveryTemp) {
          this.getDeliveryOnCache(deliveryTemp);
        } else {
          this.loaded = true;
        }
      }
    });
  }

  ionViewWillLeave() {
    //alert('2.ionViewWillLeave()');
    //this.unlock();
    //this.lockPortrait();
  }

  ionViewDidLeave() {
    //alert('3.ionViewDidLeave()');
    //this.unlock();
  }

  ngAfterViewInit() {
    this.setupGestures();
  }

  reloadClientsInItem(clientCss: ClientCss) {
    this.productCatalogs.forEach((productCatalogsCss) => {
      const existingClientCss = productCatalogsCss.clientsCss.find(c => c.client.id === clientCss.client.id);
      if (existingClientCss) {
        existingClientCss.selected = clientCss.selected;
        existingClientCss.unit = 0;
      }
    });
  }

  validateForm() {
    if (this.getProviderListSelectedLength() == 0) {
      this.dialog.showMessage("Seleccione un proveedor");
      this.setCounterPage(1);
      return false;
    }

    if (this.getClientsSelectedLength() === 0) {
      this.dialog.showMessage("Seleccione los clientes");
      this.setCounterPage(2);
      return false;
    }

    if (this.getProductCatalogsSelectedLength() === 0) {
      this.setCounterPage(3);
      this.dialog.showMessage("Seleccione los items");
      return false;
    }

    return true;
  }

  onNext() {

    this.isNextHighlighted = true;
    setTimeout(() => {
      this.isNextHighlighted = false;
    }, 400);

    if (this.counter === 3 && !this.validateForm()) {
      return;
    }

    if (this.counter < 4) {
      this.counter++;
    }
  }

  onPrevious() {
    this.isPreviousHighlighted = true;
    setTimeout(() => {
      this.isPreviousHighlighted = false;
    }, 1000);

    if (this.counter > 1) {
      this.counter--;
    }
  }

  changeDateTransaction(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.transactionDate = dateTime.format('DD/MM/YYYY');
      this.saveCurrentDelivery();

      const modal = datetimeEl.parentNode.parentElement;
      if (modal) {
        modal.dismiss();
      }
    }
    //const result = formatISO(new Date(this.callDate))

  }

  // Busca clientes en la lista según el valor del input
  findClient(event: any) {
    // Obtiene y normaliza el valor del input
    const query = (event.target.value || '').trim().toLowerCase();

    // Filtra los clientes según la consulta
    this._clientsFilter = query ? this._clientsFilter.filter(clientCss => clientCss.client?.name?.toLowerCase().includes(query)) : this.clients;

    // Actualiza el total de clientes según el resultado de la consulta
    this.clientsTotal = query ? this._clientsFilter.length : -1;
  }

  // Busca proveedores en la lista según el valor del input
  findProviders(event: any) {
    // Obtiene y normaliza el valor del input
    const query = (event.target.value || '').trim().toLowerCase();

    // Filtra los clientes según la consulta
    this._providersFilter = query ? this.providers.filter(provider => provider?.name?.toLowerCase().includes(query)) : this.providers;

    // Actualiza el total de clientes según el resultado de la consulta
    this.providersTotal = query ? this._providersFilter.length : -1;
  }

  // Verifica si un cliente está en la lista seleccionada
  findClientInList2(client: Client): boolean {
    return this.clients.some(selectedClient => selectedClient.selected && selectedClient.client.id === client.id);
  }

  // Alterna la visibilidad de la lista de clientes en un elemento
  async toogleListClientInProductCatalog(productCatalogCss: ProductCatalogCss, index: number) {

    const loadingElement = await this.dialogService.showLoading();
    this.showClientInItem = !this.showClientInItem;

    if (index == 0) {
      loadingElement.dismiss();
      return;
    };

    if (this.showClientInItem) {
      await this.moveToPoint(1, 0);
    }

    // Después de un segundo, realiza el scroll al elemento deseado
    await this.moveToPoint(productCatalogCss.productCatalog.id, 10);
    loadingElement.dismiss();
  }

  moveToPoint(index: number, duration: number) {
    const elementId = `table-item-id-${index}`;
    const tableElement = document.getElementById(elementId);
    const ionContent = document.querySelector('ion-content');

    if (tableElement && ionContent) {
      const distanciaEnY = tableElement.getBoundingClientRect().top - ionContent.scrollTop;
      this.content?.scrollToPoint(0, distanciaEnY, duration);
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('');
      }, duration);
    })
  }

  // Selecciona o deselecciona un cliente en la lista
  selectClient(client: Client, isNoSave: boolean) {
    const selectedIndex = this.clients.findIndex(selectedClient => selectedClient.client.id === client.id);
    if (selectedIndex !== -1) {
      // Si el cliente está en la lista, alterna la propiedad 'selected'
      this.clients[selectedIndex].selected = !this.clients[selectedIndex].selected;
      this._clientsFilter[selectedIndex].selected = this.clients[selectedIndex].selected;
      this.reloadClientsInItem(this.clients[selectedIndex]);
      if (!isNoSave) this.saveCurrentDelivery();
    }
  }

  // Verifica si al menos un cliente está parcialmente seleccionado
  isPartialSelectedClient(): boolean {
    const selected = this._clientsFilter.filter((selectedItem) => selectedItem.selected).length;
    return selected >= 1 && this._clientsFilter.length != selected;
  }

  // Verifica si todos los clientes están seleccionados
  isAllSelectedClient(): boolean {
    const selected = this._clientsFilter.filter((selectedItem) => selectedItem.selected).length;
    return selected >= 1 && this._clientsFilter.length == selected;
  }

  // Verifica si todos los clientes están deseleccionados
  isAllClearClient(): boolean {
    const selected = this._clientsFilter.filter((selectedItem) => selectedItem.selected).length;
    return selected == 0;
  }

  // Alterna la selección de todos los clientes en la lista
  toogleClients(value: boolean) {
    this._clientsFilter
      .filter(clientCss => clientCss.selected !== value)
      .forEach(clientCss => this.selectClient(clientCss.client, false));
  }

  // Devuelve true si encuentra un elemento seleccionado con el mismo ID
  findProductInList(productCatalog: ProductCatalog): boolean {
    return this.productCatalogs.some(productCatalogsCss => productCatalogsCss.selected && productCatalogsCss.productCatalog.id === productCatalog.id);
  }

  // Selecciona o deselecciona un elemento según su existencia en la lista
  selectProductCatalog(productCatalog: ProductCatalog, isNoSave: boolean) {
    const selectedIndex = this.productCatalogs.findIndex(selectedItem => selectedItem.productCatalog.id === productCatalog.id);
    if (selectedIndex !== -1) {
      // Si el cliente está en la lista, alterna la propiedad 'selected'
      this.productCatalogs[selectedIndex].selected = !this.productCatalogs[selectedIndex].selected;
      if (!isNoSave) this.saveCurrentDelivery();
    }
  }

  // Verifica si al menos un elemento está parcialmente seleccionado
  isPartialSelectedProductCatalog(): boolean {
    const selected = this.productCatalogs.filter((selectedItem) => selectedItem.selected).length;
    return selected >= 1 && this.productCatalogs.length != selected;
  }

  // Verifica si todos los elementos están seleccionados
  isAllSelectedProductCatalog(): boolean {
    const selected = this.productCatalogs.filter((p) => p.selected).length;
    return selected > 1 && this.productCatalogs.length == selected;
  }

  // Verifica si todos los elementos están deseleccionados
  isAllClearProductCatalog(): boolean {
    const selected = this.productCatalogs.filter((p) => p.selected).length;
    return selected == 0;
  }

  // Alterna la selección de todos los elementos
  toogleProductCatalogList(value: boolean) {
    this.productCatalogs.forEach(productCatalogsCss => {
      const isExist = this.findProductInList(productCatalogsCss.productCatalog);
      if ((isExist && !value) || (!isExist && value)) {
        this.selectProductCatalog(productCatalogsCss.productCatalog, false);
      }
    });
  }

  //Busca el provedor seleccionado
  selectProvider(provider: Provider) {

    const selectedIndex = this.providersIdsSelected.findIndex(selectedProvider => selectedProvider === provider.id);
    if (selectedIndex !== -1) {
      this.providersIdsSelected.splice(selectedIndex, 1);
      this.saveCurrentDelivery();
    }
    else {
      this.providersIdsSelected.push(provider.id);
    }
  }

  inputClick(event: any) {
    event.stopPropagation();
  }

  //function deprecated
  inputOnchange(event: any, productCatalog: ProductCatalog) {

    const excludedKeys = ['Backspace', 'Tab'];

    let numberT = event.currentTarget.value.trim().replace('$', '');
    if (numberT.length == 0) {
      event.currentTarget.value = '';
      if (this.findProductInList(productCatalog)) {
        this.selectProductCatalog(productCatalog, false);
      }
      return;
    }
    if (/^[a-zA-Z]$/.test(event.key) && (!excludedKeys.includes(event.key))) {
      console.log(event.key);
      numberT = numberT.substr(0, numberT.length - 1);
    }
    event.currentTarget.value = formatCurrencyExp(numberT);


    if (!this.findProductInList(productCatalog)) {
      this.selectProductCatalog(productCatalog, false);
    }
  }

  async setCounterPage(counter: number) {
    if (counter === 4) {
      if (!this.validateForm()) {
        return;
      } else {
        const loadingElement = await this.dialogService.showLoading();
        setTimeout(() => {
          loadingElement.dismiss();
        }, 1000);
      }
    }

    this.counter = counter;
  }

  async onFinish() {

    const loadingElement = await this.dialogService.showLoading();
    
    const transactions: Transaction[] = [];
    let txTemp: Transaction;
    let i = 0;
    for (let productCatalogCss of this.productCatalogs) {
      if (productCatalogCss.selected) {
        for (let clientCss of productCatalogCss.clientsCss) {
          i++;
          if (clientCss.selected && clientCss.unit && clientCss.unit > 0) {
            const selectIndex = transactions.findIndex((tx) => {
              return tx.client?.id == clientCss.client.id
            });

            let price = (clientCss.price || productCatalogCss.productCatalog.price || 0) * clientCss.unit;

            if (selectIndex === -1) {
              txTemp = {
                date: this.transactionDate,
                price: price,
                units: clientCss.unit,
                balanceAfter: (clientCss.client?.balance || 0) + price,
                balanceBefore: clientCss.client?.balance || 0,
                client: clientCss.client,
                transaction_type_id: (this.transactionType as TransactionType).id,
                transactionType: this.transactionType,
                client_id: clientCss.client.id,
                transactionsDetail: [],
                syncRequired: true,
                delivery_id: this.deliveryId,
                id: this.deliveryId + i                
              }
              transactions.push(txTemp);
            }
            else {
              txTemp = transactions[selectIndex];
              txTemp.price += price;
              txTemp.units += clientCss.unit;
            }

            clientCss.client.balance = clientCss.client.balance || 0;
            clientCss.client.balance = clientCss.client.balance + price;

            txTemp.transactionsDetail?.push({
              product_catalog_id: productCatalogCss.productCatalog.id,
              price: clientCss.price || productCatalogCss.productCatalog.price || 0,
              units: clientCss.unit
            });
          }
        }
      }
    }

    const delivery: Delivery = {
      id: this.deliveryId,
      date: this.transactionDate,
      description: this.description,
      transactionType: this.transactionType as TransactionType,
      transaction_type_id: (this.transactionType as TransactionType).id,
      totalPrice: this.getTotalDeliveryPrice(),
      totalUnits: this.getTotalDeliveryUnits(),
      transactions: transactions,
      provider_ids: JSON.stringify(this.providersIdsSelected),
      syncRequired: true
    };

    let saveSuccess = await this.deliveryService.saveDelivery(this.userAuth as UserAuth, delivery);
    if (saveSuccess) {

      //Save transactions
      if (delivery.transactions) {

        for (let trx of delivery.transactions) {
          saveSuccess = await this.deliveryService.saveTransaction(this.userAuth as UserAuth, trx);
          if (saveSuccess && trx.client) {
            trx.client.balance = (trx.client.balance || 0) + trx.price;
            this.deliveryService.saveClient(this.userAuth as UserAuth, trx.client);
          } else {
            alert('');
          }
        }
      }
      else {
        alert('');
      }

      const version = await this.storageService.getVersion(this.userAuth as UserAuth) as Version;
      version.version++;
      await this.storageService.setVersion(this.userAuth as UserAuth, version as Version);

      await this.storageService.removeCurrentDelivery(this.userAuth as UserAuth);
      this.goToDeliveryList();
    }
    else {
      alert('error');
    }

    loadingElement.dismiss();

  }

  getClientInTransactions(clientTransactionList: Transaction[], clientId: number) {
    return clientTransactionList.find((clientSelected) => {
      return clientSelected.client?.id == clientId;
    });
  }

  private async goToDeliveryList(): Promise<void> {
    this.redirectService.redirectTo('/tabs/tab2')
  }

  setupGestures() {

    const ionContent = document.querySelector('.container-sliders');

    if (ionContent) {
      const gesture = this.gestureCtrl.create({
        el: ionContent,
        onStart: () => {
          this.isCardActive = true;
          this.cdRef.detectChanges();
        },
        onMove: (detail: GestureDetail) => {
          const { type, currentX, deltaX, velocityX } = detail;
          if (this.debug)
            this.debug.nativeElement.innerHTML = `
            <div>Type: ${type}</div>
            <div>Current X: ${currentX}</div>
            <div>Delta X: ${deltaX}</div>
            <div>Velocity X: ${velocityX}</div>`;
        },
        onEnd: (detail: GestureDetail) => {
          this.isCardActive = false;
          this.cdRef.detectChanges();
          if (detail.deltaX > 125) {
            this.onPrevious();
          }
          else if (detail.deltaX < -125) {
            this.onNext();
          }
        },
        gestureName: 'swipe',
      });

      gesture.enable();
    }
  }

  async lock() {
    //await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE });
  };

  async lockPortrait() {
    //await ScreenOrientation.lock({ type: OrientationType.PORTRAIT });
  };

  async unlock() {
    //await ScreenOrientation.unlock();
  };

  async getCurrentOrientation() {
    //const result = await ScreenOrientation.getCurrentOrientation();
    //return result.type;
  };

  getTotalDeliveryPrice() {
    let total = 0;
    for(let productCatalog of this.productCatalogs){
      total += this.getTotalProductCatalogPrice(productCatalog);
    }
    return total;
  }

  getTotalDeliveryUnits() {
    let total = 0;
    for(let productCatalog of this.productCatalogs){
      total += this.getTotalProductCatalogUnits(productCatalog);
    }
    return total;
  }

  getTotalProductCatalogUnits(productCatalog: ProductCatalogCss): number {
    let totalUnits = 0;
    for(let clientsCss of productCatalog.clientsCss){
      totalUnits += clientsCss.unit;
    }
    return totalUnits;
  }

  getTotalProductCatalogPrice(productCatalog: ProductCatalogCss): number {
    
    let totalPrice = 0;
    for(let clientCss of productCatalog.clientsCss){
      const unitPrice = clientCss.price || (productCatalog.productCatalog.price || 0);
      totalPrice += clientCss.unit * unitPrice;
    }
    return totalPrice;
  }

  getProviderListSelectedLength() {
    return this.providersIdsSelected.length;
  }

  getProductCatalogsSelectedLength() {
    return this.productCatalogs.filter(productCatalogsCss => productCatalogsCss.selected).length;
  }

  getClientsSelectedLength() {
    return this.clients.filter(clientCss => clientCss.selected).length;
  }

  formatPrice(value: any) {
    return formatCurrencyExp(value);
  }

  getProviderSelectName(): string {
    const selectedProviders = this.providers.filter(provider => this.providersIdsSelected.includes(provider.id));
    return selectedProviders.map(provider => provider.name).join(' - ');
  }

  saveCurrentDelivery() {
    this.storageService.setCurrentDelivery(this.userAuth as UserAuth, {
      providersIdsSelected: this.providersIdsSelected,
      clients: this.clients,
      deliveryId: this.deliveryId,
      productCatalogs: this.productCatalogs,
      transactionDate: this.transactionDate
    });
    //this.dialogService.showMessage('saveDelivery');
  }

  async getDeliveryOnCache(deliveryTemp: any) {
    const loadingElement = await this.dialogService.showLoading();
    try {
      this.deliveryId = deliveryTemp.deliveryId;
      this.clients = deliveryTemp.clients.map((client: ClientCss) => ({
        ...client,
      }));
      this.productCatalogs = deliveryTemp.productCatalogs.map((productCatalog: ProductCatalogCss) => ({
        ...productCatalog,
      }));
      this.transactionDate = deliveryTemp.transactionDate;

      this.providersIdsSelected = deliveryTemp.providersIdsSelected;

    } catch (e) { this.dialogService.showMessage(JSON.stringify(e)); }

    loadingElement.dismiss();
    this.counter = 1;
    this.onNext(); this.onNext(); this.onNext();
    this.loaded = true;
  }

  async getDeliveryById(deliveryId: number) {
    const loadingElement = await this.dialogService.showLoading();

    const deliveries = await this.storageService.getDeliveries(this.userAuth as UserAuth) as Delivery[];
    const delivery = deliveries.find((delivery) => delivery.id == deliveryId);
    if (delivery) {
      this.deliveryId = delivery.id;
      //Load the client
      this.clients
        .filter(clientCss => delivery.transactions?.some(transaction => transaction.client_id === clientCss.client.id))
        .forEach(clientCss => clientCss.selected = true);

      //load the catalog product
      this.productCatalogs.forEach(productCatalogsCss => {

        if (delivery.transactions) {

          for (let transaction of delivery.transactions) {
            if (transaction.transactionsDetail)
              for (let detail of transaction.transactionsDetail) {
                if (detail.product_catalog_id == productCatalogsCss.productCatalog.id) {
                  for (let clientCss of productCatalogsCss.clientsCss) {

                    if (clientCss.client.id == transaction.client_id) {
                      clientCss.price = Number(detail.price);
                      clientCss.unit = Number(detail.units);
                      clientCss.selected = true;
                    }
                  }
                }
              }
          }

          if (delivery.transactions.some(transaction =>
            transaction.transactionsDetail?.some(tx => tx.product_catalog_id === productCatalogsCss.productCatalog.id))) {
            productCatalogsCss.selected = true;
          }
        }
      });

      const transactionTypes = await this.storageService.getTransactionTypes(this.userAuth as UserAuth);
      this.transactionType = transactionTypes?.find((transactionType) => transactionType.id == delivery.transaction_type_id);
      this.transactionDate = delivery.date;
      this.description = delivery.description;
      this.providersIdsSelected = JSON.parse(delivery.provider_ids);
      this.counter = 1;
      this.onNext(); this.onNext(); this.onNext();
    }
    loadingElement.dismiss();
    this.loaded = true;
  }

}
