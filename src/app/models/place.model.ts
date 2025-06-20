// src/app/models/place.model.ts
export class Place {
  id?: string;
  name: string;
  openingHours?: string;
  entrancePrice?: number;
  coordination?: string;
  location?: string;
  image?: string;
  image_url?: string;     // backend’ten gelen gerçek url
  category?: string;
  description?: string;
  createdAt?: Date;
  startTime?: string;
  endTime?: string;

  
  constructor(data: Partial<Place> = {}) {
    this.id = data.id;
    this.name = data.name || '';
    this.openingHours = data.openingHours;
    this.entrancePrice = data.entrancePrice;
    this.coordination = data.coordination;
    this.location = data.location;
    this.image_url = data.image_url;
    this.image = data.image_url || data.image;
    this.category = data.category;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    console.log('🖼️ Place created:', { name: this.name, image: this.image, image_url: this.image_url });
    
  }
  
  getScore(): number {
    // Implement your scoring logic here
    return 0;
  }
}