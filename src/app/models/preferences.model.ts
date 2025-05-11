import { Place } from './place.model';

export class Preferences {
  id?: number;
  type: string[];
  duration: number;
  startDate: Date | null;
  endDate: Date | null;
  userId?: number;
  niceToHavePlaces: Place[];



  // ✅ Yeni alanlar
  latitude?: number;
  longitude?: number;
  mustVisit?: Place[];

  constructor(data: Partial<Preferences> = {}) {
    this.id = data.id;
    this.type = data.type || [];
    this.duration = data.duration || 0;
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.userId = data.userId;
    this.niceToHavePlaces = data.niceToHavePlaces || [];

    // ✅ Constructor'a eklemeyi de unutma
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.mustVisit = data.mustVisit || [];
  }
}
