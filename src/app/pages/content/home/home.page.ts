import { Component } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { environment } from "src/environments/environment.prod";
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  // Tanımlamanız gereken popularItems dizisi
  popularItems = [
    {
      name: 'Beach Paradise',
      location: 'Bali, Indonesia',
      rating: 4.8,
      image: 'assets/images/beach.jpg',
      userAvatar: 'assets/images/user1.jpg',
    },
    {
      name: 'Mountain Adventure',
      location: 'Aspen, Colorado',
      rating: 4.5,
      image: 'assets/images/mountain.jpg',
      userAvatar: 'assets/images/user2.jpg',
    },
  ];

  user: any = null;
  locationCountry: string = "";  // Konum bilgisi için bir değişken
  locationCity: string = "";  // Konum bilgisi için bir değişken

  oApp = initializeApp(environment.firebaseConfig);
  oAuth = getAuth();
  db = getFirestore(); // Firestore'a erişim için

  constructor(
    private alertController: AlertController,
    private navController: NavController,
    private locationService: LocationService
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
  }
}