import {Observable} from 'rxjs/Observable';
import {HalRemote} from './halremote';

// Bring observables up to snuff
export interface HalObservable<T> extends Observable<T> {
  follow(rel: string): HalObservable<T>;
  followList(rel: string): HalObservable<T[]>;
  followItems(rel: string): HalObservable<T[]>;
}
Observable.prototype['follow'] = function(rel: string) {
  return this.flatMap((doc: HalDoc) => {
    return doc.follow(rel);
  });
};
Observable.prototype['followList'] = function(rel: string) {
  return this.flatMap((doc: HalDoc) => {
    return doc.followList(rel);
  });
};
Observable.prototype['followItems'] = function(rel: string) {
  return this.flatMap((doc: HalDoc) => {
    return doc.followItems(rel);
  });
};

/*
 * Generic class for interacting with HAL api
 */
export class HalDoc {

  constructor(data: any = {}, protected remote: HalRemote) {
    Object.keys(data).forEach((key) => { this[key] = data[key]; });
  }

  save(data: any): HalObservable<HalDoc> {
    console.log('TODO put', data);
    return null;
  }

  create(rel: string, params: any = {}, data: any): HalObservable<HalDoc> {
    let link = this['_link'] ? this['_links'][rel] : null;
    if (!link) {
      return <HalObservable<HalDoc>> this.error(`Expected create link at _links.${rel} - got null`);
    } else if (link instanceof Array) {
      return <HalObservable<HalDoc>>
        this.error(`Expected create link at _links.${rel} - got array`);
    } else {
      return <HalObservable<HalDoc>> this.remote.post(link, params, data).map((obj) => {
        return new HalDoc(obj, this.remote);
      });
    }
  }

  destroy(): HalObservable<HalDoc> {
    return null;
  }

  expand(rel: string, params: any = {}): string {
    let link = this['_links'] ? this['_links'][rel] : null;
    if (link && link instanceof Array) {
      link = link[0];
    }
    return this.remote.expand(link, params);
  }

  followLink(linkObj: any, params: any = {}): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.remote.get(linkObj, params).map((obj) => {
      return new HalDoc(obj, this.remote);
    });
  }

  follow(rel: string, params: {} = null): HalObservable<HalDoc> {
    if (!params && this['_embedded'] && this['_embedded'][rel]) {
      return <HalObservable<HalDoc>> this.embedOne(rel);
    } else if (this['_links'] && this['_links'][rel]) {
      return <HalObservable<HalDoc>> this.linkOne(rel, params);
    } else {
      return <HalObservable<HalDoc>> this.error(`Unable to find rel ${rel}`);
    }
  }

  followList(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    if (!params && this['_embedded'] && this['_embedded'][rel]) {
      return <HalObservable<HalDoc[]>> this.embedList(rel);
    } else if (this['_links'] && this['_links'][rel]) {
      return <HalObservable<HalDoc[]>> this.linkList(rel);
    } else {
      return <HalObservable<HalDoc[]>> this.error(`Unable to find rel ${rel}`);
    }
  }

  followItems(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return <HalObservable<HalDoc[]>> this.follow(rel, params).flatMap((doc) => {
      return doc.followList('prx:items');
    });
  }

  protected error(msg: string): Observable<any> {
    console.error(msg);
    return Observable.throw(new Error(msg));
  }

  private embedOne(rel: string): Observable<HalDoc> {
    if (this['_embedded'][rel] instanceof Array) {
      return this.error(`Expected object at _embedded.${rel} - got list`);
    } else {
      return Observable.of(new HalDoc(this['_embedded'][rel], this.remote));
    }
  }

  private linkOne(rel: string, params: {} = null): Observable<HalDoc> {
    if (this['_links'][rel] instanceof Array) {
      return this.error(`Expected object at _links.${rel} - got list`);
    } else {
      return this.followLink(this['_links'][rel], params);
    }
  }

  private embedList(rel: string): Observable<HalDoc[]> {
    if (this['_embedded'][rel] instanceof Array) {
      return Observable.of(this['_embedded'][rel].map((data: any) => {
        return new HalDoc(data, this.remote);
      }));
    } else {
      return this.error(`Expected array at _embedded.${rel} - got object`);
    }
  }

  private linkList(rel: string, params: {} = null): Observable<HalDoc[]> {
    if (this['_links'][rel] instanceof Array) {
      return Observable.fromArray(this['_links'][rel].map((link: any) => {
        return this.followLink(link, params);
      })).concatAll().toArray();
    } else {
      return this.error(`Expected array at _links.${rel} - got object`);
    }
  }

}
