from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_KEY = '203a0343366de9674ec987cdd0bc079b'  # Your OpenWeatherMap API key

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather', methods=['POST'])
def get_weather():
    city = request.form.get('city')
    country_code = request.form.get('countryCode')
    
    if not city:
        return jsonify({'error': 'Please enter a city name.'}), 400
    
    # Fetch current weather data
    weather_url = f'https://api.openweathermap.org/data/2.5/weather?q={city},{country_code}&units=metric&appid={API_KEY}'
    response = requests.get(weather_url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Location not found.'}), 404
    
    data = response.json()
    
    # Prepare the response data
    weather_data = {
        'city': data['name'],
        'temperature': int(data['main']['temp']),
        'description': data['weather'][0]['description'],
        'humidity': data['main']['humidity'],
        'wind_speed': int(data['wind']['speed']),
        'icon': data['weather'][0]['icon'],
        'lat': data['coord']['lat'],
        'lon': data['coord']['lon']
    }
    
    # Fetch 4-day forecast data
    forecast_url = f'https://api.openweathermap.org/data/2.5/forecast?lat={weather_data["lat"]}&lon={weather_data["lon"]}&cnt=16&units=metric&appid={API_KEY}'
    forecast_response = requests.get(forecast_url)
    
    if forecast_response.status_code == 200:
        forecast_data = forecast_response.json()
        weather_data['forecast'] = []
        
        for i in range(0, 16, 4):
            day_forecast = forecast_data['list'][i:i+4]
            weather_data['forecast'].append({
                'date': day_forecast[0]['dt'],
                'temp_max': int(day_forecast[0]['main']['temp_max']),
                'temp_min': int(day_forecast[0]['main']['temp_min']),
                'description': day_forecast[0]['weather'][0]['description'],
                'icon': day_forecast[0]['weather'][0]['icon']
            })
    
    return jsonify(weather_data)

if __name__ == '__main__':
    app.run(debug=True)