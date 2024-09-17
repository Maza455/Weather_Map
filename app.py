from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_KEY = '16793aa4d20dfc1d893472dfe41db7b6'  # Replace with your OpenWeatherMap API key

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather', methods=['POST'])
def get_weather():
    city = request.form.get('city')
    country_code = request.form.get('countryCode')
    
    if not city or not country_code:
        return jsonify({'error': 'Please enter both city and country code.'}), 400
    
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
    
    # Fetch 5-day forecast data
    forecast_url = f'https://api.openweathermap.org/data/2.5/forecast/daily?lat={weather_data["lat"]}&lon={weather_data["lon"]}&cnt=5&units=metric&appid={API_KEY}'
    forecast_response = requests.get(forecast_url)
    
    if forecast_response.status_code == 200:
        forecast_data = forecast_response.json()
        weather_data['forecast'] = []
        
        for day in forecast_data['list']:
            weather_data['forecast'].append({
                'date': day['dt'],
                'temp_max': int(day['temp']['max']),
                'temp_min': int(day['temp']['min']),
                'description': day['weather'][0]['description'],
                'icon': day['weather'][0]['icon']
            })
    
    return jsonify(weather_data)

if __name__ == '__main__':
    app.run(debug=True)