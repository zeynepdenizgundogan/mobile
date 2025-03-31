// src/app/models/preferences.model.ts
import { Place } from './place.model'; // 👈 varsa bu import'u en üste ekle
export class Preferences {
    id?: number;
    type: string; // e.g., 'cultural', 'adventure', 'relaxation'
    duration: number; // preferred trip duration in days
    startDate: Date | null;
    endDate: Date | null;
    userId?: number; // Reference to the user
    niceToHavePlaces: Place[];

    constructor(data: Partial<Preferences> = {}) {
      this.id = data.id;
      this.type = data.type || '';
      this.duration = data.duration || 0;
      this.startDate = data.startDate || null;
      this.endDate = data.endDate || null;
      this.userId = data.userId;
      this.niceToHavePlaces = data.niceToHavePlaces || [];
    }
  }