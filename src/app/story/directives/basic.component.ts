import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: ['basic.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field [model]="story" textinput="true" name="title" label="Story Title" tiptext="This will show up in the \'Name\' column on iTunes." required>
        <div class="fancy-hint">Write a short, Tweetable title like a newspaper headline.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textinput="true" name="shortDescription" label="Teaser" required>
        <div class="fancy-hint">A first impression; think of this as the single-item lead of a piece.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textarea="true" name="description" label="Description" tiptext="This will show up in the \'Description\' column on iTunes.">
        <div class="fancy-hint">A full description of your piece including keywords, names
          of interviewees, places and topics.</div>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field label="Audio Files" required>
        <publish-spinner *ngIf="!story?.versions"></publish-spinner>
        <publish-upload *ngFor="let v of story?.versions" [version]="v"></publish-upload>
        <h1 *ngIf="story?.versions?.length === 0">
          You have no audio versions for this story. How did that happen?
        </h1>
      </publish-fancy-field>

      <publish-fancy-field label="Cover Image" required>
        <publish-image-upload [model]="story" minWidth=1400 minHeight=1400 ></publish-image-upload>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field [model]="story" textinput="true" name="tags" label="Categories" tiptext="These will be used to help listeners discover your story." >
        <div class="fancy-hint">A comma-separated list of tags relevant to your story.</div>
      </publish-fancy-field>

    </form>
  `
})

export class BasicComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.story = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
