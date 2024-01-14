import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import type { GestureDetail } from '@ionic/angular';
import { GestureController, IonCard, Gesture, IonContent } from '@ionic/angular';
import { trigger, transition, query, style, animate, group } from '@angular/animations';
import { Client, ClientService, DialogService, Provider, ProviderService, ScreenSizeService } from '@app/services';
import * as moment from 'moment';
import { formatCurrencyExp } from '@app/core';

const left = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [style({ transform: 'translateX(-100%)' }), animate('.3s ease-out', style({ transform: 'translateX(0%)' }))], {
      optional: true,
    }),
    query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(100%)' }))], {
      optional: true,
    }),
  ]),
];

const right = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [style({ transform: 'translateX(100%)' }), animate('.3s ease-out', style({ transform: 'translateX(0%)' }))], {
      optional: true,
    }),
    query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(-100%)' }))], {
      optional: true,
    }),
  ]),
];

export interface ItemType {
  id: number;
  name: string;
  price?: number;
  selected?: boolean;
  clients: DetailItemClientType[]
}

export interface DetailItemClientType {
  unit: number;
  price?: number;
  client: Client
}

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
  animations: [
    trigger('animImageSlider', [
      transition(':increment', right),
      transition(':decrement', left),
    ]),
  ]
})
export class DeliveryPage implements OnInit {

  counter: number = 1;
  _clientsFilter: Client[] = [];
  clients: Client[] = [];
  clientsTotal = -1;
  providers: Provider[] = [];
  items: ItemType[] = [];
  validate = false;
  transactionDate: Date = moment().toDate();
  description: string = '';
  showClientInItem = true;
  isLandscape: boolean | undefined;
  isCardActive = false;

  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;
  @ViewChild('debug', { read: ElementRef }) debug: ElementRef<HTMLParagraphElement> | undefined;

  constructor(
    private clientService: ClientService,
    private providerService: ProviderService,
    private gestureCtrl: GestureController,
    private el: ElementRef,
    private cdRef: ChangeDetectorRef,
    private dialog: DialogService,
    private screenSizeService: ScreenSizeService,
  ) { }

