import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RestaurantService } from '../restaurant-service';

@Component({
  selector: 'app-reserved',
  imports: [ButtonModule],
  templateUrl: './reserved.html',
  styleUrl: './reserved.css',
})
export class Reserved {

  restaurantId: string | null;
  date: string | null;
  time: string | null;
  customer: string | null;


  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);

  constructor() {
    this.restaurantId = this.route.snapshot.paramMap.get('id');
    this.date = this.route.snapshot.queryParamMap.get('date');
    this.time = this.route.snapshot.queryParamMap.get('time');
    this.customer = this.route.snapshot.queryParamMap.get('customer');
  }

  cancel() {
    if (this.restaurantId == null || this.date == null || this.time == null || this.customer == null) {
      // TODO
      return;
    }
    this.restaurantService.cancel(this.restaurantId, this.date, this.time, this.customer).subscribe({
      next: (data: any) => {
        this.router.navigate(['/reservation', this.restaurantId, "cancelled"]);
      },
      error: (data: any) => {
        console.log(data);
      }
    })
  }

}
