import { Component, OnInit } from "@angular/core";
import { AlertController, NavController } from "@ionic/angular";
import { getAuth } from "firebase/auth";
import { Router } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';


@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  user: any = null;
  locationCity: string = "";
  locationCountry: string = "";

  constructor(
    private alertController: AlertController,
    private navController: NavController,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.getUserProfile();
    this.locationService.locationCity$.subscribe(city => {
      this.locationCity = city;
    });

    this.locationService.locationCountry$.subscribe(country => {
      this.locationCountry = country;
    });
  }

  // Kullanıcı profilini almak
  private async getUserProfile() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.user = user;
      await this.locationService.getUserLocation();
    }
  }

  // Konum bilgisini güncelleme
  async updateLocation() {
    if (this.locationCity.trim() === "") {
      this.presentAlert("Please enter a valid location.");
      return;
    }

    try {
      await this.locationService.updateLocation(this.locationCity, this.locationCountry);
      this.presentAlert("Location updated successfully!");
    } catch (error) {
      this.presentAlert("Failed to update location.");
    }
  }

  // Alert gösterme
  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }

  // Profil fotoğrafını düzenleme
async editProfilePicture() {
  try {
    // 📌 Dosya seçimi
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        this.presentAlert('User not found.');
        return;
      }

      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${user.uid}`);

      // 🔼 Yükleme
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // 🔄 Kullanıcı profiline fotoğrafı ekle
      await updateProfile(user, {
        photoURL: downloadURL
      });

      // ⚡ Local user verisini güncelle
      this.user.photoURL = downloadURL;
      this.presentAlert('Profile picture updated successfully!');
    };
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    this.presentAlert('Failed to update profile picture.');
  }
}


  // Çıkış yapma
  async logOut() {
    try {
      const auth = getAuth();
      await signOut(auth);
      // Auth state'i temizle
      this.user = null;
      // Login sayfasına yönlendir
      await this.router.navigate(['/auth']);
      this.navController.setDirection('root');
    } catch (error) {
      console.error("Error logging out: ", error);
      this.presentAlert("Failed to log out.");
    }
  }
  goToPersonalInfo() {
  this.router.navigate(['/content/personal-info']);
}
  // Sayfa yeniden görünür olduğunda profili güncelle
  ionViewWillEnter() {
    this.getUserProfile();
  }

  // Component destroy olduğunda subscription'ları temizle
  ngOnDestroy() {
    // RxJS subscription'lar otomatik olarak temizlenecek
    // çünkü async pipe ve service'in providedIn: 'root' özelliğini kullanıyoruz
  }
}