from flask import Flask, jsonify, request
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/bookings"
mongo = PyMongo(app)


TABLE_SIZE_COUNTS = {
    2: 2,
    4: 2,
    10: 2
}

OPEN_HOURS = {
    "open_at" : 12,
    "close_at" : 23,
}

@app.route("/restaurant/bookings", methods=["GET"])
def list_bookings():
    return jsonify(mongo.db.bookings.find())

@app.route("/restaurant/bookings/<string:date>", methods=["DELETE"])
def delete_booking(date):
    mongo.db.bookings.delete_one(filter={"date": date})
    return '', 204

@app.route("/restaurant/bookings", methods=["POST"])
def create_booking():
    requested_booking = request.get_json()

    if requested_booking["time"] < 0 or requested_booking["time"] > 23:
        return jsonify({"error": "Invalid time."}), 400

    if requested_booking["time"] < OPEN_HOURS["open_at"] or requested_booking["time"] > OPEN_HOURS["close_at"]:
        return jsonify({"error": "Restaurant is closed."}), 400

    if requested_booking["table_size"] not in TABLE_SIZE_COUNTS:
        return jsonify({"error": "We do not have an appropriate table. Available table sizes: {}".format(", ".join(map(lambda s: str(s), TABLE_SIZE_COUNTS.keys())))}), 400

    day = mongo.db.bookings.find_one(filter={ "date" : requested_booking["date"] }) or { "date" : requested_booking["date"], "booked_hours" : {} }

    if str(requested_booking["time"]) not in day["booked_hours"]:
        day["booked_hours"][str(requested_booking["time"])] = []

    booked_hour = day["booked_hours"][str(requested_booking["time"])]

    booked_count = len(list(filter(lambda t: t["table_size"] == requested_booking["table_size"], booked_hour)))
    if booked_count >= TABLE_SIZE_COUNTS[requested_booking["table_size"]]:
        return jsonify({"error": "All table of size {} are booked.".format(requested_booking["table_size"])}), 400
    booked_hour.append({"customer_name" : requested_booking["customer_name"], "table_size" : requested_booking["table_size"]})

    mongo.db.bookings.replace_one(filter={ "date" : requested_booking["date"] }, upsert=True, replacement=day)

    return '', 204

