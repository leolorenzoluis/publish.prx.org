import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsService, HalDoc } from '../core';
import { StoryModel, SeriesModel } from '../shared';

@Component({
  selector: 'publish-search',
  styleUrls: ['search.component.css'],
  templateUrl: 'search.component.html'
})

export class SearchComponent implements OnInit {

  static TAB_STORIES = 'stories';
  static TAB_SERIES = 'series';
  selectedTab: string;

  isLoaded = false;
  totalCount: number;
  pages: number[];
  noResults: boolean;
  auth: HalDoc;
  storiesResults: StoryModel[];
  seriesResults: SeriesModel[];
  loaders: boolean[];

  currentPage: number;
  showNumPages: number = 10;
  pagesBegin: number;
  pagesEnd: number;

  searchTextParam: string;
  searchGenreParam: string;
  searchSubGenreParam: string;
  searchSeriesIdParam: number;
  searchSeriesParam: SeriesModel;
  searchOrderByParam: string = 'updated_at';
  searchOrderDescParam: boolean = true;
  allSeriesIds: number[];
  allSeries: any;

  orderByOptionsStories: any[] = [
    {
      id: 'title',
      name: 'Story Title'
    },
    {
      id: 'updated_at',
      name: 'Last Updated'
    },
    {
      id: 'published_at',
      name: 'When Published'
    }
  ];

  orderByOptionsSeries: any[] = [
    {
      id: 'title',
      name: 'Series Title'
    },
    {
      id: 'updated_at',
      name: 'Last Updated'
    }
  ];

  constructor(private cms: CmsService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.forEach((params) => {
      this.selectedTab = params['tab'] || SearchComponent.TAB_STORIES;
      this.searchSeriesIdParam = +params['seriesId'];

      this.cms.follow('prx:authorization').subscribe((auth) => {
        this.auth = auth;
        if (this.selectedTab === SearchComponent.TAB_STORIES) {
          this.initStorySearch();
        } else {
          this.initSeriesSearch();
        }
      });
    });
  }

  initStorySearch() {
    this.allSeriesIds = [-1];
    this.allSeries = {};
    this.auth.followItems('prx:series', {filters: 'v4'}).subscribe((series) => {
      for (let s of <HalDoc[]> series) {
        this.allSeriesIds.push(s.id);
        this.allSeries[s.id] = new SeriesModel(this.auth, s, false);
      }

      this.searchTextParam = '';
      this.searchSeriesParam = null;
      this.currentPage = 1;
      if (this.searchSeriesIdParam) {
        this.searchStoriesBySeries(this.searchSeriesIdParam);
      } else {
        this.searchStories(1);
      }
    });
  }

  initSeriesSearch() {
    this.searchSeries(1);
  }

  searchByText(text: string) {
    this.searchTextParam = text;
    this.search(1);
  }

  searchByOrder(order: any) {
    this.searchOrderByParam = order.orderBy;
    this.searchOrderDescParam = order.desc;
    this.search(1);
  }

  searchStoriesBySeries(searchSeriesId: number) {
    this.searchSeriesIdParam = searchSeriesId;
    this.searchSeriesParam = this.allSeries[this.searchSeriesIdParam];
    this.searchStories(1);
  }

  searchSeriesByGenre(genre: any) {
    this.searchGenreParam = genre.genre;
    this.searchSubGenreParam = genre.subgenre;
    this.searchSeries(1);
  }

  search(page: number, per: number = undefined) {
    if (this.isOnSeriesTab()) {
      this.searchSeries(page, per);
    } else if (this.isOnStoriesTab) {
      this.searchStories(page, per);
    }
  }

