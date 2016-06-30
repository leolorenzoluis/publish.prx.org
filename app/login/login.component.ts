import {Component, ElementRef} from '@angular/core';
import {DomSanitizationService, SafeResourceUrl} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {AuthService} from '../shared/auth/auth.service';
import {AuthUrls} from '../shared/auth/auth.urls';

@Component({
  selector: 'publish-login',
  styleUrls: ['app/login/login.component.css'],
  template: `
    <div class="login">
      <h1>Login</h1>
      <p *ngIf="!errorMsg">You must login to use this app</p>
      <p *ngIf="errorMsg" class="error">{{errorMsg}}</p>
      <iframe [src]="iframeUrl" (load)="checkLogin()"></iframe>
    </div>
    `
})

export class LoginComponent {

  private iframeUrl: SafeResourceUrl;
  private errorMsg: string;
  private isInitialLoad: boolean = true;

  constructor(
    private element: ElementRef,
    private authService: AuthService,
    private sanitationService: DomSanitizationService,
    private router: Router
  ) {
    this.newIframeUrl();
  }

  newIframeUrl() {
    let url = AuthUrls.buildUrl('login');
    this.iframeUrl = this.sanitationService.bypassSecurityTrustResourceUrl(url);
  }

  setAuthToken(token: string) {
    this.authService.setToken(token);
    this.router.navigate(['/']);
  }

  checkLogin() {
    // until the iframe successfully logs in and redirects, we're just going
    // to get errors trying to access the cross-origin frame
    try {
      let query = AuthUrls.parseIframeQuery(this.element);
      if (query) {
        this.setAuthToken(AuthUrls.parseToken(query));
      }
    } catch (e) {
      if (this.isInitialLoad) {
        this.isInitialLoad = false;
      } else {
        this.errorMsg = 'Invalid username or password';

        // TODO: the form has disappeared on POST, so render another one. This
        // causes any field values to disappear, which is not ideal.
        this.isInitialLoad = true;
        this.newIframeUrl();
      }
    }
  }

}
