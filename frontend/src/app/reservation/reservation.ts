import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  date = new Date();
  restaurantId: string | null;
  twoSeatSelected = false;
  fourSeatSelected = false;
  tenSeatSelected = false;

  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);

  constructor() {
    this.restaurantId = this.route.snapshot.paramMap.get('id');

  }

  ngOnInit() {
    this.getAvailableSeats();
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.getAvailableSeats();
    }
  }

  onModelChange(event: any, form: any) {
    console.log("event");
    console.log(this.date);
    console.log(event);
    if(this.date.getFullYear() != event.getFullYear() || 
      this.date.getMonth() != event.getMonth() || 
      this.date.getDate() != event.getDate()) {
        console.log("only date change");
        form.ngSubmit.emit()
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

  dateSelected() {

  }

  private getAvailableSeats() {
    if (this.restaurantId != null) {
      const restaurants = this.restaurantService.getAvailableSeats(this.restaurantId, this.date);
      if (restaurants != null) {
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
    }
  }
}
