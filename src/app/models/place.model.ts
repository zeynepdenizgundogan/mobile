// src/app/models/place.model.ts
export class Place {
  id?: string;
  name: string;
  openingHours?: string;
  entrancePrice?: number;
  coordination?: string;
  location?: string;
  image?: string;
  category?: string;
  description?: string;
  createdAt?: Date;
  
  constructor(data: Partial<Place> = {}) {
    this.id = data.id;
    this.name = data.name || '';
    this.openingHours = data.openingHours;
    this.entrancePrice = data.entrancePrice;
    this.coordination = data.coordination;
    this.location = data.location;
    this.image = data.image;
    this.category = data.category;
    this.description = data.description;
    this.createdAt = data.createdAt;
  }
  
  getScore(): number {
    // Implement your scoring logic here
    return 0;
  }
}