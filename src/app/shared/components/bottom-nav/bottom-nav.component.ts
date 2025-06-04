import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent {
  constructor(private router: Router) {}

 isActive(route: string): boolean {
  const current = this.router.url.replace('/content/', '').split('?')[0];
  return current === route.replace('/', '');
}


  navigate(route: string): void {
    const cleanedRoute = route.startsWith('/') ? route.slice(1) : route;
    this.router.navigate(['/content', cleanedRoute]);
  }
}