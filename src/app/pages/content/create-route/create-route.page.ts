// src/app/pages/create-route/create-route.page.ts
import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { RouteService } from '../../../services/route.service';
import { Route } from '../../../models/route.model';
import { Place } from '../../../models/place.model';
import { Preferences } from '../../../models/preferences.model';
import { PreferencesService } from '../../../services/preferences.service';
import { NgZone } from '@angular/core';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.page.html',
  styleUrls: ['./create-route.page.scss'],
})
export class CreateRoutePage implements OnInit, OnDestroy {
  currentStep = 0;
  totalSteps = 4;
  private map: any;
  private marker: any;
  currentMonth: Date = new Date();
  calendarDays: (Date | null)[] = [];
  weekdays: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  daysWithClouds: number[] = [2, 7, 8, 15, 21, 22, 23, 26, 27];
  routeData: Route = new Route();
  categories = [
    { id: 'cultural', name: 'Cultural', icon: 'business' },
    { id: 'park', name: 'Park', icon: 'leaf' },
    { id: 'food', name: 'Food', icon: 'restaurant' },
    { id: 'shopping', name: 'Shopping', icon: 'cart' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
    { id: 'scenic', name: 'Scenic', icon: 'image' }
  ];
  selectedCategories: string[] = [];
  places: Place[] = [];
  isLoading = false;

    constructor(
    private router: Router,
    private routeService: RouteService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private preferencesService: PreferencesService,
    private ngZone: NgZone,
    private alertController: AlertController
  ) {
    this.routeData.startLocation = {
      lat:  41.0370, 
      lon: 28.9850,
      name: 'Taksim, Istanbul'
    };
  }
searchTerm: string = '';
filteredPlaces: Place[] = [];
ngOnInit() {
  const nav = this.router.getCurrentNavigation();
  const state = history.state;

  if (state?.selectedCategories) {
    this.selectedCategories = [...state.selectedCategories];
  }

  if (state?.mustVisitList) {
    this.routeData.places = [...state.mustVisitList];
  }

  if (state?.startLocation) {
    this.routeData.startLocation = {
      lat: state.startLocation.lat || state.startLocation.latitude,
      lon: state.startLocation.lon || state.startLocation.longitude,
      name: state.startLocation.name || 'Your Starting Point'
    };
  }

  if (state?.city) {
    this.routeData.city = state.city;
  }

  if (state?.startDate) {
    this.routeData.startDate = new Date(state.startDate);
  }

  if (state?.endDate) {
    this.routeData.endDate = new Date(state.endDate);
    this.routeData.calculateDuration();
  }

  this.filteredPlaces = this.places; // Liste bozulmasın
  this.generateCalendarDays();
}



  ngOnDestroy() {
    this.map = null;
  }

selectCity(cityName: string) {
  this.routeData.city = cityName;

  if (cityName.toLowerCase() === 'istanbul') {
    this.routeData.startLocation = {
      lat: 41.0370,
      lon: 28.9850,
      name: 'Taksim, Istanbul'
    };
  } else if (cityName.toLowerCase() === 'rome') {
    this.routeData.startLocation = {
      lat: 41.9028,
      lon: 12.4964,
      name: 'Piazza Venezia, Rome'
    };
  }
}

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCRheeW5QYpoaoK3WuSUQBZ4JqVEN1kGlk';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject('Google Maps script yüklenemedi');
      document.body.appendChild(script);
    });
  }
  resetForm() {
  this.currentStep = 0;
  this.selectedCategories = [];
  this.places = [];
  this.isLoading = false;

  this.routeData = new Route(); // tüm verileri temizler
  this.currentMonth = new Date();
  this.generateCalendarDays(); // takvimi sıfırla
}
  ionViewWillEnter() {
  const state = history.state;

  if (!state?.selectedCategories && !state?.mustVisitList && !state?.startLocation) {
    // Eğer dışarıdan veri gelmediyse sıfırla
    this.resetForm();
  }
}

  
  initializeGoogleMap() {
    const startLat = this.routeData.startLocation?.lat || 41.9028;
    const startLon = this.routeData.startLocation?.lon || 12.4964;
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    this.map = new google.maps.Map(mapEl, {
      center: { lat: startLat, lng: startLon },
      zoom: 13,
    });

    this.marker = new google.maps.Marker({
      position: { lat: startLat, lng: startLon },
      map: this.map,
      title: 'Starting Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#007bff',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: 'white'
      }
    });

    this.map.addListener('click', (event: any) => {
      this.updateStartLocation(event.latLng.lat(), event.latLng.lng());
    });
  }

  updateStartLocation(lat: number, lng: number) {
  this.routeData.startLocation = { lat, lon: lng };

  if (this.marker) this.marker.setMap(null);

  this.marker = new google.maps.Marker({
    position: { lat, lng },
    map: this.map,
    title: 'Selected Start Location',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#007bff',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: 'white'
    }
  });

  this.map.setCenter({ lat, lng });

  // 🧠 Eklenen reverse geocode işlemi
