import {Component, Input, OnInit, OnDestroy} from 'angular2/core';
import {Subscription} from 'rxjs';
import {Dragula, DragulaService} from 'ng2-dragula/ng2-dragula';

import {AudioVersionModel} from '../../storyedit/models/audio-version.model';
import {UploadService} from '../services/upload.service';
import {UploadFileSelect} from './upload-file-select.directive';
import {AudioFileComponent} from './audio-file.component';

@Component({
  directives: [UploadFileSelect, AudioFileComponent, Dragula],
  selector: 'audio-version',
  styleUrls: ['app/upload/directives/audio-version.component.css'],
  template: `
    <template [ngIf]="DESCRIPTIONS[version.label]">
      <header>
        <strong>{{version.label}}</strong>
        <span>{{DESCRIPTIONS[version.label]}}</span>
      </header>
      <section [dragula]="id">
        <audio-file *ngFor="#file of version.files"
          [audio]="file"></audio-file>
        <div *ngIf="version.files && !version.files.length" class="empty">
          <h4>Upload a file to get started</h4>
        </div>
      </section>
      <footer>
        <input type="file" id="file" upload-file (file)="addUpload($event)"/>
        <label class="button" for="file">Upload Files</label>
      </footer>
    </template>
  `,
  viewProviders: [DragulaService]
})

export class AudioVersionComponent implements OnInit, OnDestroy {

  DESCRIPTIONS = {
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy'
  };

  @Input() version: AudioVersionModel;

  private dragSubscription: Subscription;

  constructor(
    private uploadService: UploadService,
    private dragulaService: DragulaService
  ) {}

  get id(): any {
    return this.version ? ('version-' + this.version['id']) : 'version-new';
  }

  ngOnInit() {
    this.initDragula();

    // in-progress uploads
    for (let uuid of this.version.uploadUuids) {
      let upload = this.uploadService.find(uuid);
      if (upload) {
        this.version.watchUpload(upload);
      }
    }
  }

  addUpload(file: File) {
    let upload = this.uploadService.add(file);
    this.version.addUpload(upload);
  }

  ngOnDestroy() {
    this.dragSubscription.unsubscribe();

    // stop watching progress
    for (let file of this.version.files) {
      file.unsubscribe();
    }
  }

  private initDragula() {
    this.dragulaService.setOptions(this.id, {
      moves: function (el: Element, source: Element, handle: Element) {
        return handle.classList.contains('drag-handle');
      }
    });
    this.dragSubscription = this.dragulaService.dropModel.subscribe((args: any[]) => {
      let i = 0, el = args[1];
      while (el.previousElementSibling) { i++; el = el.previousElementSibling; }
      console.log('TODO: changePosition'); // , this.audios[i].filename, i + 1);
    });
  }

}
