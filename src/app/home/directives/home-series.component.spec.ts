import { cit, create, cms, stubPipe } from '../../../testing';
import { MockHalDoc } from '../../../testing/mock.haldoc';
import { HomeSeriesComponent } from './home-series.component';


describe('HomeSeriesComponent', () => {

  create(HomeSeriesComponent, false);

  stubPipe('timeago');
  stubPipe('capitalize');

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:default-account', {});
    auth.mock('prx:series', {});
    auth.mockItems('prx:stories', []);
  });

  cit('displays standalone stories', (fix, el, comp) => {
    comp.noseries = true;
    comp.auth = auth;
    fix.detectChanges();
    expect(el).toContainText('Your Standalone Episodes');
  });

  cit('provides a link to the series', (fix, el, comp) => {
    comp.noseries = false;
    comp.series = new MockHalDoc({id: 99});
    comp.series.mockItems('prx:stories', []);
    comp.series.count = () => 1;
    comp.rows = 2;
    fix.detectChanges();
    expect(el).toQueryAttr('a', 'href', 'series/99');
    expect(el).toQueryAttr('h1 a', 'href', 'series/99');
  });

  cit('provides a link to view all stories in a series', (fix, el, comp) => {
    comp.noseries = false;
    comp.series = new MockHalDoc({id: 99});
    comp.series.mockItems('prx:stories', []);
    comp.series.count = () => 1;
    comp.rows = 2;
    fix.detectChanges();
    expect(el).toQueryAttr('p.count a', 'href', 'search;tab=stories;seriesId=99');
  });

});
