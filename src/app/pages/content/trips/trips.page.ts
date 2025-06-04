import { Component } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
})
export class TripsPage {
  user: any = null;
  upcomingTrips: any[] = [];
  pastTrips: any[] = [];
  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.user = getAuth().currentUser;
    this.loadTrips();
  }

  loadTrips() {
    const userId = this.user?.uid || 1; // ⚠️ Gerekirse backend tarafında UID'ye göre filtrele

    this.http.get<any>(`http://localhost:5001/api/routes/1`).subscribe({
      next: (res) => {
        const now = new Date();
        this.upcomingTrips = res.routes.filter((r: any) => new Date(r.startDate) >= now);
        this.pastTrips = res.routes.filter((r: any) => new Date(r.startDate) < now);

        console.log('✅ Upcoming:', this.upcomingTrips);
        console.log('✅ Past:', this.pastTrips);
      },
      error: (err) => {
        console.error('❌ Rota verisi alınamadı:', err);
      }
    });
  }
}