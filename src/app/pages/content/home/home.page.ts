import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  // Tanımlamanız gereken popularItems dizisi
  popularItems = [
    {
      name: 'Beach Paradise',
      location: 'Bali, Indonesia',
      rating: 4.8,
      image: 'assets/images/beach.jpg',
      userAvatar: 'assets/images/user1.jpg',
    },
    {
      name: 'Mountain Adventure',
      location: 'Aspen, Colorado',
      rating: 4.5,
      image: 'assets/images/mountain.jpg',
      userAvatar: 'assets/images/user2.jpg',
    },
  ];

  constructor() {}
}
