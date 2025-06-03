import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RouteViewPage } from './route-view.page';

const routes: Routes = [
  {
    path: '',
    component: RouteViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteViewPageRoutingModule {}
