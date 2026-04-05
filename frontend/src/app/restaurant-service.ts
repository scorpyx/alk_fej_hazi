import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class RestaurantService {

  constructor(private httpClient: HttpClient) {}

  getRestaurants() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.httpClient.get(`http://localhost:4200/restaurants`, httpOptions);
  }

  getAvailableSeats(restaurantId: string, dateTime: Date | undefined) {
    if(dateTime) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json'
        })
      };
      return this.httpClient.get(`http://localhost:4200/restaurants/${restaurantId}/bookings/${dateTime.toISOString().split('T')[0]}/booked-hours/${dateTime.getHours()}/available`, httpOptions);
    }
    return null;
  }
}
