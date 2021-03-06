import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ImageModel, StoryModel, SeriesModel } from '../../model';
import { UploadService } from '../../../core';

@Component({
  selector: 'publish-image-file',
  styleUrls: ['image-file.component.css'],
  template: `
    <div *ngIf="!image.isDestroy" class="image-file" [class.canceled]="canceled">
      <div class="thumbnail" [class.changed]="image.isNew || image.changed('purpose')"
        [style.width]="thumbnailWidth" [style.height]="thumbnailHeight">

        <div *ngIf="canceled && image.isUploading" class="uploading errored">
          <p *ngIf="image.isUploading">Upload Canceled</p>
          <p *ngIf="!image.isUploading">File Deleted</p>
        </div>

        <div *ngIf="!canceled && image.isUploadError" class="uploading errored">
          <p>Upload Error</p>
          <div *ngIf="image.upload" class="retry">
            <a class="icon-cw" href="" (click)="onRetry($event)">Try Again</a>
          </div>
        </div>

        <div *ngIf="!canceled && image.isUploading && !image.isUploadError" class="uploading">
          <p>Uploading</p>
          <div class="meter"><span [style.width.%]="image.progress * 100"></span></div>
        </div>

        <publish-image *ngIf="!image.isUploading" [src]="image.enclosureHref">
        </publish-image>

        <div *ngIf="!canceled" class="cancel">
          <i class="icon-cancel" (click)="onCancel($event)"></i>
        </div>

        <div *ngIf="!canceled && image.isProcessing" class="processing">
          <p>Processing</p>
          <div class="meter"><span [style.width.%]="image.progress * 100"></span></div>
        </div>

        <div *ngIf="!canceled && image.isProcessError" class="processing errored">
          <p>{{image.isProcessError}}</p>
          <div class="retry">
            <a class="icon-cw" href="" (click)="onRetry($event)">Try Again</a>
          </div>
        </div>

      </div>

      <div *ngIf="canceled && !image.isUploading" class="info" [style.width]="thumbnailWidth" [style.height]="thumbnailHeight">
        <p *ngIf="image.isUploading">Upload Canceled</p>
        <p *ngIf="!image.isUploading">File Deleted</p>
      </div>

      <div *ngIf="!canceled" class="info">
        <publish-fancy-field [model]="image" textinput="true" name="caption" label="Caption" small="true"></publish-fancy-field>
        <publish-fancy-field [model]="image" textinput="true" name="credit" label="Credit" small="true"></publish-fancy-field>
      </div>

    </div>
  `
})

export class ImageFileComponent implements OnInit, OnDestroy {

  canceled: boolean;

  @Input() delay = 1000;
  @Input() model: StoryModel|SeriesModel;
  @Input() image: ImageModel;
  @Input() thumbnailWidth: string;
  @Input() thumbnailHeight: string;

  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    if (this.image && this.image.uuid) {
      let upload = this.uploadService.find(this.image.uuid);
      if (upload) {
        this.image.watchUpload(upload, false);
      }
    }
  }

  ngOnDestroy() {
    if (this.image) {
      this.image.unsubscribe();
    }
  }

  onCancel(event: Event) {
    event.preventDefault();

    // wait for fade-out before parent removes this component
    this.canceled = true;
    setTimeout(() => {
      this.image.destroy();
      this.model.removeImage(this.image);
      this.canceled = false;
    }, this.delay);
  }

  onRetry(event: Event) {
    event.preventDefault();
    if (this.image.isUploading) {
      this.image.retryUpload();
    } else {
      this.image.retryProcessing();
    }
  }

}
