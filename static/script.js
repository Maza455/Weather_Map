document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value.trim();
    const countryCode = document.getElementById('countryCode').value.trim();
    
    if (!city || !countryCode) {
        alert("Please enter both city and country code.");
        return;
    }

   // Show loading GIF
   document.getElementById("loading-gif").style.display = "block";

   // Fetch current weather data
   fetch('/weather', {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: new URLSearchParams({ city, countryCode }),
   })
   .then(response => response.json())
   .then(data => {
       // Hide loading GIF
       document.getElementById("loading-gif").style.display = "none";

       if (data.error) {
           document.querySelector('.not-found').style.display = 'block';
           return;
       }

       // Display current weather
       document.querySelector('.cityName').textContent = data.city;
       document.querySelector('.temperature').innerHTML = `${data.temperature}°C`;
       document.querySelector('.description').textContent = data.description;
       document.querySelector('.humidity').textContent = data.humidity;
       document.querySelector('.wind-speed').textContent = data.wind_speed;

       const iconUrl = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
       document.getElementById('weather-icon').src = iconUrl;

       // Show current weather box
       document.querySelector('.weather-box').style.display = 'block';

       // Display the forecast
       const forecastBoxes = document.querySelector('.forecast-boxes');
       forecastBoxes.innerHTML = ''; // Clear previous forecast

       data.forecast.forEach(day => {
           const date = new Date(day.date * 1000).toLocaleDateString();
           const iconUrlForecast = `http://openweathermap.org/img/wn/${day.icon}@2x.png`;

           const box = document.createElement('div');
           box.classList.add('forecast-box', 'fadeIn');
           box.innerHTML = `
               <h3>${date}</h3>
               <img src="${iconUrlForecast}" alt="${day.description}">
               <p>Max ${day.temp_max}°C</p>
               <p>Min ${day.temp_min}°C</p>
               <p>${day.description}</p>
           `;
           forecastBoxes.appendChild(box);
       });

       // Show the forecast section
       document.querySelector('.forecast').style.display = 'block';
   })
   .catch(error => {
       console.error(error);
       document.querySelector('.not-found').style.display = 'block';
   });
}); 