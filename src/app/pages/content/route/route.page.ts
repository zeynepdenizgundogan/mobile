import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Route } from 'src/app/models/route.model';
import { getAuth } from 'firebase/auth';



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
  mapLoadError: boolean = false;
  selectedCategories: string[] = [];
  mustVisitList: any[] = [];
  startLocation: any = null;

  constructor(private router: Router, private http: HttpClient) {}


  ngOnInit() {
  const nav = this.router.getCurrentNavigation();
  const state = history.state;

  if (state?.selectedCategories) {
    this.selectedCategories = state.selectedCategories;
  }

  if (state?.mustVisitList) {
    this.mustVisitList = state.mustVisitList;
  }

if (state?.startLocation) {
  const s = state.startLocation;
  this.startLocation = {
    latitude: s.latitude ?? s.lat,
    longitude: s.longitude ?? s.lon,
    name: s.name
  };
  console.log('📍 Start Location geldi:', this.startLocation);
}

  if (state?.routes) {
    this.routes = state.routes;
  }
  console.log('Navigation state:', nav?.extras?.state); // Debug log
  if (nav?.extras?.state?.['routes']) {
    this.routes = nav.extras.state['routes'];
  } else {
    console.warn('No routes data found in navigation state');
  }

  this.loadGoogleMapsScript().then(() => {
    this.loadMap();
  }).catch(err => {
    console.error('Google Maps script yüklenemedi:', err);
    this.mapLoadError = true;
  });
  }

  onSegmentChange(event: any) {
    this.selectedDayIndex = parseInt(event.detail.value, 10);
    this.updateMarkers();
  }

  loadMap() {
    const center = { lat: 41.0370, lng: 28.9850 }; // Default: İstanbul merkezi
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
    if (!this.map) return; // Skip if map failed to load

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

    // Start location marker (mavi nokta)
if (this.startLocation && this.startLocation.latitude && this.startLocation.longitude) {
  const startPosition = {
    lat: this.startLocation.latitude,
    lng: this.startLocation.longitude,
  };
  console.log('Start Location:', this.startLocation.latitude, this.startLocation.longitude);
const startMarker = new google.maps.Marker({
  position: startPosition,
  map: this.map,
  icon: {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: "#007bff",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "white",
  },
  zIndex: 999,
  title: "Start Location",
});


  this.markers.push(startMarker);
  bounds.extend(startPosition);
}

    // Tüm markerları kapsayacak şekilde haritayı yeniden merkezle
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
    }
  }

  goBack() {
    this.router.navigateByUrl('/content/create-route', {
      state: {
        routes: this.routes,
        selectedCategories: this.selectedCategories,
        mustVisitList: this.mustVisitList,
        startLocation: this.startLocation
      }
    });
  }

async goToHome() {
  const user = getAuth().currentUser;
  const userId = user?.uid || 'anonymous';

  const allPlaces = this.routes
    .map((day: any) => day.route)
    .reduce((acc: any[], val: any[]) => acc.concat(val), []);

  const routePayload = {
    startPlace: allPlaces[0],
    duration: this.routes.length,
    startDate: history.state?.startDate,
    endDate: history.state?.endDate,
    days: this.routes.map((day: any, index: number) => ({
      day: index + 1,
      route: day.route.map((p: any) => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        category: p.category,
        startTime: p.startTime,   // <- ekle
        endTime: p.endTime        // <- ekle
      }))
    })),
    userId: userId,
    isShared: false
  };

  console.log('📦 Backend\'e gönderilen rota:', routePayload);

  try {
    const result = await this.http.post('http://localhost:5001/api/routes', routePayload).toPromise();
    console.log('✅ Rota başarıyla kaydedildi:', result);
    await this.router.navigateByUrl('/content/home');
  } catch (error: any) {
    console.error('❌ Rota kaydedilemedi:', error?.message || error);
    alert('Rota kaydedilemedi. Lütfen tekrar deneyin.');
  }
}






}