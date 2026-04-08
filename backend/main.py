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

@app.route("/restaurants/<string:restaurant_id>/bookings", methods=["POST"])
def create_booking(restaurant_id):
    restaurant = mongo.db.restaurants.find_one({"_id" : ObjectId(restaurant_id)}, {"name": 1, "open_at": 1, "close_at": 1, "table_size_counts": 1})
    print(restaurant)
    if restaurant is None:
        return {"error": "Invalid offset or limit"}, 404

    requested_booking = request.get_json()

    if requested_booking["time"] < 0 or requested_booking["time"] > 23:
        return jsonify({"error": "Invalid time."}), 400

    if requested_booking["time"] < restaurant["open_at"] or requested_booking["time"] > restaurant["close_at"]:
        return jsonify({"error": "Restaurant is closed."}), 400

    if str(requested_booking["table_size"]) not in restaurant["table_size_counts"]:
        return jsonify({"error": "We do not have an appropriate table. Available table sizes: {}".format(", ".join(map(lambda s: s, restaurant["table_size_counts"])))}), 400

    day = mongo.db.bookings.find_one({"restaurant_id" : ObjectId(restaurant_id), "date": requested_booking["date"]})  or { "date" : requested_booking["date"], "booked_hours" : {} }

    if str(requested_booking["time"]) not in day["booked_hours"]:
        day["booked_hours"][str(requested_booking["time"])] = []

    booked_hour = day["booked_hours"][str(requested_booking["time"])]

    booked_count = len(list(filter(lambda t: t["table_size"] == requested_booking["table_size"], booked_hour)))
    if booked_count >= restaurant["table_size_counts"][str(requested_booking["table_size"])]:
        return jsonify({"error": "All table of size {} are booked.".format(requested_booking["table_size"])}), 400
    booked_hour.append({"customer_name" : requested_booking["customer_name"], "table_size" : requested_booking["table_size"]})

    mongo.db.bookings.replace_one({"restaurant_id" : ObjectId(restaurant_id), "date": requested_booking["date"]}, upsert=True, replacement=day)

    return '', 204

