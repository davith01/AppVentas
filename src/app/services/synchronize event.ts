import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SynchronizeEventService {

  //Observable methods
  private userSynchronize = new Subject<any>();

  syncInit() {
    this.userSynchronize.next('sync:init');
  }

  syncFinish(): Subject<any> {
    return this.userSynchronize;
  }

}
