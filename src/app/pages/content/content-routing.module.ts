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
        path: 'route',
        loadChildren: () => import('./route/route.module').then( m => m.RoutePageModule)
      },
      {
        path: 'route-view',
        loadChildren: () => import('./route-view/route-view.module').then( m => m.RouteViewPageModule)
      },
        {
        path: 'personal-info',
        loadChildren: () => import('./personal-info/personal-info.module').then( m => m.PersonalInfoPageModule)
      },  
      
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },


];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPageRoutingModule {}