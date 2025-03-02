import { Component } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { environment } from "src/environments/environment.prod";
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { Router } from '@angular/router';

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage {
  user: any = null;
  locationCity: string = "";  // Konum bilgisi için bir değişken
  locationCountry: string = "";

  oApp = initializeApp(environment.firebaseConfig);
  oAuth = getAuth();
  db = getFirestore(); // Firestore'a erişim için

  constructor(private alertController: AlertController, private navController: NavController, private router: Router) {
    this.getUserProfile();
  }

  // Kullanıcı profilini almak
  private async getUserProfile() {
    const user = this.oAuth.currentUser;
    if (user) {
      this.user = user;
      // Firestore'dan kullanıcının konum bilgisini alıyoruz
      const userRef = doc(this.db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        this.locationCity = docSnap.data()['locationCity'] || ""; // Konum bilgisini alıyoruz
        this.locationCountry = docSnap.data()['locationCountry'] || "";
      } else {
        console.log("No such document!");
      }
    }
  }

  // Konum bilgisini Firestore'a kaydetme
  async updateLocation() {
    if (this.locationCity.trim() === "") {
      this.presentAlert("Please enter a valid location.");
      return;
    }

    const user = this.oAuth.currentUser;
    if (user) {
      try {
        // Konum bilgisini Firestore'a kaydediyoruz
        const userRef = doc(this.db, "users", user.uid);
        await setDoc(userRef, { location: this.locationCity }, { merge: true });
        this.presentAlert("Location updated successfully!");
      } catch (error) {
        this.presentAlert("Failed to update location.");
      }
    }
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }
  // Edit profile picture method
  editProfilePicture() {
    // Logic to edit profile picture (e.g., opening camera or file selector)
    console.log("Edit profile picture clicked");
  }

  // Log out method
  async logOut() {
    try {
      await signOut(this.oAuth);
      // Önce auth state'i temizleyelim
      this.user = null;
      // Hem router hem navController kullanalım
      await this.router.navigate(['/auth/login']);
      this.navController.setDirection('root');
    } catch (error) {
      console.error("Error logging out: ", error);
      this.presentAlert("Failed to log out.");
    }
  }
}
