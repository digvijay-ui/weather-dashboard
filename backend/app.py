from copy import deepcopy
from datetime import datetime, timezone
import time

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests


CURRENT_WEATHER_URL = "https://api.jsonbin.io/v3/b/6981949143b1c97be9616e06"
FORECAST_URL = "https://api.jsonbin.io/v3/b/698194e3d0ea881f409cdb34"
ERROR_URL = "https://api.jsonbin.io/v3/b/69819517ae596e708f0d49ff"

DEFAULT_CITY = "Bengaluru"
VALID_CITY = "bengaluru"
REQUEST_TIMEOUT_SECONDS = 10

SERVICE_ERROR_RESPONSE = {
    "status": "error",
    "error": {
        "code": "WEATHER_SERVICE_ERROR",
        "message": "Unable to retrieve weather data. Please try again.",
    },
}


class WeatherServiceError(Exception):
    pass


app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])


def fetch_record_payload(url, require_data=True):
    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise WeatherServiceError from exc

    record = payload.get("record") if isinstance(payload, dict) else None
    if not isinstance(record, dict):
        raise WeatherServiceError

    if require_data and "data" not in record:
        raise WeatherServiceError

    return record


def get_city_param():
    return request.args.get("city", DEFAULT_CITY)


def is_supported_city(city):
    return city.lower() == VALID_CITY


def json_response(payload, status_code):
    return jsonify(payload), status_code


def weather_service_error_response():
    return json_response(SERVICE_ERROR_RESPONSE, 502)


def current_temperature():
    return 29 if (int(time.time()) // 5) % 2 == 0 else 30


def current_condition(temperature):
    return "Partly Cloudy" if temperature == 29 else "Cloudy"


def current_iso_time():
    return datetime.now(timezone.utc).isoformat()


def city_not_found_response():
    error_data = fetch_record_payload(ERROR_URL, require_data=False)
    return json_response(error_data, 404)


@app.errorhandler(WeatherServiceError)
def handle_weather_service_error(_exc):
    return weather_service_error_response()


@app.errorhandler(Exception)
def handle_internal_error(_exc):
    return json_response(
        {
            "status": "error",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Internal server error.",
            },
        },
        500,
    )


@app.get("/api/health")
def health():
    return json_response(
        {
            "status": "success",
            "message": "Weather server is running",
        },
        200,
    )


@app.get("/api/weather/current")
def current_weather():
    city = get_city_param()
    if not is_supported_city(city):
        return city_not_found_response()

    weather_data = deepcopy(fetch_record_payload(CURRENT_WEATHER_URL))
    temperature = current_temperature()
    weather_data["data"]["temperatureC"] = temperature
    weather_data["data"]["condition"] = current_condition(temperature)
    weather_data["data"]["updatedAtIso"] = current_iso_time()

    return json_response(weather_data, 200)


@app.get("/api/weather/forecast")
def forecast():
    city = get_city_param()
    if not is_supported_city(city):
        return city_not_found_response()

    forecast_data = fetch_record_payload(FORECAST_URL)
    return json_response(forecast_data, 200)


@app.get("/api/weather/error")
def weather_error():
    return city_not_found_response()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=6688, debug=True)
