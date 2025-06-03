import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouteViewPage } from './route-view.page';

describe('RouteViewPage', () => {
  let component: RouteViewPage;
  let fixture: ComponentFixture<RouteViewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
