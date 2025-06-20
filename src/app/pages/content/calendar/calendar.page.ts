import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
        this.loadUserRoutes(userId);
      }
    });
  }

  loadUserRoutes(userId: string) {
    this.http.get<any>(`http://localhost:5001/api/routes/${userId}`).subscribe(
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
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = new Date(d).toISOString().split('T')[0];
        const currentDate = new Date(d);
        currentDate.setHours(0, 0, 0, 0);
        
        // Tarihe göre renk belirleme
        let textColor = '#ffffff';
        let backgroundColor = '#3880ff'; // Varsayılan mavi (gelecek)
        
        if (currentDate < today) {
          // Geçmiş tarihler için gri
          backgroundColor = '#92949c';
        } else if (currentDate.getTime() === today.getTime()) {
          // Bugün için yeşil
          backgroundColor = '#2dd36f';
        }
        
        dateMap.set(dateStr, {
          date: dateStr,
          textColor: textColor,
          backgroundColor: backgroundColor
        });
      }
    });
    
    this.highlightedDates = Array.from(dateMap.values());
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail.value;
    this.filterRoutesByDate();
  }

  filterRoutesByDate() {
    const selected = new Date(this.selectedDate);
    selected.setHours(0, 0, 0, 0);
    const selectedStr = selected.toISOString().split('T')[0];
    
    this.selectedRoutes = this.allRoutes.filter(route => {
      const start = new Date(route.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(route.endDate);
      end.setHours(0, 0, 0, 0);
      
      return selected >= start && selected <= end;
    });
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
}