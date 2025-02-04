import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SignupService {
  private apiUrl = "http://localhost:5000/users/signup";  // 📌 Backend API URL

  constructor(private http: HttpClient) {}

  signup(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}
