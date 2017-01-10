import { Component, OnDestroy, DoCheck } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, DistributionModel, FeederPodcastModel, AudioVersionTemplateModel,
  TabService, CATEGORIES, SUBCATEGORIES } from '../../shared';

@Component({
  styleUrls: ['series-podcast.component.css'],
  templateUrl: 'series-podcast.component.html'
})

export class SeriesPodcastComponent implements OnDestroy, DoCheck {

  categories = [''].concat(CATEGORIES);
  subCategories: string[] = [];
  explicitOpts = ['', 'Explicit', 'Clean'];
  itunesRequirementsDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc1723472cb';
  itunesExplicitDoc = 'https://support.apple.com/en-us/HT202005';

  tabSub: Subscription;
  state: string;
  series: SeriesModel;
  templateSub: Subscription;
  podcastTemplate: AudioVersionTemplateModel;
  distribution: DistributionModel;
  podcast: FeederPodcastModel;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe(s => {
      this.series = <SeriesModel> s;
      this.templateSub = this.series.loadRelated('versionTemplates').subscribe(() => {
        if (this.series.versionTemplates && this.series.versionTemplates.length > 0) {
          // Later we may allow the user to choose which template, but for now they only get one.
          this.podcastTemplate = this.series.versionTemplates[0];
        }
      });
    });
  }

  ngDoCheck() {
    // manually check for distribution/podcast changes
    if (this.series && this.series.distributions) {
      let dist = this.series.distributions.find(d => d.kind === 'podcast');
      if (this.distribution !== dist) {
        this.distribution = dist;
        this.loadPodcast();
      }
    }
    if (this.distribution && this.distribution.podcast && this.podcast !== this.distribution.podcast) {
      this.setPodcast();
    }

    // display state
    if (this.distribution) {
      this.state = 'editing';
    } else if (this.series && this.series.isNew) {
      this.state = 'new';
    } else if (this.series) {
      this.state = 'creating';
      if (!this.podcastTemplate) {
        this.state = 'missing';
      }
    } else {
      this.state = null;
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
    if (this.templateSub) {
      this.templateSub.unsubscribe();
    }
  }

  loadPodcast() {
    this.podcast = null;
    if (this.distribution) {
      this.distribution.loadExternal().subscribe(() => this.setPodcast);
    }
  }

  setPodcast() {
    this.podcast = this.distribution.podcast;
    this.setSubCategories();
  }

  createDistribution() {
    let podcastDist = new DistributionModel({series: this.series.doc, template: this.podcastTemplate.doc});
    podcastDist.set('kind', 'podcast');
    this.series.distributions.push(podcastDist);
  }

  setSubCategories() {
    if (this.podcast && this.podcast.category) {
      if (SUBCATEGORIES[this.podcast.category]) {
        this.subCategories = [''].concat(SUBCATEGORIES[this.podcast.category]);
      } else {
        this.subCategories = [];
      }
    } else {
      this.subCategories = [];
    }
    if (this.podcast && this.subCategories.indexOf(this.podcast.subCategory) < 0) {
      this.podcast.set('subCategory', '');
    }
  }

}
