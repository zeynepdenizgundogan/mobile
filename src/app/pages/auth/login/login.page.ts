import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';

  // This property controls whether the password is shown or hidden
  showPassword: boolean = false;

  // This method toggles the value of showPassword, which controls the input type
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  constructor() { }

  ngOnInit() {
  }

  onLogin() {

  }

}
