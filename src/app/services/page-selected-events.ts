import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageSelectedEventService {
  
  private pageSelected = new Subject<any>();

  //Observable methods
  setEvent(pageSelected:string) {
    this.pageSelected.next(pageSelected);
  }

  getEvent(): Subject<any> {
    return this.pageSelected;
  }

}
