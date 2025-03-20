// src/app/models/user.model.ts
import { Route } from './route.model';
import { Preferences } from './preferences.model';

export class User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  sharedRoutes: Route[];
  favRoutes: Route[];
  preferences: Preferences;
  
  constructor(data: Partial<User> = {}) {
    this.id = data.id;
    this.name = data.name || '';
    this.surname = data.surname || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.sharedRoutes = data.sharedRoutes || [];
    this.favRoutes = data.favRoutes || [];
    this.preferences = data.preferences || new Preferences();
  }
  
  verifyCredentials(): boolean {
    // Authentication logic
    return true;
  }
  
  register(): void {
    // Registration logic
    console.log('User registered');
  }
  
  setPreferences(preferences: Preferences): void {
    this.preferences = preferences;
  }
  
  addFavorite(route: Route): void {
    this.favRoutes.push(route);
  }
  
  shareRoute(route: Route): void {
    this.sharedRoutes.push(route);
  }
}