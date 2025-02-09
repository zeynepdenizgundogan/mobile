import { Component } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage {
  email: string = "";
  password: string = "";
  showPassword: boolean = false;

  constructor(
    private alertController: AlertController,
    private http: HttpClient,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    console.log("📩 Login butonuna basıldı.");
    console.log("✅ Girilen Email:", this.email);
    console.log("✅ Girilen Şifre:", this.password);

    if (!this.email || !this.password) {
      const alert = await this.alertController.create({
        header: "Hata",
        message: "Lütfen e-mail ve şifre girin!",
        buttons: ["OK"],
      });
      await alert.present();
      return;
    }

    const loginData = {
      email: this.email,
      password: this.password,
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post("http://localhost:5000/users/login", loginData)
      );

      console.log("✅ API Yanıtı:", response);

      const alert = await this.alertController.create({
        header: "Başarılı",
        message: "Giriş başarılı!",
        buttons: ["OK"],
      });
      await alert.present();

      // Kullanıcıyı ana sayfaya yönlendir
      this.router.navigate(["content/home"]);
    } catch (error: any) {
      console.error("❌ Login API Hatası:", error);
  
      const errorMessage = error.error?.error || "Giriş başarısız! Lütfen tekrar deneyin.";
  
      const alert = await this.alertController.create({
        header: "Hata",
        message: errorMessage,
        buttons: ["OK"],
      });
      await alert.present();
    }
  }
}