this.reverseGeocode(lat, lng).then(name => {
  this.ngZone.run(() => {
    this.routeData.startLocation!.name = name;
  });
}).catch(() => {
  this.ngZone.run(() => {
    this.routeData.startLocation!.name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  });
});
}
  reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!(window as any).google || !(window as any).google.maps) {
        reject('Google Maps API not loaded');
        return;
      }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('No address found');
        }
      });
    });
  }


  getLocationName(): string {
    return this.routeData.startLocation?.name || 'Select a location';
  }

  // Calendar related methods
  generateCalendarDays() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    this.calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDays.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(new Date(year, month, i));
    }
  }

  handleDateSelect(date: Date) {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (!this.routeData.startDate || (this.routeData.startDate && this.routeData.endDate)) {
      // If no start date is selected or both dates are already selected, set as start date
      this.routeData.startDate = newDate;
      this.routeData.endDate = null;
    } else {
      // If only start date is selected
      if (newDate.getTime() > this.routeData.startDate.getTime()) {
        this.routeData.endDate = newDate;
      } else {
        // If the new date is before start date, swap them
        const temp = this.routeData.startDate;
        this.routeData.startDate = newDate;
        this.routeData.endDate = temp;
      }
    }
    
    // Calculate duration if both dates are selected
    if (this.routeData.startDate && this.routeData.endDate) {
      this.routeData.calculateDuration();
    }
    
    // Trigger change detection
    this.onDateSelect();
  }
  
  isDateInRange(date: Date): boolean {
    if (!this.routeData.startDate || !this.routeData.endDate) {
      return false;
    }
    
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const startDate = new Date(
      this.routeData.startDate.getFullYear(),
      this.routeData.startDate.getMonth(),
      this.routeData.startDate.getDate()
    ).getTime();
    const endDate = new Date(
      this.routeData.endDate.getFullYear(),
      this.routeData.endDate.getMonth(),
      this.routeData.endDate.getDate()
    ).getTime();
    
    return checkDate >= startDate && checkDate <= endDate;
  }
  
  isStartDate(date: Date): boolean {
    if (!this.routeData.startDate) return false;
    
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const startDate = new Date(
      this.routeData.startDate.getFullYear(),
      this.routeData.startDate.getMonth(),
      this.routeData.startDate.getDate()
    ).getTime();
    
    return checkDate === startDate;
  }

  isEndDate(date: Date): boolean {
    if (!this.routeData.endDate) return false;
    
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endDate = new Date(
      this.routeData.endDate.getFullYear(),
      this.routeData.endDate.getMonth(),
      this.routeData.endDate.getDate()
    ).getTime();
    
    return checkDate === endDate;
  }
  
  hasCloud(date: Date): boolean {
    return this.daysWithClouds.includes(date.getDate());
  }

  nextMonth() {
    const newDate = new Date(this.currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentMonth = newDate;
    this.generateCalendarDays();
  }

  prevMonth() {
    const newDate = new Date(this.currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentMonth = newDate;
    this.generateCalendarDays();
  }

  // Navigation between steps
nextStep() {
  if (this.currentStep < this.totalSteps) {
    this.currentStep++;

    // 🧠 Harita step 1'de yüklensin, script de dahil
    if (this.currentStep === 1) {
      this.loadGoogleMapsScript()
        .then(() => {
          setTimeout(() => this.initializeGoogleMap(), 300); // Harita container DOM'a gelsin
        })
        .catch((err) => {
          console.error('❌ Google Maps yüklenemedi:', err);
        });
    }

    if (this.currentStep === 4 && !this.isLoading) {
      this.loadFilteredPlaces();
    }
  }
}


  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    } else {
      this.router.navigate(['/content/home']);
    }
  }

  // Category selection
  toggleCategory(categoryId: string) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index === -1) {
      if (this.selectedCategories.length < 3) {
        this.selectedCategories.push(categoryId);
      }
    } else {
      this.selectedCategories.splice(index, 1);
    }
  }

  // Date selection
  onDateSelect() {
    console.log('Selected dates:', {
      startDate: this.routeData.startDate,
      endDate: this.routeData.endDate,
      duration: this.routeData.duration
    });
  }

  formatDate(dateObj: Date | null): string {
    if (!dateObj) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    };
    return new Date(dateObj).toLocaleDateString('en-US', options);
  }

  // Load filtered places method
  loadFilteredPlaces() {
    if (!this.routeData.startDate || !this.routeData.endDate || this.selectedCategories.length === 0) {
      this.showToast('Please select a date range and at least one category');
      return;
    }

    this.isLoading = true;

    const preference = {
      type: this.selectedCategories,
      duration: this.routeData.duration,
      startDate: this.routeData.startDate,
      endDate: this.routeData.endDate,
      userId: this.routeData.userId,
      city: this.routeData.city || 'istanbul',
    };

    this.routeService.getFilteredPlaces(preference).subscribe({
      next: (res) => {
        console.log("📦 Gelen veriler:", res.data);
        this.places = res.data;
        this.filteredPlaces = [...this.places];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error loading filtered places:', err);
        this.showToast('Failed to load filtered places.');
      }
     
    });
    
  }

  // Place selection
  togglePlace(place: Place) {
    const index = this.routeData.places.findIndex(p => p.id === place.id);
    if (index === -1) {
      this.routeData.places.push(place);
    } else {
      this.routeData.places.splice(index, 1);
    }
  }

  
