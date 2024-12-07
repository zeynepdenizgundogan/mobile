import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

/**
 * SignupPage component handles the user signup functionality.
 * It includes form fields for name, email, password, and re-entered password.
 * It also includes a toggle for password visibility and a checkbox for terms acceptance.
 */
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  showPassword = false; // Indicates whether the password is visible or not.
  name: string = ''; // Stores the user's name.
  email: string = ''; // Stores the user's email.
  password: string = ''; // Stores the user's password.
  rePassword: string = ''; // Stores the re-entered password for confirmation.
  termsAccepted: boolean = false; // Indicates whether the user has accepted the terms and conditions.

  /**
   * Constructor for SignupPage.
   * @param alertController - Injects AlertController for displaying alerts.
   */
  constructor(private alertController: AlertController) { }
  
  /**
   * Toggles the visibility of the password field.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  /**
   * Handles the signup process.
   * Validates the terms acceptance and password match.
   * Displays appropriate alerts if validation fails.
   * Logs the signup data to the console.
   */
  async onSignup() {
    if (!this.termsAccepted) {
      const alert = await this.alertController.create({
        header: 'Terms and Conditions',
        message: 'You must accept the terms and conditions to sign up.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.password !== this.rePassword) {
      const alert = await this.alertController.create({
        header: 'Password Mismatch',
        message: 'Passwords do not match.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const signupData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    // Backend API call will be made here
    console.log('Sign up data:', signupData);
    // For example, you can make an API call using HttpClient
    // this.http.post('https://api.example.com/signup', signupData)
    //   .subscribe(response => {
    //     console.log('Sign up successful', response);
    //   }, error => {
    //     console.error('Sign up error', error);
    //   });
  }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {
  }
}
