import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';


declare var google: any;

@Component({
  selector: 'app-route-view',
  templateUrl: './route-view.page.html',
  styleUrls: ['./route-view.page.scss'],
})
export class RouteViewPage implements OnInit {
  routes: any[] = [];
  selectedDayIndex = 0;
  map: any;
  markers: any[] = [];
  mapLoadError: boolean = false;

  constructor(private alertController: AlertController) {}

ngOnInit() {
  const state = history.state;
  if (state?.routeData?.days?.length) {
    this.routes = state.routeData.days;
  } else if (state?.routeData?.places?.length) {
    this.routes = [{ day: 1, route: state.routeData.places }];
  }
  console.log('📦 Gelen routeData:', history.state.routeData);
console.log('⏱ İlk gün ilk yer:', history.state.routeData?.days?.[0]?.route?.[0]);
}

  onSegmentChange(event: any) {
    this.selectedDayIndex = parseInt(event.detail.value, 10);
    this.updateMarkers();
  }

  loadMap() {
    const center = { lat: 41.0082, lng: 28.9784 };
    const mapEl = document.getElementById('map');

    if (!mapEl) {
      console.error('❌ Harita elementi bulunamadı.');
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
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyAXs1wCiXmeJgreCrQR50lHNlIeunUkQKw';
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = (error) => reject(error);

      document.body.appendChild(script);
    });
  }
  ionViewDidEnter() {
  // Bu lifecycle, DOM tamamen yüklendiğinde çalışır
  this.loadGoogleMapsScript()
    .then(() => this.loadMap())
    .catch((err) => {
      console.error('❌ Google Maps yüklenemedi:', err);
      this.mapLoadError = true;
    });
}

  updateMarkers() {
    if (!this.map) return;

    this.markers.forEach((marker) => marker.setMap(null));
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

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
    }
  }
  
}