ngOnChanges() {
  this.filterPlaces();
}

filterPlaces() {
  const term = this.searchTerm.toLowerCase();
  this.filteredPlaces = this.places.filter(place =>
    place.name.toLowerCase().includes(term)
  );
}
  // Check if a place is selected
  isPlaceSelected(place: Place): boolean {
    return this.routeData.places.some(p => p.id === place.id);
  }

  async onSubmit() {
    console.log('🚀 onSubmit tetiklendi:', {
      places: this.routeData.places.map(p => ({ id: p.id, name: p.name }))
    });

    if (this.isLoading) {
      console.log('⚠️ onSubmit zaten çalışıyor, tekrar engellendi');
      return;
    }
    this.isLoading = true;

    if (!this.validateRouteData()) {
      this.isLoading = false;
      return;
    }


    const loading = await this.loadingController.create({
      message: 'Creating your route...',
      spinner: 'circles'
    });
    await loading.present();

    this.routeData.userId = 1;

    const preference = new Preferences({
      type: Array.isArray(this.selectedCategories) && this.selectedCategories.length > 0
        ? this.selectedCategories
        : ['cultural'],
      duration: this.routeData.duration,
      startDate: this.routeData.startDate,
      endDate: this.routeData.endDate,
      userId: this.routeData.userId,
      niceToHavePlaces: this.routeData.places,
      startLat: this.routeData.startLocation?.lat || 41.0370,
      startLon: this.routeData.startLocation?.lon || 28.9850,
      city: this.routeData.city
    });

    console.log('📤 Gönderilen preference:', {
      niceToHavePlaces: preference.niceToHavePlaces.map(p => ({ id: p.id, name: p.name })),
      startLat: preference.startLat,
      startLon: preference.startLon
    });

    try {
      const response = await this.preferencesService.getOptimizedRoutes(preference).toPromise();
      await loading.dismiss();
      console.log('✅ Rota yanıtı:', response.data.routes);

      this.router.navigate(['/content/route'], {
        state: {
          routes: response.data.routes,
          startDate: this.routeData.startDate?.toISOString(),
          endDate: this.routeData.endDate?.toISOString(),
          duration: this.routeData.duration,
          selectedCategories: this.selectedCategories,
          mustVisitList: this.routeData.places,
          startLocation: {
            lat: this.routeData.startLocation?.lat || 41.0370,
            lon: this.routeData.startLocation?.lon || 28.9850
          },
          city: this.routeData.city || 'unknown'
        }
      });

      const toast = await this.toastController.create({
        message: 'Route created successfully!',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      await loading.dismiss();
      console.error('❌ Rota hatası:', (error as any).message, error);
      const errorMessage = (error as { message: string }).message || 'Unknown error';
      this.showToast(`Route creation failed: ${errorMessage}`);
    } finally {
      this.isLoading = false;
    }
  }
  
  // Validate route data
  validateRouteData(): boolean {
    if (!this.routeData.startLocation) {
      this.showToast('Please select a starting location');
      return false;
    }
    
    if (!this.routeData.startDate || !this.routeData.endDate) {
      this.showToast('Please select both start and end dates');
      return false;
    }
    
    if (this.selectedCategories.length === 0) {
      this.showToast('Please select at least one category');
      return false;
    }
    
    if (this.routeData.places.length === 0) {
  this.showToast('No places selected. The route will be generated based on your preferences.');
  // return false; // ❌ bunu yazma
}
    
    return true;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }
 
  
  
}