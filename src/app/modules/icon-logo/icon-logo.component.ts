import { Component, Input, OnInit } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { StorageService } from '@app/services';
import { environment } from '@env/environment';

@Component({
  selector: 'app-icon-logo',
  templateUrl: './icon-logo.component.html',
  styleUrls: ['./icon-logo.component.scss'],
})
export class IconLogoComponent implements OnInit {
  urlIcon: string = '';
  urlIconHtml: SafeHtml | undefined;
  @Input() ngClass: string | undefined;
  @Input() margin: string = 'auto';
  @Input() borderRadius: string = '0';
  @Input() height: string = '6rem';
  @Input() fullstyle: boolean = false;
  @Input() src: string | undefined;

  param : any;
  constructor(
    private storageService: StorageService,
    private sanitizer: DomSanitizer
  ) {
     
  }

  async ngOnInit() {
    this.storageService.getUrlIcon().subscribe((urlIcon) => {
      this.urlIconHtml = this.sanitizer.bypassSecurityTrustUrl(urlIcon || environment.urlIcon);
    });
  }

}
