import { Component } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { environment } from "src/environments/environment.prod";
import { signOut } from "firebase/auth"; // Import signOut from Firebase

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage {
  user: any = null;
  location: string = "";  // Konum bilgisi için bir değişken

  oApp = initializeApp(environment.firebaseConfig);
  oAuth = getAuth();
  db = getFirestore(); // Firestore'a erişim için

  constructor(private alertController: AlertController, private navController: NavController) {
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
        this.location = docSnap.data()['location'] || ""; // Konum bilgisini alıyoruz
      } else {
        console.log("No such document!");
      }
    }
  }

  // Konum bilgisini Firestore'a kaydetme
  async updateLocation() {
    if (this.location.trim() === "") {
      this.presentAlert("Please enter a valid location.");
      return;
    }

    const user = this.oAuth.currentUser;
    if (user) {
      try {
        // Konum bilgisini Firestore'a kaydediyoruz
        const userRef = doc(this.db, "users", user.uid);
        await setDoc(userRef, { location: this.location }, { merge: true });
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
      await signOut(this.oAuth); // Firebase authentication sign out
      this.navController.navigateRoot('/auth/login'); // Doğru login sayfası yolunu kullanın
    } catch (error) {
      console.error("Error logging out: ", error);
      this.presentAlert("Failed to log out.");
    }
  }
}
