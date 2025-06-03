import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouteViewPageRoutingModule } from './route-view-routing.module';

import { RouteViewPage } from './route-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouteViewPageRoutingModule
  ],
  declarations: [RouteViewPage]
})
export class RouteViewPageModule {}
