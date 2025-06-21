import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.page.html',
  styleUrls: ['./personal-info.page.scss'],
})
export class PersonalInfoPage implements OnInit {
  user: any = null;
  locationCity: string = '';
  locationCountry: string = '';

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.getUserInfo();
    this.locationService.locationCity$.subscribe(city => {
      this.locationCity = city;
    });

    this.locationService.locationCountry$.subscribe(country => {
      this.locationCountry = country;
    });
  }

  private async getUserInfo() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.user = user;
      await this.locationService.getUserLocation(); // Firestore'dan konum çekiliyorsa
    }
  }
}
