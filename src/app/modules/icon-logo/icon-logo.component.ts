import { Component, OnInit } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { StorageService } from '@app/services';
import { environment } from '@env/environment';

@Component({
  selector: 'app-icon-logo',
  templateUrl: './icon-logo.component.html',
  styleUrls: ['./icon-logo.component.scss'],
})
export class IconLogoComponent  implements OnInit {
  urlIcon: string = '';
  urlIconHtml: SafeHtml | undefined;

  constructor(    
    private storageService: StorageService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    this.urlIcon = await this.storageService.getUrlIcon();
    this.urlIcon = this.urlIcon || environment.urlIcon;
    this.urlIconHtml = this.sanitizer.bypassSecurityTrustUrl(this.urlIcon);

  }

}
