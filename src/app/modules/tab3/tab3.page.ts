import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { StorageService } from '@app/services';
import { environment } from '@env/environment';

declare var cloudinary: any;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  cloudName = "dfxkgtknu"; // replace with your own cloud name
  uploadPreset = "hlwfoelv"; // replace with your own upload preset
  myWidget: any;
  urlIcon: string = '';
  urlIconHtml: SafeHtml | undefined;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {

    this.urlIcon = await this.storageService.getUrlIcon();
    this.urlIcon = this.urlIcon || environment.urlIcon;
    this.urlIconHtml = this.sanitizer.bypassSecurityTrustUrl(this.urlIcon);

    this.myWidget = cloudinary.createUploadWidget(
      {
        cloudName: this.cloudName,
        uploadPreset: this.uploadPreset,
        // cropping: true, //add a cropping step
        // showAdvancedOptions: true,  //add advanced options (public_id and tag)
        sources: [ "local", ], // restrict the upload sources to URL and local files
        // multiple: false,  //restrict upload to a single file
        folder: "appVenta", //upload files to the specified folder
        // tags: ["users", "profile"], //add the given tags to the uploaded files
        // context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
        // clientAllowedFormats: ["images"], //restrict uploading to image files only
        // maxImageFileSize: 2000000,  //restrict file size to less than 2MB
        // maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
        // theme: "purple", //change to a purple theme
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          console.log("Done! Here is the image info: ", result.info);

          this.urlIcon = result.info.secure_url;
          this.storageService.setUrlIcon(this.urlIcon);
          this.urlIconHtml = this.sanitizer.bypassSecurityTrustUrl(this.urlIcon);
        }
      }
    );
  }

  openCloudinaryWidget() {
    this.myWidget.open();
  }


  navigateToOption(string: any, title: string) {
    this.router.navigate(['url', title]);
  }

}
