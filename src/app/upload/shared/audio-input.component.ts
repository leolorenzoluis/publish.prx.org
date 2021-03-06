import { Component, Input, ElementRef } from '@angular/core';
import { PlayerService, UUID, UploadService } from '../../core';
import { AudioVersionModel } from '../../shared';

@Component({
  selector: 'publish-audio-input',
  styleUrls: ['audio-input.component.css'],
  template: `
    <input type="file" accept="audio/mpeg" publishFileSelect [id]="uuid"
      [attr.multiple]="multiple" (file)="addFile($event)"/>
    <label *ngIf="multiple" class="button" [htmlFor]="uuid">Upload Files</label>
    <label *ngIf="!multiple" class="button" [htmlFor]="uuid">Upload File</label>
  `
})

export class AudioInputComponent {

  @Input() multiple = null;
  @Input() version: AudioVersionModel;
  @Input() position: number;

  uuid: string;

  constructor(
    private el: ElementRef,
    private player: PlayerService,
    private uploadService: UploadService
  ) {
    this.uuid = UUID.UUID();
  }

  click() {
    this.el.nativeElement.getElementsByTagName('input')[0].click();
  }

  addFile(file: File) {
    this.player.checkFile(file).subscribe(data => {
      let upload = this.uploadService.add(file);
      let audio = this.version.addUpload(upload, this.position);
      audio.set('format', data.format);
      audio.set('duration', Math.round(data.duration / 1000));
      audio.set('bitrate', data.bitrate);
      audio.set('frequency', data.frequency);
    });
  }

}
