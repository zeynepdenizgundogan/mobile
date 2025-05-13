import { Place } from './place.model';

export class Preferences {
  id?: number;
  type: string[]; // çoklu kategori
  duration: number;
  startDate: Date | null;
  endDate: Date | null;
  userId?: number;
  niceToHavePlaces: Place[];
  startLat: number;
  startLon: number;

  constructor(data: Partial<Preferences> = {}) {
    this.id = data.id;
    this.type = Array.isArray(data.type)
      ? data.type
      : typeof data.type === 'string'
        ? [data.type]
        : []; // ✅ güvenli dönüşüm
    this.duration = data.duration || 0;
    this.startDate = data.startDate ? new Date(data.startDate) : null;
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    this.userId = data.userId;
    this.niceToHavePlaces = data.niceToHavePlaces || [];
    this.startLat = data.startLat || 0;
    this.startLon = data.startLon || 0;
  }
}
