from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import json

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/bookings"
mongo = PyMongo(app)


count = mongo.db.restaurants.count_documents({})
if count == 0:
    with open("restaurants.json", "r", encoding="utf-8") as file:
        restaurants = json.load(file)
        mongo.db.restaurants.insert_many(restaurants)


@app.route("/restaurants", methods=["GET"])
def list_restaurants():
    return jsonify(mongo.db.restaurants.find({}, {"name": 1, "location": 1}))

@app.route("/restaurants/<string:restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):
    return jsonify(mongo.db.restaurants.find_one({"_id" : ObjectId(restaurant_id)}))

@app.route("/restaurants/<string:restaurant_id>/bookings", methods=["GET"])
def list_all_bookings(restaurant_id):
    return jsonify(mongo.db.bookings.find({"restaurant_id" : ObjectId(restaurant_id)}))

@app.route("/restaurants/<string:restaurant_id>/bookings/<string:date>", methods=["GET"])
def list_bookings(restaurant_id, date):
    return jsonify(mongo.db.bookings.find_one({"restaurant_id" : ObjectId(restaurant_id), "date": date}))

@app.route("/restaurants/<string:restaurant_id>/bookings/<string:date>/booked-hours/<int:time>/available", methods=["GET"])
def available_tables(restaurant_id, date, time):
    booking = mongo.db.bookings.find_one({"date": date, "restaurant_id": ObjectId(restaurant_id)})
    restaurant = mongo.db.restaurants.find_one({"_id": ObjectId(restaurant_id)},
                                               {"open_at": 1, "close_at": 1, "table_size_counts": 1})

    if booking is None:
        return jsonify(restaurant["table_size_counts"])

    table_size_counts = restaurant["table_size_counts"]
    if str(time) in booking["booked_hours"]:
        booked_tables = booking["booked_hours"][str(time)]
        for booked_table in booked_tables:
            table_size_counts[str(booked_table["table_size"])] = table_size_counts[str(booked_table["table_size"])] - 1

    return jsonify(table_size_counts)

@app.route("/restaurants/<string:restaurant_id>/bookings/<string:date>/booked-hours/<int:time>", methods=["DELETE"])
def delete_booking(restaurant_id, date, time):
    customer_name = request.args.get('customer-name')
    mongo.db.bookings.update_one({"restaurant_id": ObjectId(restaurant_id), "date": date}, { "$pull": {"booked_hours.{}".format(time): {"customer_name" : customer_name}}} )
    return '', 204

@app.route("/restaurants/<string:restaurant_id>/bookings/<string:date>/booked-hours/<int:time>", methods=["PUT"])
def update_booking(restaurant_id, date, time):
    requested_booking = request.get_json()

    customer_name = requested_booking['customer_name']
    table_size = requested_booking['table_size']
    new_date = requested_booking['date'] if 'date' in requested_booking else None
    new_time = requested_booking['time'] if 'time' in requested_booking else None

    bookings = mongo.db.bookings.find_one({"restaurant_id": ObjectId(restaurant_id), "date": date})
    if bookings is None:
        return jsonify({"error": "Booking does not exist"})

    booked_hour = bookings["booked_hours"][str(time)]
    if booked_hour is None:
        return jsonify({"error": "Booking does not exist"})

    if len(list(filter(lambda t: t["customer_name"] == customer_name, booked_hour))) == 0:
        return jsonify({"error": "You do not have a booking for that time."}), 400

    if new_date is not None:
        bookings_for_new_date = mongo.db.bookings.find_one({"restaurant_id": ObjectId(restaurant_id), "date": new_date})
        if bookings_for_new_date is None:
            mongo.db.bookings.insert_one({ "restaurant_id": ObjectId(restaurant_id), "date" : new_date, "booked_hours" : {} })

    if new_time is not None:
        bookings_for_new_time = mongo.db.bookings.find_one({"restaurant_id": ObjectId(restaurant_id), "date": new_date or date,"booked_hours.{}".format(new_time): {"$exists": "true"}})
        if bookings_for_new_time is None:
            mongo.db.bookings.update_one({"restaurant_id": ObjectId(restaurant_id), "date": new_date or date}, {'$set': {'booked_hours.{}'.format(new_time): []}})


    mongo.db.bookings.update_one({"restaurant_id": ObjectId(restaurant_id), "date": date}, { "$pull": {"booked_hours.{}".format(time): {"customer_name" : customer_name}}} )
    mongo.db.bookings.update_one({"restaurant_id": ObjectId(restaurant_id), "date": new_date or date},
                                 {"$push": {"booked_hours.{}".format(new_time or time): {"customer_name": customer_name, "table_size": table_size }}})

    return '', 204

@app.route("/restaurants/<string:restaurant_id>/bookings/<string:date>/booked-hours/<int:time>", methods=["POST"])
def create_booking(restaurant_id, date, time):
    restaurant = mongo.db.restaurants.find_one({"_id" : ObjectId(restaurant_id)}, {"name": 1, "open_at": 1, "close_at": 1, "table_size_counts": 1})
    if restaurant is None:
        return {"error": "Restaurant does not exist."}, 404

    requested_booking = request.get_json()
    customer_name = requested_booking['customer_name']
    table_size = requested_booking['table_size']

    if time < 0 or time > 23:
        return jsonify({"error": "Invalid time."}), 400

    if time < restaurant["open_at"] or time > restaurant["close_at"]:
        return jsonify({"error": "Restaurant is closed."}), 400

    if str(table_size) not in restaurant["table_size_counts"]:
        return jsonify({"error": "We do not have an appropriate table. Available table sizes: {}".format(", ".join(map(lambda s: s, restaurant["table_size_counts"])))}), 400

    bookings = mongo.db.bookings.find_one({"restaurant_id" : ObjectId(restaurant_id), "date": date})  or { "restaurant_id": ObjectId(restaurant_id), "date" : date, "booked_hours" : {} }

    if str(time) not in bookings["booked_hours"]:
        bookings["booked_hours"][str(time)] = []

    booked_hour = bookings["booked_hours"][str(time)]

    booked_count = len(list(filter(lambda t: t["table_size"] == table_size, booked_hour)))
    if booked_count >= restaurant["table_size_counts"][str(table_size)]:
        return jsonify({"error": "All table of size {} are booked.".format(table_size)}), 400

    if len(list(filter(lambda t: t["customer_name"] == customer_name, booked_hour))) > 0:
        return jsonify({"error": "You are already booked for that time."}), 400

    booked_hour.append({"customer_name" : customer_name, "table_size" : table_size})

    mongo.db.bookings.replace_one({"restaurant_id" : ObjectId(restaurant_id), "date": date}, upsert=True, replacement=bookings)

    return '', 204

