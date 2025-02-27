import { Component } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { environment } from "src/environments/environment.prod";
import { updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Firestore import edildi

@Component({
  selector: "app-signup",
  templateUrl: "./signup.page.html",
  styleUrls: ["./signup.page.scss"],
})
export class SignupPage {
  showPassword = false;
  name: string = "";
  surname: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";

  oApp = initializeApp(environment.firebaseConfig);
  oAuth = getAuth();
  db = getFirestore(); // Firestore referansını oluşturduk

  constructor(
    private alertController: AlertController,
    private navController: NavController,
    private http: HttpClient,
    private router: Router
  ) {
    this.setAuthPersistence();
  }

  private async setAuthPersistence(): Promise<void> {
    await setPersistence(this.oAuth, browserLocalPersistence);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSignup() {
    if (!this.email || !this.password) {
      this.presentAlert("Please enter a valid email and password.");
      return;
    }

    createUserWithEmailAndPassword(this.oAuth, this.email, this.password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.uid) {
          // Kullanıcı adı (username) bilgisini güncelle
          return updateProfile(user, {
            displayName: `${this.name} ${this.surname}`, // Ad ve soyadı birleştirerek kaydediyoruz
            photoURL: "https://www.w3schools.com/howto/img_avatar.png", // Varsayılan profil resmi
          }).then(() => {
            // Firestore'a location bilgisini ekle
            const userRef = doc(this.db, "users", user.uid); // Kullanıcıyı Firestore'da tanımlıyoruz
            return setDoc(userRef, {
              location: "Istanbul", // Kullanıcıya ait lokasyon bilgisini ekliyoruz
            }, { merge: true }); // merge: true ile mevcut verilere zarar vermiyoruz
          }).then(() => {
            this.presentAlert("Your account has been successfully created!");
            this.navController.navigateRoot('auth/login');
          });
        } else {
          throw new Error("User ID is missing.");
        }
      })
      .catch((error) => {
        console.log("Firebase Error Code:", error.code);
        console.log("Firebase Error Message:", error.message);

        let errorMessage = "An unknown error occurred. Please try again."; // Default error message

        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already associated with an account. Please log in instead.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address. Please check the format.";
            break;
          case "auth/weak-password":
            errorMessage = "Weak password. Please choose a stronger password (at least 6 characters).";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Sign-up is currently disabled. Please contact support.";
            break;
          default:
            errorMessage = error.message; // Firebase's default message if not handled
            break;
        }

        this.presentAlert(errorMessage);
      });
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
