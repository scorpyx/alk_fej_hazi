import { Component, inject, signal } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../restaurant-service';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-reservation',
  imports: [DatePickerModule, FormsModule, ButtonModule, OverlayBadgeModule],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css'
})
export class Reservation {
  twoSeatTable = signal<any>(0);
  fourSeatTable = signal<any>(0);
  tenSeatTable = signal<any>(0);
  date: Date | undefined;
  restaurantId: string | null;
  twoSeatSelected: boolean = false;
  fourSeatSelected: boolean = false;
  tenSeatSelected: boolean = false;

  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);

  constructor() {
    this.restaurantId = this.route.snapshot.paramMap.get('id'); 
  }

  onSubmit(form: any) {
        if (this.restaurantId != null && form.valid) {
            const restaurants = this.restaurantService.getAvailableSeats(this.restaurantId, this.date);
            if(restaurants != null) {
              restaurants.subscribe(
                {
                  next: (data: any) => {
                    console.log("yo");
                    this.twoSeatTable.set(data["2"]);
                    this.fourSeatTable.set(data["4"]);
                    this.tenSeatTable.set(data["10"]);
                  },
                  error: (data: any) => {
                    console.log(data);
                  }
                }
              );
            }
            form.resetForm();
        }
    }

    twoSeatToggle() {
      this.twoSeatSelected = !this.twoSeatSelected;
      this.fourSeatSelected = false;
      this.tenSeatSelected = false;
    }

    fourSeatToggle() {
      this.fourSeatSelected = !this.fourSeatSelected;
      this.twoSeatSelected = false;
      this.tenSeatSelected = false;
    }

    tenSeatToggle() {
      this.tenSeatSelected = !this.tenSeatSelected;
      this.twoSeatSelected = false;
      this.fourSeatSelected = false;
    }
}
