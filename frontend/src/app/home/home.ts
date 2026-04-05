import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { RestaurantService } from '../restaurant-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ButtonModule, DataViewModule, TagModule, RouterModule],
  providers: [RestaurantService],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit  {
  private restaurantService = inject(RestaurantService);
  restaurants = signal<any>([]);

  ngOnInit() {
      this.restaurantService.getRestaurants().subscribe((data) => {
          this.restaurants.set(data);
      });
  }
}
