import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';

@Injectable({
    providedIn: 'root',
})
export class RedirectService {
    constructor(private router: Router) { }

    async redirectTo(page: string, data?: any) {
        const extras: NavigationExtras = {
            queryParams: data,
            replaceUrl: true
        }

        this.router.navigate([page], extras);
        //await this.router.navigate(['/tabs/delivery'], { replaceUrl: true });
        //this.navCtrl.navigateForward('client-detail', {
        //    queryParams: {
        //        clientId: clientId
        //      },
        //   })
    }
}
