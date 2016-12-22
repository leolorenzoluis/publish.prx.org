import { Component, Input, OnInit } from '@angular/core';

import { HalDoc } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-card',
  styleUrls: ['story-card.component.css'],
  template: `
    <section class="story-image">
      <publish-image [imageDoc]="story.doc"></publish-image>
      <p *ngIf="statusClass" [class]="statusClass">{{statusText}}</p>
    </section>
    <section class="story-detail">
      <publish-text-overflow-fade numLines="2" lineHeight="20" unit="px">
        <h2 class="story-title"><a [routerLink]="editStoryLink">{{storyTitle}}</a></h2>
      </publish-text-overflow-fade>  

      <publish-text-overflow-fade numLines="2" lineHeight="20" unit="px">
        <h3 class="series-title">{{seriesTitle}}</h3>
      </publish-text-overflow-fade>

      <section class="story-info">
        <span class="duration">{{storyDuration | duration}}</span>
        <span *ngIf="storyAudioTotal" class="audio-total"><i class="icon-up-dir"></i>{{storyAudioTotal}}</span>
        <span class="modified">{{storyUpdated | date:"MM/dd/yy"}}</span>
      </section>
    </section>
    <publish-text-overflow-fade numLines="1" lineHeight="20" unit="px" class="outer">
      <section class="story-tags">
        <span *ngFor="let tag of storyTags">{{tag}}</span>
      </section>
    </publish-text-overflow-fade>
    <section class="story-description">
      <publish-text-overflow-fade [numLines]="storyTags.length > 0 ? 2 : 3" lineHeight="20" unit="px">
        <span title="{{storyDescription}}">{{storyDescription}}</span>
      </publish-text-overflow-fade>
    </section>
  `
})

export class StoryCardComponent implements OnInit {

  @Input() story: StoryModel;

  editStoryLink: any[];
  seriesLink: any[];

  storyId: number;
  storyTitle: string;
  storyDuration: number;
  storyAudioTotal: number;
  storyUpdated: Date;
  storyDescription: string;
  storyTags: string[];
  seriesTitle: string;

  statusClass: string;
  statusText: string;

  ngOnInit() {
    this.storyId = this.story.id;
    this.storyTitle = this.story.title;
    this.storyUpdated = this.story.lastStored || this.story.updatedAt;
    this.storyDescription = this.story.shortDescription;
    this.storyTags = this.story.splitTags();

    this.editStoryLink = ['/story', this.story.id];

    if (this.story.doc.has('prx:audio')) {
      this.story.doc.followItems('prx:audio').subscribe((audios) => {
        let audiosDocs = <HalDoc[]> audios;
        if (!audios || audios.length < 1) {
          this.storyDuration = 0;
        } else {
          this.storyAudioTotal = audiosDocs[0].total();
          this.storyDuration = audios.map((audio) => {
            return audio['duration'] || 0;
          }).reduce((prevDuration, currDuration) => {
            return prevDuration + currDuration;
          });
        }
      });
    } else {
      this.storyDuration = 0;
    }

    if (this.story.parent) {
      this.seriesTitle = this.story.parent['title'];
    } else {
      this.seriesTitle = this.story.account['name'] || '(Unnamed Account)';
    }

    if (!this.story.publishedAt) {
      this.statusClass = 'status unpublished';
      this.statusText = 'Private';
    }
  }

}
