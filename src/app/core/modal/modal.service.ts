import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Observer } from 'rxjs';

export interface ModalState {
  hide: boolean;
  title: string;
  body: string;
  buttons: string[];
  buttonCallback: Function;
  height: number;
  width: number;
}

@Injectable()
export class ModalService {

  public state: Observable<ModalState>;
  private observer: Observer<ModalState>;

  constructor(private sanitizer: DomSanitizer) {
    this.state = Observable.create((observer: Observer<ModalState>) => {
      this.observer = observer;
    });
  }

  alert(title: string, body?: string, callback?: Function) {
    body = body ? `<p>${body}</p>` : undefined;
    if (callback) {
      this.emit({title: title, body: body, buttons: ['Okay'], buttonCallback: callback});
    } else {
      this.emit({title: title, body: body});
    }
  }

  prompt(title: string, message: string, callback: Function, buttons = ['Okay', 'Cancel']) {
    this.emit({
      title: title,
      body: message ? `<p>${message}</p>` : undefined,
      buttons,
      buttonCallback: (label: string) => {
        if (callback) { callback(buttons.length > 0 && label === buttons[0]); }
      }
    });
  }

  show(options: any) {
    this.emit(<ModalState> options);
  }

  hide() {
    this.emit({hide: true});
  }

  private emit(data: {}) {
    data['hide'] = (data['hide'] === undefined) ? false : true;
    if (data['body']) {
      data['body'] = this.sanitizer.bypassSecurityTrustHtml(data['body']);
    }
    this.observer.next(<ModalState> data);
  }

}
