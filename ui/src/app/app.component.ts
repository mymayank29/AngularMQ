import { Component, OnInit } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { Logger, CryptoUtils } from 'msal';
import { AuthService } from './auth.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'MQ';
  loggedIn = this.authService.loggedIn;
  isIframe = this.authService.isIframe;

  constructor(private authService: AuthService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon('remove', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/svg/remove_circle_outline-24px.svg'))
  }

  ngOnInit() {
    this.authService.login();
    console.log(this.authService['authService']['account']['name']);
  }

}
