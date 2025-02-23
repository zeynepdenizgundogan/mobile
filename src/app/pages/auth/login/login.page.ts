import { Component, OnInit } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { environment } from "src/environments/environment.prod";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage{
  // Initialize Firebase
  oApp = initializeApp(environment.firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  oAuth = getAuth(this.oApp);

  email: string = "";
  password: string = "";
  showPassword: boolean = false;

  constructor(
    private alertController: AlertController,
    private http: HttpClient,
    private router: Router,
    private navController: NavController
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    signInWithEmailAndPassword(this.oAuth, this.email, this.password)
    .then((userCredential) => {
        const user = userCredential.user;
        if (user.uid !== undefined && user.uid !== '') {
            this.navController.navigateRoot('content/home');
        } else {
            this.presentAlert("Login failed. Please check your credentials.");
        }
    })
    .catch((error) => {
        console.log(error.code);
        console.log(error.message);

        let errorMessage = "An unknown error occurred. Please try again."; // Default error message

        switch (error.code) {
            case "auth/invalid-email":
                errorMessage = "Invalid email address. Please check the format.";
                break;
            case "auth/user-not-found":
                errorMessage = "No account found with this email.";
                break;
            case "auth/wrong-password":
                errorMessage = "Incorrect password. Please try again.";
                break;
            case "auth/user-disabled":
                errorMessage = "This account has been disabled. Please contact support.";
                break;
            case "auth/too-many-requests":
                errorMessage = "Too many failed attempts. Please wait and try again later.";
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
