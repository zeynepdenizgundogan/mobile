import { Place } from './place.model';

export interface StartLocation {
  lat: number;
  lon: number;
  name?: string;
}

export class Route {
  id?: number;
  startPlace: Place | null;
  duration: number; // in days
  startDate: Date | null;
  endDate: Date | null;
  places: Place[];
  userId?: number; // Reference to the user who created this route
  startLocation?: StartLocation; // Optional start location for the route
  
  constructor(data: Partial<Route> = {}) {
    this.id = data.id;
    this.startPlace = data.startPlace || null;
    this.duration = data.duration || 0;
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.places = data.places || [];
    this.userId = data.userId;
    this.startLocation = data.startLocation || undefined; // Optional start location
  }
  
  createRoute(): void {
    // Logic for creating a route
    console.log('Route created');
  }
  
  modifyRoute(): void {
    // Logic for modifying a route
    console.log('Route modified');
  }
  
  // Calculate duration based on start and end dates
  calculateDuration(): number {
    if (this.startDate && this.endDate) {
      const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.duration = diffDays;
      return diffDays;
    }
    return 0;
  }
  
}