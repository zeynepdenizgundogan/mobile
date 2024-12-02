import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    // Uygulama ana sayfasına erişildiğinde 'auth/login' sayfasına yönlendirme yapıyoruz
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  
  // 'auth' rotası için, 'AuthPageModule' modülünü yüklemeye ayarlıyoruz
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule)
  },
  
  // 'content' rotası için, 'ContentPageModule' modülünü yüklemeye ayarlıyoruz
  {
    path: 'content',
    loadChildren: () => import('./pages/content/content.module').then(m => m.ContentPageModule)
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
