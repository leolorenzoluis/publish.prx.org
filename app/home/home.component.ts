import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {CmsService} from '../shared/cms/cms.service';

@Component({
  directives: [SpinnerComponent, ROUTER_DIRECTIVES],
  selector: 'publish-home',
  styleUrls: ['app/home/home.component.css'],
  template: `
    <div class="main">
      <section>
        <spinner *ngIf="!accounts"></spinner>
        <div *ngIf="accounts">
          <h1>Your Accounts</h1>
          <div *ngFor="let account of accounts; let i = index">
            <h2>{{account.name}} <i>{{account.type}}</i></h2>
            <ul>
              <li *ngFor="let story of accountStories[i]">
                <a [routerLink]="['/edit', story.id]">
                  <p *ngIf="story.title">{{story.title}}</p>
                  <p *ngIf="!story.title">Untitled #{{story.id}}</p>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
    `
})

export class HomeComponent {

  accounts: any[];
  accountStories: any[] = [];

  constructor(private cms: CmsService) {
    cms.follow('prx:authorization').followItems('prx:accounts').subscribe((docs) => {
      this.accounts = docs;
      for (let i = 0; i < docs.length; i++) {
        docs[i].followItems('prx:stories').subscribe((storyDocs) => {
          this.accountStories[i] = storyDocs;
        });
      }
    });
  }

}
