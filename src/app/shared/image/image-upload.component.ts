import { Component, Input } from '@angular/core';
import { UploadService } from '../../core';
import { ImageModel, StoryModel, SeriesModel } from '../model';

@Component({
  selector: 'publish-image-upload',
  styleUrls: ['image-upload.component.css'],
  template: `
    <publish-spinner *ngIf="model && !model?.images"></publish-spinner>

    <div *ngIf="noImages" class="new-image" [class.changed]="model.changed('images')" [style.width]="thumbnailWidth" [style.height]="thumbnailHeight">
      <p class="size">{{minWidth}}x{{minHeight}} px</p>
      <input type="file" id="image-file" publishFileSelect (file)="addUpload($event)" ngClass="{'invalid': this.imgError}"/>
      <label class="button" for="image-file">Add Image</label>
    </div>
    <p *ngIf="imgError" class="error">{{imgError}}</p>

    <div *ngIf="model && model.images">
      <publish-image-file *ngFor="let i of model.images" [image]="i" [thumbnailWidth]="thumbnailWidth" [thumbnailHeight]="thumbnailHeight"></publish-image-file>
    </div>
  `
})
export class ImageUploadComponent {

  @Input() model: StoryModel|SeriesModel;
  @Input() minWidth = 200;
  @Input() minHeight = 200;

  private thumbnailHeight = '200px';
  private imgError: string;
  reader: FileReader = new FileReader();

  constructor(private uploadService: UploadService) {}

  get noImages(): boolean {
    if (this.model && this.model.images) {
      if (this.model.images.length === 0) {
        return true;
      } else if (this.model.images.every(img => img.isDestroy)) {
        return true;
      }
    }
    return false;
  }

  get thumbnailWidth(): string {
    let width = '200px';
    if (this.minWidth !== this.minHeight) {
      width = `${200 * this.minWidth/this.minHeight}px`;
    }
    return width;
  }

  addUpload(file: File) {
    this.reader.onloadstart = () => {
      this.imgError = '';
    };

    this.reader.onerror = () => {
      this.imgError = 'Error uploading image';
    };

    this.reader.onloadend = () => {
      let img = new Image();
      img.src = this.reader.result;
      if (img.width < this.minWidth || img.height < this.minHeight) {
        this.imgError = `The image provided is only ${img.width}x${img.height} px but should be at least ${this.minWidth}x${this.minHeight} px`;
      } else {
        let upload = this.uploadService.add(file);
        this.model.images.push(new ImageModel(this.model.parent, this.model.doc, upload));
      }
    };

    this.reader.readAsDataURL(file);
  }
}
