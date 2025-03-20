// src/app/pages/create-route/create-route.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { RouteService } from '../../../services/route.service';
import { Route } from '../../../models/route.model';
import { Place } from '../../../models/place.model';


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
    { id: 'cultural', name: 'Cultural', icon: 'museum' },
    { id: 'nature', name: 'Natural Park', icon: 'leaf' },
    { id: 'adventure', name: 'Adventure', icon: 'compass' }
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
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.generateCalendarDays();
    this.loadPlaces();
  }
  
 // In your create-route.page.ts
loadPlaces() {
  this.isLoading = true;
  
  // First try to load from API
  this.routeService.getPlaces().subscribe(
    (places) => {
      console.log('Places loaded successfully:', places);
      this.places = places;
      this.isLoading = false;
    },
    (error) => {
      console.error('Error loading places from API:', error);
      
      // If API fails, use hardcoded places as fallback
      console.log('Using hardcoded places as fallback');
      this.places = [
        {
          id: '1',
          name: 'Mount Bromo',
          openingHours: '9:00 AM - 5:00 PM',
          entrancePrice: 15,
          coordination: '-7.9424,112.9532',
          location: 'Jawa Timur',
          image: 'assets/images/placeholder.jpg',
          category: 'nature',
          description: 'An active volcano and popular tourist destination in East Java, Indonesia.',
          getScore: () => 0 // Default implementation
        },
        {
          id: '2',
          name: 'Borobudur Temple',
          openingHours: '8:00 AM - 4:00 PM',
          entrancePrice: 25,
          coordination: '-7.6079,110.2038',
          location: 'Jawa Tengah',
          image: 'assets/images/placeholder.jpg',
          category: 'cultural',
          description: 'A 9th-century Mahayana Buddhist temple in Central Java, Indonesia.',
          getScore: () => 0 // Default implementation
        },
        {
          id: '3',
          name: 'Bali Beach',
          openingHours: '24 hours',
          entrancePrice: 0,
          coordination: '-8.3405,115.0920',
          location: 'Bali',
          image: 'assets/images/placeholder.jpg',
          category: 'adventure',
          description: 'Beautiful beaches with golden sands and clear waters in Bali, Indonesia.',
          getScore: () => 0 // Default implementation
        }
      ];
      
      this.isLoading = false;
    }
  );
}
  // Load places by selected categories
  loadPlacesByCategories() {
    if (this.selectedCategories.length === 0) {
      this.loadPlaces();
      return;
    }
    
    this.isLoading = true;
    // For simplicity, we'll just use the first category
    // In a real app, you might want to combine results from multiple categories
    this.routeService.getPlacesByCategory(this.selectedCategories[0]).subscribe(
      (places) => {
        this.places = places;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading places by category:', error);
        this.isLoading = false;
        this.showToast('Failed to load places. Please try again.');
      }
    );
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
        this.loadPlacesByCategories();
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

  /*// Form submission
  async onSubmit() {
    if (!this.validateRouteData()) {
      return;
    }
    
    // Show loading indicator
    const loading = await this.loadingController.create({
      message: 'Creating your route...',
      spinner: 'circles'
    });
    await loading.present();
    
    // Set the first selected place as the start place and the last one as the end place
    if (this.routeData.places.length > 0) {
      this.routeData.startPlace = this.routeData.places[0];
      this.routeData.endPlace = this.routeData.places[this.routeData.places.length - 1];
    }
    
    // Add current user ID (you would get this from your auth service)
    this.routeData.userId = 1; // Replace with actual user ID
    
    // Send data to backend
    this.routeService.createRoute(this.routeData).subscribe(
      async (response) => {
        await loading.dismiss();
        
        // Show success message
        const toast = await this.toastController.create({
          message: 'Your route has been created successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
        
        // Navigate back to home
        this.router.navigate(['/content/home']);
      },
      async (error) => {
        await loading.dismiss();
        
        // Show error message
        const toast = await this.toastController.create({
          message: 'Failed to create route. Please try again.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        await toast.present();
        
        console.error('Error creating route:', error);
      }
    );
  }*/
 // In your create-route.page.ts
async onSubmit() {
  if (this.routeData.places.length === 0) {
    this.showToast('Please select at least one place');
    return;
  }
  
  // Show loading indicator
  const loading = await this.loadingController.create({
    message: 'Creating your route...',
    spinner: 'circles'
  });
  await loading.present();
  
  // Set start and end places
  if (this.routeData.places.length > 0) {
    this.routeData.startPlace = this.routeData.places[0];
    this.routeData.endPlace = this.routeData.places[this.routeData.places.length - 1];
  }
  
  // Calculate duration
  this.routeData.calculateDuration();
  
  // Add user ID (you would get this from your auth service)
  this.routeData.userId = 1; // Replace with actual user ID
  
  console.log('Submitting route data:', this.routeData);
  
  // Format the data for the backend
  const routeForBackend = new Route();
  routeForBackend.startPlace = this.routeData.startPlace;
  routeForBackend.endPlace = this.routeData.endPlace;
  routeForBackend.duration = this.routeData.duration;
  routeForBackend.startDate = this.routeData.startDate;
  routeForBackend.endDate = this.routeData.endDate;
  routeForBackend.places = this.routeData.places;
  routeForBackend.userId = this.routeData.userId;
  routeForBackend.price = 0; // Set default or calculated price
  
  console.log('Formatted route data for backend:', routeForBackend);
  
  // Send to backend
  this.routeService.createRoute(routeForBackend).subscribe(
    async (response) => {
      await loading.dismiss();
      
      console.log('Route created successfully:', response);
      
      // Show success message
      const toast = await this.toastController.create({
        message: 'Your route has been created successfully!',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
      // Navigate back to home
      this.router.navigate(['/content/home']);
    },
    async (error) => {
      await loading.dismiss();
      
      console.error('Error creating route:', error);
      
      // Show error message
      const toast = await this.toastController.create({
        message: 'Failed to create route. Please try again.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  );
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