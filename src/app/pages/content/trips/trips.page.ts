import { Component } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';

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

  constructor(private http: HttpClient, private navController: NavController) {}

  ngOnInit() {
    this.user = getAuth().currentUser;
    this.loadTrips();
  }

  loadTrips() {
  const userId = this.user?.uid;

  if (!userId) {
    console.error('❌ Kullanıcı ID’si bulunamadı.');
    return;
  }

  this.http.get<any>(`http://localhost:5001/api/routes/${userId}`).subscribe({
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


  goToRouteDetail(route: any) {
  this.navController.navigateForward('/content/route-view', {
    state: { routeData: route }
  });
}


}