  searchStories(page: number, per = 12) {
    this.currentPage = page;
    this.isLoaded = false;
    this.noResults = false;

    let parent = this.searchSeriesParam ? this.searchSeriesParam.doc : this.auth;

    let filters = ['v4'];
    if (+this.searchSeriesIdParam === -1) {
      filters.push('noseries');
    }
    if (this.searchTextParam) {
      filters.push('text=' + this.searchTextParam);
    }
    let sorts;
    if (this.searchOrderByParam) {
      sorts = this.searchOrderByParam + ':';
      sorts += this.searchOrderDescParam ? 'desc' : 'asc';
      if (this.searchOrderByParam === 'published_at') {
        sorts += 'updated_at:';
        sorts += this.searchOrderDescParam ? 'desc' : 'asc';
      }
    }
    let params = {page: this.currentPage, per, filters: filters.join(','), sorts};

    let storiesCount = parent.count('prx:stories') || 0; // wrong, doesn't account for filter. looks obvs wrong with No Series filter
    if (storiesCount > 0) {
      this.loaders = Array(storiesCount);
      parent.followItems('prx:stories', params).subscribe((stories) => {
        this.loaders = null;
        this.storiesResults = [];
        let storiesById = {};
        let storyIds = stories.map((doc) => {
          storiesById[doc.id] = new StoryModel(parent, doc, false);
          if (doc.has('prx:series')) {
            doc.follow('prx:series').subscribe((series) => {
              storiesById[doc.id].parent = series;
            });
          }
          return doc.id;
        });
        if (stories.length === 0) {
          this.noResults = true;
          this.totalCount = 0;
        } else {
          this.totalCount = stories[0].total();
          this.storiesResults = storyIds.map(storyId => storiesById[storyId]);
        }
        this.pagingInfo(per);
        this.isLoaded = true;
      });
    } else {
      this.noResults = true;
      this.isLoaded = true;
      this.totalCount = 0;
      this.pagingInfo(per);
    }
  }

  searchSeries(page: number, per = 10) {
    this.currentPage = page;
    this.isLoaded = false;
    this.noResults = false;

    let filters = ['v4'];
    if (this.searchTextParam) {
      filters.push('text=' + this.searchTextParam);
    }
    let sorts;
    if (this.searchOrderByParam) {
      sorts = this.searchOrderByParam + ':';
      sorts += this.searchOrderDescParam ? 'desc' : 'asc';
    }
    let params = {page: this.currentPage, per, filters: filters.join(','), sorts};
    let seriesCount = this.auth.count('prx:series') || 0;
    if (seriesCount > 0) {
      this.loaders = Array(seriesCount);
      this.auth.followItems('prx:series', params).subscribe((seriesResults) => {
        this.seriesResults = [];
        this.loaders = null;
        let seriesDocs = <HalDoc[]> seriesResults;
        for (let doc of seriesDocs) {
          this.seriesResults.push(new SeriesModel(this.auth, doc, false));
        }
        if (seriesDocs.length === 0) {
          this.noResults = true;
          this.totalCount = 0;
        } else {
          this.totalCount = seriesDocs[0].total();
        }
        this.pagingInfo(per);
        this.isLoaded = true;
      });
    } else {
      this.noResults = true;
      this.isLoaded = true;
      this.totalCount = 0;
    }
  }

  pagingInfo(per) {
    let totalPages = this.totalCount % per ? Math.floor(this.totalCount) / per + 1 : Math.floor(this.totalCount / per);
    this.pages = Array.apply(null, {length: totalPages}).map((val, i) => i + 1);
    this.pagesBegin = this.showNumPages * Math.floor((this.currentPage - 1) / this.showNumPages);
    this.pagesEnd = this.showNumPages * Math.ceil(this.currentPage / this.showNumPages);
  }

  searchStoriesTab() {
    this.searchTextParam = undefined;
    this.seriesResults.length = 0;
    this.totalCount = 0;
    this.searchOrderByParam = 'updated_at';
    this.searchOrderDescParam = true;
    this.router.navigate(['search', { tab: SearchComponent.TAB_STORIES}]);
  }

  searchSeriesTab() {
    this.searchTextParam = undefined;
    this.storiesResults.length = 0;
    this.totalCount = 0;
    this.searchOrderByParam = 'updated_at';
    this.searchOrderDescParam = true;
    this.router.navigate(['search', { tab: SearchComponent.TAB_SERIES}]);
  }

  isOnSeriesTab() {
    return this.selectedTab === SearchComponent.TAB_SERIES;
  }

  isOnStoriesTab() {
    return this.selectedTab === SearchComponent.TAB_STORIES;
  }
}
