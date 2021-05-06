import { Injectable } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { CryptoUtils, Logger } from 'msal';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isIframe = false;
  loggedIn = false;
  constructor(private broadcastService: BroadcastService, private authService: MsalService) {
    this.isIframe = window !== window.parent && !window.opener;
    this.checkAccount();

    this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.checkAccount();
    });
    this.authService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }

      console.log('Redirect Success: ', response.accessToken);
    });
    this.authService.setLogger(new Logger((logLevel, message, piiEnabled) => {
      console.log('MSAL Logging: ', message);
    }, {
      correlationId: CryptoUtils.createNewGuid(),
      piiLoggingEnabled: false
    }));
  }
  checkAccount() {
    this.loggedIn = !!this.authService.getAccount();
  }
  login() {
    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
    if (!this.loggedIn) {
      this.authService.loginRedirect();
    }
  }
  logout() {
    this.authService.logout();
  }
}
