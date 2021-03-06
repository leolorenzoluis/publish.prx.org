import { cms } from '../../../testing';
import { FeederPodcastModel } from './feeder-podcast.model';

describe('FeederPodcastModel', () => {

  let series = cms.mock('prx:series', {id: 'series1'});
  let dist = series.mock('prx:distributions', {id: 'dist1', kind: 'podcast'});
  let authorDist = series.mock('prx:accounts', {name: 'Foo', email: 'Bar'});

  beforeEach(() => window.localStorage.clear());

  it('decodes itunes categories', () => {
    let doc = dist.mock('some-feeder', {itunesCategories: [
      {name: 'Foo', subcategories: ['some', 'stuff']},
      {name: 'Bar', subcategories: []}
    ]});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('Foo');
    expect(podcast.subCategory).toEqual('some');
  });

  it('handles null subcategories', () => {
    let doc = dist.mock('some-feeder', {itunesCategories: [{name: 'Foo'}]});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('Foo');
    expect(podcast.subCategory).toEqual('');
  });

  it('handles null categories', () => {
    let doc = dist.mock('some-feeder', {});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('');
    expect(podcast.subCategory).toEqual('');
  });

  it('encodes categories', () => {
    let podcast = new FeederPodcastModel(series, dist);
    podcast.category = 'Foo';
    expect(podcast.encode()['itunesCategories']).toEqual([{name: 'Foo', subcategories: []}]);
    podcast.subCategory = 'Bar';
    expect(podcast.encode()['itunesCategories']).toEqual([{name: 'Foo', subcategories: ['Bar']}]);
  });

  it('copies to a different model', () => {
    let src = new FeederPodcastModel(series, dist);
    src.id = 1234;
    src.category = 'src-category';
    let dest = new FeederPodcastModel(series, dist);
    src.swapNew(dest);
    expect(dest.id).not.toEqual(1234);
    expect(dest.category).toEqual('src-category');
  });

  it('allows user to override account name and set author email for podcast', () => {
    let doc = authorDist.mock('some-feeder', {author: {name: 'Foo2', email: 'Bar2'}});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.authorName).toEqual('Foo2');
    expect(podcast.authorEmail).toEqual('Bar2');
  });

  it('ensures URLs have http(s)', () => {
    let podcast = new FeederPodcastModel(series, dist);
    podcast.set('link', 'show.me');
    expect(podcast.link).toEqual('http://show.me');
    podcast.set('publicFeedUrl', 'https://notfeeder.prx.org');
    expect(podcast.publicFeedUrl).toEqual('https://notfeeder.prx.org');
    podcast.set('newFeedUrl', 'htshompson.party');
    expect(podcast.newFeedUrl).toEqual('http://htshompson.party');
    podcast.set('enclosurePrefix', 'redirect.me');
    expect(podcast.enclosurePrefix).toEqual('http://redirect.me');
  });

});
