import { Injectable } from '@angular/core';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private db = getFirestore();
  private auth = getAuth();

  private locationCitySource = new BehaviorSubject<string>('');
  private locationCountrySource = new BehaviorSubject<string>('');

  locationCity$ = this.locationCitySource.asObservable();
  locationCountry$ = this.locationCountrySource.asObservable();

  constructor() {
    this.getUserLocation();
  }

  async getUserLocation() {
    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.locationCitySource.next(data['locationCity'] || '');
        this.locationCountrySource.next(data['locationCountry'] || '');
      }
    }
  }

  async updateLocation(city: string, country: string) {
    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.db, "users", user.uid);
      await setDoc(userRef, {
        locationCity: city,
        locationCountry: country
      }, { merge: true });
      
      // Update local state
      this.locationCitySource.next(city);
      this.locationCountrySource.next(country);
    }
  }
}