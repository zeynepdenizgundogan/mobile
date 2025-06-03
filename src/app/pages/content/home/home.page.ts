import { Component } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { environment } from "src/environments/environment.prod";
import { LocationService } from '../../../services/location.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  // Tanımlamanız gereken popularItems dizisi
  public savedRoutes: any[] = [];
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
    private http: HttpClient
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
    this.loadSavedRoutes();
  }

    loadSavedRoutes() {
    this.http.get<any>('http://localhost:5001/api/routes/1') // 👈 userId = 1 örnek
      .subscribe({
        next: (res) => {
          this.savedRoutes = res.routes;
          console.log('📦 Kayıtlı rotalar:', this.savedRoutes);
        },
        error: (err) => {
          console.error('❌ Rotalar yüklenemedi:', err);
        }
      });
  }

  goToRouteDetail(route: any) {
  this.navController.navigateForward('/content/route-view', {
    state: { routeData: route }
  });
}

}