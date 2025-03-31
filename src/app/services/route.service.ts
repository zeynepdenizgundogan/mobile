// src/app/services/route.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route } from '../models/route.model';
import { Place } from '../models/place.model';
import { environment } from '../../environments/environment'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:5000/api'; // Replace with your actual API URL
  lastLocation: { lat: number, lng: number } | null = null;
  constructor(private http: HttpClient) {}

  // Get all places
  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.apiUrl}/places`);
  }
  
  // Get places by category
  getPlacesByCategory(category: string) {
    if (!this.lastLocation) {
      throw new Error('Konum bilgisi eksik');
    }
  
    const { lat, lng } = this.lastLocation;
    return this.http.get<any[]>(`${environment.apiUrl}/places?lat=${lat}&lng=${lng}&category=${category}`);
  }
  
  // Create a new route
  createRoute(route: Route): Observable<Route> {
    // Format dates for backend
    const formattedRoute = {
      ...route,
      startDate: route.startDate ? route.startDate.toISOString() : null,
      endDate: route.endDate ? route.endDate.toISOString() : null
    };
    
    return this.http.post<Route>(`${this.apiUrl}/routes`, formattedRoute);
  }
  
  // Get user's routes
  getUserRoutes(userId: number): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/users/${userId}/routes`);
  }
  
  // Get route details
  getRouteDetails(routeId: number): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/routes/${routeId}`);
  }
  
  // Update a route
  updateRoute(routeId: number, route: Route): Observable<Route> {
    return this.http.put<Route>(`${this.apiUrl}/routes/${routeId}`, route);
  }
  
  // Delete a route
  deleteRoute(routeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/routes/${routeId}`);
  }
}