import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentPage } from './content.page';

const routes: Routes = [
  {
    path: '',
    component: ContentPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'calendar',
        loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarPageModule)
      },
      {
        path: 'create-route',
        loadChildren: () => import('./create-route/create-route.module').then(m => m.CreateRoutePageModule)
      },
      {
        path: 'trips',
        loadChildren: () => import('./trips/trips.module').then(m => m.TripsPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },  {
    path: 'calendar',
    loadChildren: () => import('./calendar/calendar.module').then( m => m.CalendarPageModule)
  },
  {
    path: 'trips',
    loadChildren: () => import('./trips/trips.module').then( m => m.TripsPageModule)
  },
  {
    path: 'create-route',
    loadChildren: () => import('./create-route/create-route.module').then( m => m.CreateRoutePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPageRoutingModule {}