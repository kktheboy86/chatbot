import json
from datetime import datetime

from flask import Flask, render_template, request

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


@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "GET":
        return render_template("index.html")

    # Ignore prompt content for backend calculation.
    prompt_text = (request.form.get("prompt") or "").strip()

    now_value = datetime.now()
    date_value = now_value.strftime("%Y-%m-%d")
    time_value = now_value.strftime("%H:%M:%S")

    date_parts = extract_date_parts(date_value)
    time_parts = extract_time_parts(time_value)

    extracted_values = {
        "date_info": date_parts,
        "time_info": time_parts,
    }

    return render_template(
        "index.html",
        submitted_prompt=prompt_text,
        extracted_values=extracted_values,
        extracted_values_pretty=json.dumps(extracted_values, indent=2),
    )


if __name__ == "__main__":
    app.run(debug=True)
