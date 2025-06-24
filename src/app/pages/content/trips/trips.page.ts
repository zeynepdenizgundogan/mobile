import { Component } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { NavController, ToastController } from '@ionic/angular';
import { EventService } from '../../../services/event.service';
import { environment } from 'src/environments/environment';
import { ImageHelperService } from 'src/app/services/image-helper.service';

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

  constructor(
    private http: HttpClient,
    private navController: NavController,
    private toastController: ToastController,
    private eventService: EventService,
    private imageHelper: ImageHelperService
  ) {}

  ionViewWillEnter() {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      this.user = currentUser;
      this.loadTrips();
    } else {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.user = user;
          this.loadTrips();
        } else {
          console.warn('❌ Kullanıcı oturumu yok.');
        }
      });
    }
  }

getImageUrl(url: string) {
  return this.imageHelper.getProxiedImageUrl(url);
}


  loadTrips() {
    const userId = this.user?.uid;

    if (!userId) {
      console.error("❌ Kullanıcı ID'si bulunamadı.");
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/routes/${userId}?_=${Date.now()}`).subscribe({

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

async toggleShare(trip: any, event: Event) {
  event.stopPropagation(); // Kart tıklamasını engelle

  const newShareStatus = !trip.isShared;

  try {
    await this.http.put(
      `${environment.apiUrl}/routes/${trip._id}/share`,
      { isShared: newShareStatus }
    ).toPromise();

    // UI'ı güncelle
    trip.isShared = newShareStatus;
    this.eventService.triggerRefreshHome(); //HomePage güncellemesi için event tetikle
    // Toast mesajı göster
    const toast = await this.toastController.create({
      message: newShareStatus ? 'Trip shared publicly!' : 'Trip made private',
      duration: 2000,
      position: 'bottom',
      color: newShareStatus ? 'success' : 'medium'
    });
    await toast.present();

  } catch (error) {
    console.error('❌ Share toggle failed:', error);

    const toast = await this.toastController.create({
      message: 'Failed to update sharing status',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}

get filteredUpcomingTrips() {
  return this.upcomingTrips.filter(trip =>
    trip.title?.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}

get filteredPastTrips() {
  return this.pastTrips.filter(trip =>
    trip.title?.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}

}