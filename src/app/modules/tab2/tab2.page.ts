import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client, Delivery, ProductCatalog, Provider, Transaction, TransactionDetail, UserAuth, fadeAnimation } from '@app/core';
import { RedirectService, ScreenSize, ScreenSizeService, StorageService } from '@app/services';
import { DeliveryService } from '@app/services/delivery.service/delivery.service';
import * as moment from 'moment';

export interface DeliveryCss {
  delivery: Delivery;
  totalDetails: DeliveryDetailCss[];
}
export interface DeliveryDetailCss {
  productCatalog: ProductCatalog,
  subTotalUnits: number,
  subTotalPrice: number
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  animations: [fadeAnimation],
})
export class Tab2Page implements OnInit, AfterViewInit {

  deliveryCssList: DeliveryCss[] = [];
  deliveryCssTotal = -1;
  _deliveryCssFilter: DeliveryCss[] = [];
  loading = false;
  isLandscape = false;
  providers: Provider[] = [];
  selectedFilterProvider: Provider | undefined;
  clients: Client[] | undefined;
  selectedFilterClient: Client | undefined;
  filterDateStart: Date | undefined;
  filterDateEnd: Date | undefined;
  showDateFilter = false;
  selectedFilterToday = true;
  userAuth: UserAuth | undefined;

  constructor(
    private router: Router,
    private deliveryService: DeliveryService,
    private screenSizeService: ScreenSizeService,
    private redirectService: RedirectService,
    private storageService: StorageService
  ) { }

  async ngOnInit() {

    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    const deliveryList = await this.deliveryService.getDeliveries(userAuth);
    this.providers = await this.storageService.getProviders(userAuth) as Provider[];
    this.clients = await this.storageService.getClients(userAuth) as Client[];

    const productCatalogs = await this.storageService.getProductCatalogs(userAuth) as ProductCatalog[];

    this.deliveryCssList = this.parseDeliveryList(deliveryList, productCatalogs);
    this._deliveryCssFilter = this.deliveryCssList;

    this.loading = true;
    this.isLandscape = this.screenSizeService.isLandscape;
    // Suscribe al observable del servicio para recibir actualizaciones sobre el tamaño de la pantalla
    this.screenSizeService.isLandscape$.subscribe((screenSize:ScreenSize) => {
      this.isLandscape = screenSize.isLandscape;
    });
  }

  parseDeliveryList(deliveryList: Delivery[], productCatalogs: ProductCatalog[]): DeliveryCss[] {
    return deliveryList.map(delivery => {

      const totalDetails: Record<number, DeliveryDetailCss> = {};

      delivery.transactions?.forEach(transaction => {
        transaction.transactionsDetail?.forEach(detail => {
          if (detail.product_catalog_id) {
            const productCatalog = productCatalogs.find(pc => pc.id == detail.product_catalog_id);
            const productId = detail.product_catalog_id;
            totalDetails[productId] = totalDetails[productId] || {
              productCatalog: productCatalog,
              subTotalPrice: 0,
              subTotalUnits: 0
            };
            totalDetails[productId].subTotalPrice += Number(detail.units) * Number(detail.price);
            totalDetails[productId].subTotalUnits += Number(detail.units);
          }
        });
      });

      return { delivery, totalDetails: Object.values(totalDetails) };
    });
  }


  async ngAfterViewInit() {
    const userAuth = await this.storageService.getUserAuth() as UserAuth;
    const deliveries = await this.deliveryService.getDeliveries(userAuth) as Delivery[];
    const productCatalogs = await this.storageService.getProductCatalogs(userAuth) as ProductCatalog[];

    this.deliveryCssList = this.parseDeliveryList(deliveries, productCatalogs);
    this._deliveryCssFilter = this.deliveryCssList;
  }

  deliveryTotalUnits(delivery:Delivery){
    let total = 0;
    if(delivery.transactions)
    for(let trx of delivery.transactions) {
      total += trx.units;
    }
    return total; 
  }

  deliveryTotalPrice(delivery:Delivery){
    let total = 0;
    if(delivery.transactions)
    for(let trx of delivery.transactions) {
      total += trx.price;
    }
    return total; 
  }

  confirmDateFilter() {
    this.showDateFilter = false;
  }

  clearDateFilter() {
    this.selectedFilterProvider = undefined;
    this.selectedFilterClient = undefined;
    this.selectedFilterToday = true;
    this.filterDateStart = undefined;
    this.filterDateEnd = undefined;
    this.showDateFilter = false;
  }

  loadMore(event: any) {
    setTimeout(() => {

      let list = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      const length = new Array(list.length).fill(list.length)
      length.forEach(item => {
        list.push(item)
      })
      event.target.complete();
    }, 1000)
  }

  async goToNewDelivery(): Promise<void> {
    this.redirectService.redirectTo('/tabs/delivery');
  }

  findDeliverySearch(event: any) {
    const query = (event.target.value || '').trim().toLowerCase();

    this._deliveryCssFilter = this.deliveryCssList.filter(deliveryCss => {
      return (
        deliveryCss.delivery.transactionType?.name?.includes(query) ||
        deliveryCss.delivery.description?.includes(query) ||
        deliveryCss.delivery.transactions?.some(transaction => transaction.client?.name?.includes(query)) ||
        deliveryCss.delivery.providers?.some(provider => provider.name?.includes(query))
      );
    });

    this.deliveryCssTotal = query ? this._deliveryCssFilter.length : -1;
  }

  findProviderSearch(providerSelected: Provider) {

    this._deliveryCssFilter = this.deliveryCssList.filter(deliveryCss => {
      return (
        deliveryCss.delivery.providers?.some(provider => provider.id == providerSelected.id)
      );
    });
  }

  /* providerFilterChange(e: any) {
     if (typeof e.detail.value == 'string') {
       this._deliveryCssFilter = this.deliveryCssList;
     }
     else {
       const providerSelected: Provider = e.detail.value;
       this.findProviderSearch(providerSelected);
     }
   }*/

  changeDateStart(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.filterDateStart = dateTime.toDate();
      const modal = datetimeEl.parentNode.parentElement;
      if (modal) {
        modal.dismiss();
      }
    }
  }

  changeDateEnd(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.filterDateEnd = dateTime.toDate();
      const modal = datetimeEl.parentNode.parentElement;
      if (modal) {
        modal.dismiss();
      }
    }
  }

  getProvidersName(providers: Provider[]): string {
    if (!providers) return '';
    return providers.map(provider => provider.name).join(',');
  }

  goToDelivery(delivery : Delivery) {
    //this.redirectService.redirectTo(`/tabs/delivery/${delivery.id}`);
    this.redirectService.redirectTo('/tabs/delivery', { deliveryId: delivery.id });

  }

}
