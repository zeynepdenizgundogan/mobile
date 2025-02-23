import { Injectable } from "@angular/core";
import { getAuth, signOut, User } from "firebase/auth";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth = getAuth();

  constructor() {}

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async getFirebaseToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken(); // Get Firebase ID Token
    }
    return null;
  }
}
