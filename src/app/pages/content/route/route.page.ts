import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var google: any; // Google Maps global objesi

@Component({
  selector: 'app-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
})
export class RoutePage implements OnInit {
  routes: any[] = [];
  selectedDayIndex = 0;
  map: any;
  markers: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['routes']) {
      this.routes = nav.extras.state['routes'];
    }

  this.loadGoogleMapsScript().then(() => {
    this.loadMap();
  }).catch(err => {
    console.error('Google Maps script yüklenemedi:', err);
  });
  }

  onSegmentChange(event: any) {
    this.selectedDayIndex = parseInt(event.detail.value, 10);
    this.updateMarkers();
  }

  loadMap() {
    const center = { lat: 41.0082, lng: 28.9784 }; // Default: İstanbul merkezi
    const mapEl = document.getElementById('map');

    if (!mapEl) {
      console.error('Harita elementi bulunamadı.');
      return;
    }

    this.map = new google.maps.Map(mapEl, {
      center,
      zoom: 12,
    });

    this.updateMarkers();
  }
  loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAUlrmPWdiKEozVKZE4K8T7PnMuU9j5WXI';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      reject(error);
    };

    document.body.appendChild(script);
  });
}


  updateMarkers() {
    // Eski markerları temizle
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    const currentDay = this.routes[this.selectedDayIndex];
    if (!currentDay || !currentDay.route) return;

    const bounds = new google.maps.LatLngBounds();

    currentDay.route.forEach((place: any, index: number) => {
      if (!place.latitude || !place.longitude) return;

      const position = { lat: place.latitude, lng: place.longitude };
      const marker = new google.maps.Marker({
        position,
        map: this.map,
        label: (index + 1).toString(),
        title: place.name,
      });

      this.markers.push(marker);
      bounds.extend(position);
    });

    // Tüm markerları kapsayacak şekilde haritayı yeniden merkezle
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
    }
  }
}
