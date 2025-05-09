import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
})
export class RoutePage implements OnInit {
  routes: any[] = [];
  selectedDayIndex = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['routes']) {
      this.routes = nav.extras.state['routes'];
    }
  }

  onSegmentChange(event: any) {
    this.selectedDayIndex = parseInt(event.detail.value, 10);
  }
}
