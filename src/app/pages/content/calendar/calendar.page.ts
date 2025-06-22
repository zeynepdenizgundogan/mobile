import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { NavController, ToastController } from '@ionic/angular';
import { EventService } from '../../../services/event.service'; // path'i projenize göre ayarlayın
import { environment } from 'src/environments/environment';
interface Route {
  _id: string;
  title: string;
  city: string;
  duration: number;
  startDate: string;
  endDate: string;
  image_url?: string;
  isShared: boolean;
}

interface HighlightedDate {
  date: string;
  textColor: string;
  backgroundColor: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  highlightedDates: HighlightedDate[] = [];
  allRoutes: Route[] = [];
  selectedRoutes: Route[] = [];
  selectedDate: string = new Date().toISOString();
  upcomingRoutes: Route[] = [];
  pastRoutes: Route[] = [];

  constructor(
    private http: HttpClient,
    private navController: NavController,
    private toastController: ToastController,
    private eventService: EventService
  ) {}

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
        this.loadUserRoutes(userId);
      }
    });
  }

  ionViewWillEnter() {
    // Sayfa her açıldığında rotaları yeniden yükle
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.loadUserRoutes(user.uid);
    }
  }

  loadUserRoutes(userId: string) {
    this.http.get<any>(`${environment.apiUrl}/routes/${userId}`).subscribe(
      (res) => {
        this.allRoutes = res.routes || [];
        this.categorizeRoutes();
        this.highlightDatesFromRoutes();
        this.filterRoutesByDate();
      },
      (err) => console.error('Rotalar alınamadı:', err)
    );
  }

  categorizeRoutes() {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Günün başlangıcına ayarla
    
    this.upcomingRoutes = this.allRoutes.filter((route) => 
      new Date(route.startDate) >= now
    );
    
    this.pastRoutes = this.allRoutes.filter((route) => 
      new Date(route.endDate) < now
    );
  }

  highlightDatesFromRoutes() {
    const dateMap = new Map<string, HighlightedDate>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.allRoutes.forEach(route => {
      const start = new Date(route.startDate);
      const end = new Date(route.endDate);
      
      // Her rota günü için döngü (başlangıç ve bitiş dahil)
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const checkDate = new Date(currentDate);
        checkDate.setHours(0, 0, 0, 0);
        
        // Tarihe göre renk belirleme
        let textColor = '#ffffff';
        let backgroundColor = '#3880ff'; // Varsayılan mavi (gelecek)
        
        if (checkDate < today) {
          // Geçmiş tarihler için gri
          backgroundColor = '#92949c';
        } else if (checkDate.getTime() === today.getTime()) {
          // Bugün için yeşil
          backgroundColor = '#2dd36f';
        }
        
        dateMap.set(dateStr, {
          date: dateStr,
          textColor: textColor,
          backgroundColor: backgroundColor
        });
        
        // Bir sonraki güne geç
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    this.highlightedDates = Array.from(dateMap.values());
    console.log('Highlighted dates:', this.highlightedDates);
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail.value;
    this.filterRoutesByDate();
  }

  filterRoutesByDate() {
    if (!this.selectedDate) {
      this.selectedRoutes = [];
      return;
    }

    // Seçilen tarihi parse et
    const selectedDateStr = this.selectedDate.split('T')[0]; // YYYY-MM-DD formatı
    const selected = new Date(selectedDateStr + 'T00:00:00.000Z');
    
    console.log('Selected date string:', selectedDateStr);
    console.log('Selected date object:', selected);
    console.log('All routes:', this.allRoutes);

    this.selectedRoutes = this.allRoutes.filter(route => {
      const startDateStr = route.startDate.split('T')[0];
      const endDateStr = route.endDate.split('T')[0];
      const start = new Date(startDateStr + 'T00:00:00.000Z');
      const end = new Date(endDateStr + 'T00:00:00.000Z');
      
      console.log(`Route: ${route.title}`);
      console.log(`Start: ${startDateStr} -> ${start}`);
      console.log(`End: ${endDateStr} -> ${end}`);
      console.log(`Selected in range: ${selected >= start && selected <= end}`);
      
      // Seçilen tarih, başlangıç ve bitiş tarihi arasında mı (dahil)
      return selected >= start && selected <= end;
    });

    console.log('Filtered routes for date:', selectedDateStr, this.selectedRoutes);
  }

  getRouteStatus(route: Route): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startDate = new Date(route.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(route.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < now) {
      return 'past';
    } else if (startDate > now) {
      return 'upcoming';
    } else {
      return 'ongoing';
    }
  }

  // Route detayına git
  goToRouteDetail(route: Route) {
    this.navController.navigateForward('/content/route-view', {
      state: { routeData: route }
    });
  }

  // Share durumunu toggle et
  async toggleShare(trip: Route, event: Event) {
    event.stopPropagation(); // Kart tıklamasını engelle

    const newShareStatus = !trip.isShared;

    try {
      await this.http.put(
        `${environment.apiUrl}/routes/${trip._id}/share`,
        { isShared: newShareStatus }
      ).toPromise();

      // UI'ı güncelle
      trip.isShared = newShareStatus;
      
      // Event service varsa home page güncellemesi için
      if (this.eventService) {
        this.eventService.triggerRefreshHome();
      }

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
}