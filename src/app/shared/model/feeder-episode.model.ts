import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED } from './invalid';

export class FeederEpisodeModel extends BaseModel {

  // read-only
  id: string;
  publishedUrl: string;

  // writeable
  SETABLE = ['guid', 'authorName', 'authorEmail'];
  guid: string = '';
  authorName: string = '';
  authorEmail: string = '';

  VALIDATORS = {
    guid: [REQUIRED()]
  };

  constructor(private series: HalDoc, distrib: HalDoc, episode?: HalDoc, loadRelated = true) {
    super();
    this.VALIDATORS.guid = this.VALIDATORS.guid.map(validator => {
      return (key: string, value: any) => {
        return this.isNew ? null : validator(key, value);
      };
    });
    this.init(distrib, episode, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.episode.${this.doc.id}`;
    } else if (this.series) {
      return `prx.episode.new.${this.series.id}`;
    } else {
      throw new Error('Cannot have a feeder episode outside of a series');
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = '' + (this.doc['id'] || '');
    this.guid = this.doc['guid'] || '';
    let author = this.doc['author'] || {};
    this.authorName = author['name'] || '';
    this.authorEmail = author['email'] || '';
  }

  encode(): {} {
    let data = <any> {};
    data.guid = this.guid || null;
    if (this.authorName || this.authorEmail) {
      data.author = {};
      if (this.authorName) { data.author.name = this.authorName; }
      if (this.authorEmail) { data.author.email = this.authorEmail; }
    } else {
      data.author = null;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return Observable.throw(new Error('Cannot directly create a feeder episode'));
  }

  swapNew(newModel: FeederEpisodeModel) {
    for (let fld of this.SETABLE) {
      newModel.set(fld, this[fld]);
    }
  }

}