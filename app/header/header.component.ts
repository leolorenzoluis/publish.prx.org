import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

@Component({
  directives: [ROUTER_DIRECTIVES],
  selector: 'publish-header',
  styleUrls: ['app/header/header.component.css'],
  template: `
    <header>
      <div class="contents">
        <prx-drawer-button></prx-drawer-button>
        <h1><a [routerLink]="['/']">PRX</a></h1>
        <nav>
          <ng-content></ng-content>
        </nav>
      </div>
    </header>
    `
})

export class HeaderComponent {}
