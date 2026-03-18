from datetime import datetime

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def extract_date_parts(date_value):
    formats = ["%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y"]

    for fmt in formats:
        try:
            parsed_date = datetime.strptime(date_value, fmt)
            return {
                "month": parsed_date.month,
                "date": parsed_date.day,
                "year": parsed_date.year,
            }
        except ValueError:
            continue

    raise ValueError("Unsupported date format. Use YYYY-MM-DD.")


def extract_time_parts(time_value):
    formats = ["%H:%M:%S", "%H:%M", "%I:%M:%S %p", "%I:%M %p"]

    for fmt in formats:
        try:
            parsed_time = datetime.strptime(time_value, fmt)
            return {
                "hour": parsed_time.hour,
                "minute": parsed_time.minute,
                "second": parsed_time.second,
            }
        except ValueError:
            continue

    raise ValueError("Unsupported time format. Use HH:MM:SS.")


def process_time_request():
    date_value = request.form.get("date")
    time_value = request.form.get("time")

    if not isinstance(date_value, str) or not isinstance(time_value, str):
        return jsonify({"error": "Both date and time are required in form data."}), 400

    try:
        date_parts = extract_date_parts(date_value)
        time_parts = extract_time_parts(time_value)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(
        {
            "date_info": date_parts,
            "time_info": time_parts,
        }
    )


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/", methods=["POST"])
def route():
    return process_time_request()


if __name__ == "__main__":
    app.run(debug=True)
