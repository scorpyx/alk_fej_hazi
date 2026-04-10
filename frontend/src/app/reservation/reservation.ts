import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../restaurant-service';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reservation',
  imports: [DatePickerModule, FormsModule, ButtonModule, OverlayBadgeModule, InputTextModule, FloatLabelModule,],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css'
})
export class Reservation {
  restaurantId: string | null;

  date = new Date();
  customer: string | undefined;


  twoSeatTable = signal<any>(0);
  fourSeatTable = signal<any>(0);
  tenSeatTable = signal<any>(0);

  twoSeatSelected = false;
  fourSeatSelected = false;
  tenSeatSelected = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);
  private messageService = inject(MessageService);

  constructor() {
    this.restaurantId = this.route.snapshot.paramMap.get('id');
    this.date.setMinutes(0);
  }

  ngOnInit() {
    this.getAvailableSeats();
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

  getAvailableSeats() {
    if (this.restaurantId != null) {
      const restaurants = this.restaurantService.getAvailableSeats(this.restaurantId, this.date);
      if (restaurants != null) {
        restaurants.subscribe(
          {
            next: (data: any) => {
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

  reserve() {
    if (this.restaurantId == null) {
      this.showError("Restaurant does not exist.")
      return;
    }
    if (this.customer == null) {
      this.showError("You must enter a name for your reservation")
      return;
    }
    if (this.getTableSize() == -1) {
      this.showError("You did not choose a table size.")
      return;
    }
    this.restaurantService.reserve(this.restaurantId, this.customer, this.date, this.getTableSize()).subscribe({
      next: (data: any) => {
        this.router.navigate(['/reservation', this.restaurantId, "success"], {
          queryParams: {date: this.date.toISOString().split('T')[0], time: this.date.getHours(), customer : this.customer},
        });
      },
      error: (data: any) => {
        this.showError(data["error"]["msg"])
      }
    });

  }

  private getTableSize() {
    if (this.twoSeatSelected) {
      return 2;
    }
    if (this.fourSeatSelected) {
      return 4;
    }
    if (this.tenSeatSelected) {
      return 10;
    }
    return -1;
  }

  
  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message })
  }
}
