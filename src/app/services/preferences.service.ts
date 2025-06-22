import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '../models/preferences.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private apiUrl = `${environment.apiUrl}/preferences`;

  constructor(private http: HttpClient) {}
  getOptimizedRoutes(preference: Preferences) {
    return this.http.post<any>(this.apiUrl, preference);
  }
  /**
   * Kullanıcı tercihlerini backend'e POST eder.
   * @param preferences Kullanıcının girdiği tercihler (model yapısında)
   */
  savePreferences(preferences: Preferences): Observable<any> {
    return this.http.post<any>(this.apiUrl, preferences);
  }

  /**
   * Belirli bir kullanıcıya ait tercihleri backend'den getirir.
   * @param userId Kullanıcı ID'si
   */
  getPreferencesByUserId(userId: number): Observable<Preferences> {
    return this.http.get<Preferences>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Tercih güncelleme işlemi (PUT).
   * @param preferences Güncellenecek preferences nesnesi
   */
  updatePreferences(preferences: Preferences): Observable<any> {
    return this.http.put(`${this.apiUrl}/${preferences.id}`, preferences);
  }

  /**
   * Tercih silme işlemi.
   * @param id Silinecek preference ID'si
   */
  deletePreferences(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