  async ngOnInit() {
    this.isLandscape = this.screenSizeService.isLandscape;
    // Suscribe al observable del servicio para recibir actualizaciones sobre el tamaño de la pantalla
    this.screenSizeService.isLandscape$.subscribe((isLandscape) => {
      this.isLandscape = isLandscape;
    });

    const response = await this.clientService.listClients();
    this.clients = response.data;
    this._clientsFilter = response.data;

    const itemsOri: any[] = [
      {
        "id": 1,
        "name": "Buenas"
      },
      {
        "id": 2,
        "name": "Picadas"
      },
      {
        "id": 3,
        "name": "Regulares"
      },
      {
        "id": 4,
        "name": "Medio buenas"
      }
    ];

    this.items = itemsOri.map(item => ({
      id: item.id,
      name: item.name,
      clients: []
    }));


    const responseProv = await this.providerService.listProviders();
    this.providers = responseProv.data;
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

  reloadclientsInItem(action: string, client: Client) {
    if (!this.items) return;

    for (const item of this.items) {
      if (item.clients && (action === 'remove')) {
        item.clients = item.clients.filter(({ client: c }) => c.id !== client.id);
      } else if (item.clients && (action === 'add')) {
        item.clients.push({ client, unit: 0 } as DetailItemClientType);
      }
    }
  }

  validateForm() {
    if (this.getProviderListSelectedLength() ==0) {
      this.dialog.showMessage("Seleccione un proveedor");
      return false;
    }

    if (this.getClientsSelectedLength() === 0) {
      this.dialog.showMessage("Seleccione los clientes");
      return false;
    }

    if (this.getItemListSelectedLength() === 0) {
      this.dialog.showMessage("Seleccione los items");
      return false;
    }

    return true;
  }

  onNext() {
    if (this.counter === 3 && !this.validateForm()) {
      return;
    }

    if (this.counter < 4) {
      this.counter++;
    }
  }

  onPrevious() {
    if (this.counter > 1) {
      this.counter--;
    }
  }

  changeDateTransaction(event: any) {

    const datetimeEl = event.target;
    if (datetimeEl) {
      const dateTime = moment(event.detail.value);
      this.transactionDate = dateTime.toDate();

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
    this._clientsFilter = query ? this.clients.filter(client => client.name.toLowerCase().includes(query)) : this.clients;

    // Actualiza el total de clientes según el resultado de la consulta
    this.clientsTotal = query ? this._clientsFilter.length : -1;
  }

  // Verifica si un cliente está en la lista seleccionada
  findClientInList(client: Client): boolean {
    return this.clients.some(selectedClient => selectedClient.selected && selectedClient.id === client.id);
  }

  // Alterna la visibilidad de la lista de clientes en un elemento
  toogleListClientInItem(item: ItemType, index: number) {
    this.showClientInItem = !this.showClientInItem;

    if (index == 0) return;
    // Después de un segundo, realiza el scroll al elemento deseado
    setTimeout(() => {
      const elementId = `table-item-id-${item.id}`;
      const tableElement = document.getElementById(elementId);
      const ionContent = document.querySelector('ion-content');

      if (tableElement && ionContent) {
        const distanciaEnY = tableElement.getBoundingClientRect().top - ionContent.scrollTop;
        this.content?.scrollToPoint(0, distanciaEnY, 500);
      }
    }, 100);
  }

  // Selecciona o deselecciona un cliente en la lista
  selectClient(client: Client) {
    const selectedIndex = this.clients.findIndex(selectedClient => selectedClient.id === client.id);

    if (selectedIndex !== -1) {
      // Si el cliente está en la lista, alterna la propiedad 'selected'
      this.clients[selectedIndex].selected = !this.clients[selectedIndex].selected;
      this.reloadclientsInItem(this.clients[selectedIndex].selected ? 'add' : 'remove', client);
    }
  }

  // Verifica si al menos un cliente está parcialmente seleccionado
  isPartialSelectedClient(): boolean {
    return this._clientsFilter.some(client => this.findClientInList(client)) && !this.isAllSelectedClient();
  }

  // Verifica si todos los clientes están seleccionados
  isAllSelectedClient(): boolean {
    return this._clientsFilter.every(client => this.findClientInList(client));
  }

  // Verifica si todos los clientes están deseleccionados
  isAllClearClient(): boolean {
    return this._clientsFilter.every(client => !this.findClientInList(client));
  }

  // Alterna la selección de todos los clientes en la lista
  toogleclients(value: boolean) {
    this._clientsFilter.forEach(client => {
      const isExist = this.findClientInList(client);
      if ((isExist && !value) || (!isExist && value)) {
        this.selectClient(client);
      }
    });
  }

  // Devuelve true si encuentra un elemento seleccionado con el mismo ID
  findItemInList(item: any): boolean {
    return this.items.some(i => i.selected && i.id === item.id);
  }

  // Selecciona o deselecciona un elemento según su existencia en la lista
  selectItem(item: any) {

    const selectedIndex = this.items.findIndex(selectedItem => selectedItem.id === item.id);

    if (selectedIndex !== -1) {
      // Si el cliente está en la lista, alterna la propiedad 'selected'
      this.items[selectedIndex].selected = !this.items[selectedIndex].selected;
    }
  }

  // Verifica si al menos un elemento está parcialmente seleccionado
  isPartialSelectedItem(): boolean {
    return this.items.some(item => this.findItemInList(item)) && !this.isAllSelectedItem();
  }

  // Verifica si todos los elementos están seleccionados
  isAllSelectedItem(): boolean {
    return this.items.every(item => this.findItemInList(item));
  }

  // Verifica si todos los elementos están deseleccionados
  isAllClearItem(): boolean {
    return this.items.every(item => !this.findItemInList(item));
  }

  // Alterna la selección de todos los elementos
  toogleItemList(value: boolean) {
    this.items.forEach(item => {
      const isExist = this.findItemInList(item);
      if ((isExist && !value) || (!isExist && value)) {
        this.selectItem(item);
      }
    });
  }

  selectProvider(provider: any) {
    const selectedIndex = this.providers.findIndex(selectedProvider => selectedProvider.id === provider.id);
    if (selectedIndex !== -1) {
      // Si el provvedor está en la lista, alterna la propiedad 'selected'
      this.providers[selectedIndex].selected = !this.providers[selectedIndex].selected;
    }
    setTimeout(() => {
      if (this.providers[selectedIndex].selected) {
        this.onNext();
      }
    }, 300);
  }

  inputClick(event: any) {
    event.stopPropagation();
  }

  inputOnchange(event: any, item: any) {
    if (1 == 1) return;
    const excludedKeys = ['Backspace', 'Tab'];

    let numberT = event.currentTarget.value.trim().replace('$', '');
    if (numberT.length == 0) {
      event.currentTarget.value = '';
      if (this.findItemInList(item)) {
        this.selectItem(item);
      }
      return;
    }
    if (/^[a-zA-Z]$/.test(event.key) && (!excludedKeys.includes(event.key))) {
      console.log(event.key);
      numberT = numberT.substr(0, numberT.length - 1);
    }
    event.currentTarget.value = formatCurrencyExp(numberT);


    if (!this.findItemInList(item)) {
      this.selectItem(item);
    }
  }

  setCounterPage(counter: number) {
    if (counter === 4 && !this.validateForm()) {
      return;
    }

    this.counter = counter;
  }

  onFinish() {

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

  getTotalItemUnits(item: ItemType) {
    return this.items
      .filter(_item => _item.clients && _item.id === item.id)
      .reduce((totalUnit, _item) => {
        return _item.clients ? totalUnit + _item.clients.reduce((sum, client) => sum + client.unit, 0) : 0;
      }, 0);
  }

  getTotalItemPrice(item: ItemType) {
    let totalPrice = 0;
    for (let _item of this.items) {
      if (_item.id == item.id) {
        for (let client of _item.clients) {
          totalPrice += client.unit * (client.price || item.price || 0)
        }
      }
    }

    return totalPrice;
  }

  getProviderListSelectedLength() {
    return this.providers.filter(provider => provider.selected).length;
  }

  getItemListSelectedLength() {
    return this.items.filter(item => item.selected).length;
  }

  getClientsSelectedLength() {
    return this.clients.filter(client => client.selected).length;
  }

  formatPrice(value: any) {
    return formatCurrencyExp(value);
  }

  getProviderSelectName(): string {
    const selectedProviders = this.providers.filter(provider => provider.selected);
    return selectedProviders.map(provider => provider.name).join(' - ');
  }
  
}
