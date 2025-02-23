import { Component, OnInit } from '@angular/core';
import { AlertController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail, setPersistence, browserLocalPersistence } from "firebase/auth";
import { environment } from "src/environments/environment.prod";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
    // Initialize Firebase
    oApp = initializeApp(environment.firebaseConfig);

    // Initialize Firebase Authentication and get a reference to the service
    oAuth = getAuth(this.oApp);

   email: string = "";
 
   constructor(
    private alertController: AlertController,
    private http: HttpClient,
    private router: Router
  ) {
    this.setAuthPersistence();
  }

  private async setAuthPersistence(): Promise<void> {
    await setPersistence(this.oAuth, browserLocalPersistence);
  }
  async onForgotPassword() {
    if (!this.email || this.email.trim() === "") {
        alert("Lütfen geçerli bir e-posta adresi girin.");
        return;
    }

    sendPasswordResetEmail(this.oAuth, this.email)
    .then(() => {
        this.presentAlert("You have been sent an email");
    })
    .catch((error) => {
        console.error("Hata kodu:", error.code);
        console.error("Hata mesajı:", error.message);
        if (error.code === "auth/user-not-found") {
            alert("Bu e-posta adresi sistemde kayıtlı değil.");
        } else {
            alert("Bir hata oluştu: " + error.message);
        }
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