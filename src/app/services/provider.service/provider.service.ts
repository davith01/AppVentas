import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Provider {
  id: number,
  name: string;
  color: string;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  private readonly dataProviderUrl = 'assets/data/providers.json';
  providers: any;

  constructor(
    private http: HttpClient) { }

  listProviders(): Promise<any | undefined> {
    return new Promise((resolve, reject) => {
      this.http.get<Provider[]>(this.dataProviderUrl)
        .subscribe((response) => {
          this.providers = response;
          setTimeout(() => {
            resolve({ data: this.providers });
          }, 1000);

        });
    });
  }

}
