import {Component} from 'angular2/core';
import {RouterLink} from 'angular2/router';

import {CmsService} from '../shared/cms/cms.service';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {ImageLoaderComponent} from '../shared/image/image-loader.component';

@Component({
  directives: [RouterLink, SpinnerComponent, ImageLoaderComponent],
  selector: 'nav-user',
  styleUrls: [
    'app/header/navitem.component.css',
    'app/header/navuser.component.css'
  ],
  template: `
    <div class="nav-holder">
      <template [ngIf]="userName">
        <a *ngIf="!userName" [routerLink]="['Login']">Login</a>
        <a *ngIf="userName">
          <span class="name">{{userName}}</span>
          <image-loader [src]="userImage"></image-loader>
        </a>
      </template>
      <div *ngIf="!userName" class="spin-holder">
        <spinner inverse=true></spinner>
      </div>
    </div>
    `
})

export class NavUserComponent {

  private userName: string;
  private userImage: string;

  constructor(private cmsService: CmsService) {
    this.cmsService.follows('prx:authorization', 'prx:default-account').subscribe((doc) => {
      this.userName = doc['name'];
    });
    this.cmsService.follows('prx:authorization', 'prx:default-account', 'prx:image').subscribe((doc) => {
      this.userImage = doc.link('enclosure');
    }, (err) => {
      this.userImage = null;
    });
  }

}
