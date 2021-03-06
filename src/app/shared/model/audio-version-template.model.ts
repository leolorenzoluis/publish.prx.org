import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED, LENGTH, VERSION_LENGTH } from './invalid';
import { AudioFileTemplateModel } from './audio-file-template.model';

export class AudioVersionTemplateModel extends BaseModel {

  public id: number;
  public label: string = null;
  public lengthMinimum: number = null;
  public lengthMaximum: number = null;
  public fileTemplates: AudioFileTemplateModel[];

  SETABLE = ['label', 'lengthMinimum', 'lengthMaximum'];

  VALIDATORS = {
    label: [REQUIRED(), LENGTH(1, 255)],
    lengthMinimum: [VERSION_LENGTH(this)],
    lengthMaximum: [VERSION_LENGTH(this)]
  };

  constructor(series?: HalDoc, versionTemplate?: HalDoc, loadRelated = true) {
    super();
    this.init(series, versionTemplate, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.audio-version-template.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.audio-version-template.new.${this.parent.id}`;
    } else {
      return 'prx.audio-version-template.new.new';
    }
  }

  related() {
    let files: Observable<AudioFileTemplateModel[]>;
    if (this.doc) {
      files = this.doc.followItems('prx:audio-file-templates').map(ftdocs => {
        let saved = ftdocs.map(ft => new AudioFileTemplateModel(this.parent, this.doc, ft));
        let unsaved = this.findUnsavedFiles(saved.length + 1);
        return saved.concat(unsaved);
      });
    } else {
      files = Observable.of(this.findUnsavedFiles(1));
    }
    return {
      fileTemplates: files
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.label = this.doc['label'] || '';
    this.lengthMinimum = this.doc['lengthMinimum'] || null;
    this.lengthMaximum = this.doc['lengthMaximum'] || null;
  }

  encode(): {} {
    let data = <any> {};
    data.label = this.label;
    data.lengthMinimum = this.lengthMinimum || 0;
    data.lengthMaximum = this.lengthMaximum || 0;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:audio-version-templates', {}, data);
  }

  invalid(field?: string | string[]): string {
    if (field === 'lengthAny') {
      return this.invalid('lengthMinimum') || this.invalid('lengthMaximum');
    } else {
      return super.invalid(field);
    }
  }

  findUnsavedFiles(position, found: AudioFileTemplateModel[] = []) {
    let file = new AudioFileTemplateModel(this.parent, this.doc, position);
    if (file.isStored() && !file.isDestroy) {
      found.push(file);
      return this.findUnsavedFiles(position + 1, found);
    } else {
      return found;
    }
  }

}
