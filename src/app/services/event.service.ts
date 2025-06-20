import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private refreshHomePageSubject = new Subject<void>();
  refreshHomePage$ = this.refreshHomePageSubject.asObservable();

  triggerRefreshHome() {
    this.refreshHomePageSubject.next();
  }
}
