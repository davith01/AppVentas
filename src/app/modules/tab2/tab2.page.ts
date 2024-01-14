import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  timeline = [
    {
      date: "01/01/2023",
      subTotals: [
        { "type": "Buenas", "unit": 332, "total": "12284000" },
        { "type": "Segundas", "unit": 88, "total": "1936000" },
        { "type": "Maduras", "unit": 1, "total": "30000" },
        { "type": "Picas", "unit": 79, "total": "1422000" }],
      provider: {
        "id": 1,
        "name": "Nestor Clavijo",
        "color": "blue"
      },
      icon: "newspaper-outline",
      units: "500",
      total: "15672000",
      transactionType: {
        "id": 1,
        "name": "Venta de Platanos",
        "typeTransaction": "Debt",
        "icon": "add-circle",
        "detail": true
      }
    }, {
      date: "05/12/2023",
      provider: {
        "id": 1,
        "name": "Nestor Clavijo",
        "color": "blue"
      },
      icon: "newspaper-outline",
      subTotals: [
        { "type": "Buenas", "unit": 300, "total": "10908000" },
        { "type": "Segundas", "unit": 110, "total": "6240000" },
        { "type": "Maduras", "unit": 44, "total": "880000" },
        { "type": "Picas", "unit": 153, "total": "2754000" }],
      units: "760",
      total: "20782000",
      transactionType: {
        "id": 1,
        "name": "Venta de Platanos",
        "typeTransaction": "Debt",
        "icon": "add-circle",
        "detail": true
      }
    }, {
      date: "31/12/2023",
      title: "Reparto",
      provider: {
        "id": 2,
        "name": "Doctor Chaim",
        "color": "green"
      },
      icon: "newspaper-outline",
      subTotals: [
        { "type": "Buenas", "unit": 209, "total": "7524000" },
        { "type": "Segundas", "unit": 142, "total": "3408000" },
        { "type": "Maduras", "unit": 20, "total": "400000" },
        { "type": "Picas", "unit": 109, "total": "1962000" }],
      units: "480",
      total: "13294000",
      transactionType: {
        "id": 1,
        "name": "Venta de Platanos",
        "typeTransaction": "Debt",
        "icon": "newspaper-outline",
        "detail": true
      }
    }];

  list: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  constructor(
    private router: Router,
  ) { }

  loadMore(event: any) {
    setTimeout(() => {
      const length = new Array(this.list.length).fill(this.list.length)
      length.forEach(item => {
        this.list.push(item)
      })
      event.target.complete();
    }, 1000)
  }

  newDelivery() {
    this.router.navigate(['/tabs/delivery']);
  }
}
