import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UsersService } from '../services/api/users.service';
import { SynchronizeEventService } from '../services/synchronize event';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  newAgenda: boolean = false;

  constructor(
    public navCtrl: NavController,
    public usersService: UsersService,
    public synchronizeEvent: SynchronizeEventService) { }

  ngOnInit() {

    this.usersService.getUserAuthToken()?.then((userAuth: any) => {

      if (userAuth) {
        this.synchronizeEvent.syncFinish().subscribe((data) => {
          this.newAgenda = true;
        });

      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });

  }

  onSyncButton() {
    this.synchronizeEvent.syncInit();
  }
}
