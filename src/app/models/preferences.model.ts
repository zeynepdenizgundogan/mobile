// src/app/models/preferences.model.ts
export class Preferences {
    id?: number;
    type: string; // e.g., 'cultural', 'adventure', 'relaxation'
    duration: number; // preferred trip duration in days
    startDate: Date | null;
    endDate: Date | null;
    userId?: number; // Reference to the user
    
    constructor(data: Partial<Preferences> = {}) {
      this.id = data.id;
      this.type = data.type || '';
      this.duration = data.duration || 0;
      this.startDate = data.startDate || null;
      this.endDate = data.endDate || null;
      this.userId = data.userId;
    }
  }