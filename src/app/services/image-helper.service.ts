import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageHelperService {
  getProxiedImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/images/placeholder.jpg';
    return `${environment.apiUrl}/image/proxy-photo?photourl=${encodeURIComponent(url)}`;
  }
}
