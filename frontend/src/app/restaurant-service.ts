import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class RestaurantService {

  constructor(private httpClient: HttpClient) { }

  getRestaurants() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.httpClient.get(`http://localhost:4200/restaurants`, httpOptions);
  }

  getAvailableSeats(restaurantId: string, dateTime: Date | undefined) {
    if (dateTime) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };
      return this.httpClient.get(`http://localhost:4200/restaurants/${restaurantId}/bookings/${dateTime.toISOString().split('T')[0]}/booked-hours/${dateTime.getHours()}/available`, httpOptions);
    }
    return null;
  }

  reserve(restaurantId: string, customerName: string, dateTime: Date, tableSize: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const body = {
      "customer_name": customerName,
      "table_size": tableSize
    }
    return this.httpClient.post(`http://localhost:4200/restaurants/${restaurantId}/bookings/${dateTime.toISOString().split('T')[0]}/booked-hours/${dateTime.getHours()}`, body, httpOptions);
  }

  cancel(restaurantId: string, date: string, time: string, customer: string) {
    return this.httpClient.delete(`http://localhost:4200/restaurants/${restaurantId}/bookings/${date}/booked-hours/${time}?customer-name=${customer}`);
  }
}
