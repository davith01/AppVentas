import { Injectable } from '@angular/core';
import { UsersService } from '../user.services/users.service';
import { StorageService } from '../storage/storage.services';
import { Client, DialogService, Provider, Product, ProductCatalog, Transaction, TransactionDetail, TransactionType, UserAuth, Delivery } from '@app/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PreloadService {

  constructor(
    private userService: UsersService,
    private storageService: StorageService,
    private dialogService: DialogService) {
  }

  async sync(userAuth: UserAuth) {

    // Get user authentication information from storage
    const version = await this.storageService.getVersion(userAuth);
    const versionLogin = userAuth && userAuth.version ? userAuth.version : 0;

    // Check if version is not available or if the stored version is less than the login version
    if (!version || version.version < versionLogin) {
      // Check if synchronization is required
      if (version?.syncRequired) {
        // Show alert dialog for pending changes
        this.dialogService.showAlert({
          header: 'Synchronization',
          subHeader: 'There are pending changes to upload',
          message: 'Do you want to upload the changes or discard them?',
          buttons: [
            { text: 'Cancel', role: 'cancel' },
            { text: 'Discard', role: 'confirm' },
            { text: 'Upload', role: 'confirm' }
          ]
        });
      } else {
        // Perform data preload from userService
        const dataClient = await this.userService.preload()
          .catch((e: any) => {
            // Handle errors and show a message
            this.dialogService.showMessage(e);
          });

        if (dataClient) {
          // Set clients in storage
          await this.storageService.setClients(userAuth, dataClient.clients.map((client: Client) => {
            return Object.assign(client, { id: Number(client.id), balance: Number(client.balance) });
          }));

          // Map and fetch client for each transaction asynchronously
          await this.storageService.setProducts(userAuth, dataClient.products.map((product: Product) => {
            return Object.assign(product, { id: Number(product.id) });
          }));

          await this.storageService.setProductCatalogs(userAuth, dataClient.productCatalogs.map((productCatalog: ProductCatalog) => {
            return Object.assign(productCatalog, { id: Number(productCatalog.id) });
          }));
          await this.storageService.setTransactionTypes(userAuth, dataClient.transactionTypes.map((transactionType: TransactionType) => {
            return Object.assign(transactionType, { id: Number(transactionType.id) });
          }));
          await this.storageService.setProviders(userAuth, dataClient.providers.map((provider: Provider) => {
            return Object.assign(provider, { id: Number(provider.id) });
          }));

          // Set transactions in storage
          const transactionsList = dataClient.transactions.map((trx: any) => ({
            id: Number(trx.id),
            date: moment(trx.date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            delivery_id: Number(trx.delivery_id),
            transaction_type_id: Number(trx.transaction_type_id),
            paymentMethod: trx.paymentMethod,
            client_id: Number(trx.client_id),
            units: Number(trx.units),
            price: Number(trx.price),
            balanceAfter: Number(trx.balanceAfter),
            balanceBefore: Number(trx.balanceBefore),
            transactionsDetail: trx.details ? trx.details.map((detail: TransactionDetail) => ({
              price: Number(detail.price),
              product_catalog_id: Number(detail.product_catalog_id),
              units: Number(detail.units)
            })) : undefined,
            syncRequired: false
          }));
          await this.storageService.setTransactions(userAuth, transactionsList);

          //Set deliveries in Store
          const transactionTypes = await this.storageService.getTransactionTypes(userAuth);

          await this.storageService.setDeliveries(userAuth, dataClient.deliveries.map((delivery: Delivery) => {
            return Object.assign(delivery, {
              id: Number(delivery.id),
              transaction_type_id: Number(delivery.transaction_type_id),
              totalUnits: Number(delivery.totalUnits),
              totalPrice: Number(delivery.totalPrice)
            });
          }));

          // Update internal version number
          const newVersion = { version: dataClient.version, date: new Date(), syncRequired: false };
          userAuth.version = dataClient.version;
          await this.storageService.setUserAuth(userAuth);
          await this.storageService.setVersion(userAuth, newVersion);
        }
      }
    }
  }

}
