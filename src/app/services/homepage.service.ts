import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // 📌 to interact with Rest APIs

@Injectable({
  providedIn: 'root'
})
export class HomepageService {

  constructor(private _httpClient: HttpClient) { }

  getAllItiniaries(){

  }

  getFilteredItiniaries(){

  }

  getSearchedItinaries(){

  }
}
