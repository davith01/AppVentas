import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  list: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  constructor() { }

  loadMore(event: any) {
    setTimeout(() => {
      const length = new Array(this.list.length).fill(this.list.length)
      length.forEach(item => {
        this.list.push(item)
      })
      event.target.complete();
    }, 1000)
  }
}
