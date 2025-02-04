import { Component } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.page.html",
  styleUrls: ["./signup.page.scss"],
})
export class SignupPage {
  showPassword = false;
  name: string = "";
  surname: string = "";  // ✅ Eklendi
  email: string = "";
  password: string = "";
  confirmPassword: string = "";  // ✅ Eklendi

  constructor(
    private alertController: AlertController,
    private http: HttpClient
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSignup() {
    console.log("✅ Girilen Şifre:", this.password);
  console.log("✅ Girilen Şifre (Tekrar):", this.confirmPassword);

    if (!this.name || !this.surname || !this.email || !this.password || !this.confirmPassword) {
      const alert = await this.alertController.create({
        header: "Hata",
        message: "Lütfen tüm alanları doldurun!",
        buttons: ["OK"],
      });
      await alert.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const alert = await this.alertController.create({
        header: "Hata",
        message: "Şifreler uyuşmuyor!",
        buttons: ["OK"],
      });
      await alert.present();
      return;
    }

    const signupData = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      confirmPassword:this.confirmPassword
    };

    console.log("🔹 API'ye Gönderilen Signup Data:", signupData);

    try {
      const response = await firstValueFrom(
        this.http.post("http://localhost:5000/users/signup", signupData)
      );

      console.log("✅ API Yanıtı:", response);

      const alert = await this.alertController.create({
        header: "Başarılı",
        message: "Kayıt işlemi tamamlandı!",
        buttons: ["OK"],
      });
      await alert.present();
    } catch (error: any) {
      console.error("❌ Signup API Hatası:", error);

      const alert = await this.alertController.create({
        header: "Hata",
        message: error?.error?.message || "Kayıt başarısız! Lütfen tekrar deneyin.",
        buttons: ["OK"],
      });
      await alert.present();
    }
  }
}
