import { Component } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { LocationService } from '../../../services/location.service';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../../services/event.service';
import { environment } from "src/environments/environment";
import { ImageHelperService } from 'src/app/services/image-helper.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  // Tanımlamanız gereken popularItems dizisi
  public sharedRoutes: any[] = [];
  user: any = null;
  locationCountry: string = "";  // Konum bilgisi için bir değişken
  locationCity: string = "";  // Konum bilgisi için bir değişken

  oApp = initializeApp(environment.firebaseConfig);
  oAuth = getAuth();
  db = getFirestore(); // Firestore'a erişim için

  constructor(
    private alertController: AlertController,
    private navController: NavController,
    private locationService: LocationService,
    private http: HttpClient,
    private eventService: EventService,
    private imageHelper: ImageHelperService
  ) {}

  ngOnInit() {
    this.locationService.locationCity$.subscribe(city => {
      this.locationCity = city;
    });

    this.locationService.locationCountry$.subscribe(country => {
      this.locationCountry = country;
    });

    const auth = getAuth();
    this.user = auth.currentUser;
    this.loadSharedRoutes();
      // 🔁 TripsPage'den paylaşım olduğunda tekrar yükle
  this.eventService.refreshHomePage$.subscribe(() => {
    console.log('🔄 Paylaşım yapıldı, rotalar tekrar yükleniyor...');
    this.loadSharedRoutes();
  });
  }

  getImageUrl(url: string) {
  return this.imageHelper.getProxiedImageUrl(url);
}

loadSharedRoutes() {
  this.http.get<any>(`${environment.apiUrl}/routes?isShared=true`).subscribe({
    next: (res) => {
      this.sharedRoutes = res.routes.map((route: any) => {
        const start = new Date(route.startDate);
        const end = new Date(route.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return {
          ...route,
          durationInDays: diffDays
        };
      });

      console.log('✅ Paylaşılan rotalar:', this.sharedRoutes);
    },
    error: (err) => {
      console.error('❌ Paylaşılan rotalar alınamadı:', err);
    }
  });
}




  goToRouteDetail(route: any) {
  this.navController.navigateForward('/content/route-view', {
    state: { routeData: route }
  });
}
searchTerm: string = '';

get filteredRoutes() {
  if (!this.searchTerm.trim()) return this.sharedRoutes;
  return this.sharedRoutes.filter(route =>
    route.title?.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}
}