// src/app/pages/create-route/create-route.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { RouteService } from '../../../services/route.service';
import { Route } from '../../../models/route.model';
import { Place } from '../../../models/place.model';
import { Preferences } from '../../../models/preferences.model';
import { PreferencesService } from '../../../services/preferences.service';


@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.page.html',
  styleUrls: ['./create-route.page.scss'],
})
export class CreateRoutePage implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  
  // Calendar related properties
  currentMonth: Date = new Date();
  calendarDays: (Date | null)[] = [];
  weekdays: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Days with cloud icons (for demonstration)
  daysWithClouds: number[] = [2, 7, 8, 15, 21, 22, 23, 26, 27];
  
  // Use the Route model
  routeData: Route = new Route();
  
  // Categories for selection
  categories = [
    { id: 'museum', name: 'Museum', icon: 'landmark' },
    { id: 'historic', name: 'Historic', icon: 'library' },
    { id: 'park', name: 'Park', icon: 'leaf' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
    { id: 'food', name: 'Food', icon: 'utensils' }
  ];
  
  
  // Selected categories
  selectedCategories: string[] = [];

  // Places for selection (will be loaded from API)
  places: Place[] = [];
  
  // Loading state
  isLoading = false;

  constructor(
    private router: Router,
    private routeService: RouteService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private preferencesService: PreferencesService
  ) {}

  ngOnInit() {
    this.generateCalendarDays();
   
  }
  
 // In your create-route.page.ts
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
    userId: this.routeData.userId
  };

  this.routeService.getFilteredPlaces(preference).subscribe({
    next: (res) => {
      this.places = res.data;
      this.isLoading = false;
      console.log('✅ Filtered places:', this.places);
    },
    error: (err) => {
      this.isLoading = false;
      console.error('❌ Error loading filtered places:', err);
      this.showToast('Failed to load filtered places.');
    }
  });
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
      
      // If moving to step 3, load places based on selected categories
      if (this.currentStep === 3) {
        this.loadFilteredPlaces();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
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
  
  // Place selection
  togglePlace(place: Place) {
    const index = this.routeData.places.findIndex(p => p.id === place.id);
    if (index === -1) {
      this.routeData.places.push(place);
    } else {
      this.routeData.places.splice(index, 1);
    }
  }

  // Check if a place is selected
  isPlaceSelected(place: Place): boolean {
    return this.routeData.places.some(p => p.id === place.id);
  }

 // In your create-route.page.ts
 async onSubmit() {
  if (!this.validateRouteData()) return;

  const loading = await this.loadingController.create({
    message: 'Creating your route...',
    spinner: 'circles'
  });
  await loading.present();

  // User ID ekle
  this.routeData.userId = 1;

  // Preference objesi hazırla
const preference = new Preferences({
  type: Array.isArray(this.selectedCategories) && this.selectedCategories.length > 0
    ? this.selectedCategories
    : ['cultural'],
  duration: this.routeData.duration,
  startDate: this.routeData.startDate,
  endDate: this.routeData.endDate,
  userId: this.routeData.userId,
  niceToHavePlaces: this.routeData.places
});
  try {
    const response = await this.preferencesService.getOptimizedRoutes(preference).toPromise();
    await loading.dismiss();

    console.log('✅ Rota başarıyla oluşturuldu:', response.data.routes);

    // Yeni sayfaya yönlendirme
    this.router.navigate(['/content/route'], {
      state: { routes: response.data.routes }
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
    console.error('❌ Rota oluşturulamadı:', error);
    this.showToast('Route creation failed. Please try again.');
  }
}

  
  // Validate route data
  validateRouteData(): boolean {
    if (!this.routeData.startDate || !this.routeData.endDate) {
      this.showToast('Please select both start and end dates');
      return false;
    }
    
    if (this.selectedCategories.length === 0) {
      this.showToast('Please select at least one category');
      return false;
    }
    
    if (this.routeData.places.length === 0) {
      this.showToast('Please select at least one place to visit');
      return false;
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