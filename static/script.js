document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value.trim();
    const countryCode = document.getElementById('countryCode').value.trim();
    
    if (!city) {
        alert("Please enter a city name.");
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

            // Display time-sensitive message
            displayTimeMessage(data.forecast);

            // Display the forecast
            const forecastBoxes = document.querySelector('.forecast-boxes');
            forecastBoxes.innerHTML = ''; // Clear previous forecast

            // Ensure that we have a valid forecast array before processing it
            if (data.forecast && Array.isArray(data.forecast)) {
                data.forecast.forEach(day => {
                    const date = new Date(day.date * 1000).toLocaleDateString();
                    const iconUrlForecast = `http://openweathermap.org/img/wn/${day.icon}@2x.png`;

                    const box = document.createElement('div');
                    box.classList.add('forecast-box');
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

                // Start carousel functionality
                startCarousel(forecastBoxes);
            } else {
                console.error("Forecast data is missing or not an array.");
                document.querySelector('.not-found').style.display = 'block';
            }
 
            // Update current time every second
            setInterval(updateTimeDisplay, 1000);
            
        })
        .catch(error => {
            console.error(error);
            document.querySelector('.not-found').style.display = 'block';
        });
});

// Function to update time display
function updateTimeDisplay() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById("current-time").textContent = `${hours}:${minutes}`;
}

// Function to display time-sensitive weather messages
function displayTimeMessage(forecast) {
    const rainForecast = forecast.find(day => day.description.includes("rain"));
    
    if (rainForecast) {
        const rainTime = new Date(rainForecast.date * 1000);
        const currentTime = new Date();
        
        const timeDiffMinutes = Math.round((rainTime - currentTime) / (1000 * 60)); // Difference in minutes
        
        if (timeDiffMinutes <= 60 && timeDiffMinutes > 0) { // If rain is expected within the next hour
            document.querySelector('.time-message').textContent = `Expect rain in ${timeDiffMinutes} minute${timeDiffMinutes > 1 ? 's' : ''}.`;
        } else if (timeDiffMinutes <= 120 && timeDiffMinutes > 60) { // If rain is expected in the next two hours
            document.querySelector('.time-message').textContent = `Expect rain in the next couple of hours.`;
        } else {
            document.querySelector('.time-message').textContent = `No immediate rain expected.`;
        }
    } else {
        document.querySelector('.time-message').textContent = `No rain expected soon.`;
    }
}

// Function to start carousel functionality for forecast boxes
function startCarousel(forecastBoxes) {
   let index = 0;

   function showNext() {
       index += 1;

       if (index > Math.floor(forecastBoxes.children.length / 3) - 1) { // Reset index if it exceeds available slides
           index = 0;
       }

       const offsetX = -index * (100 / Math.ceil(forecastBoxes.children.length / 3)); // Calculate offset based on index

       forecastBoxes.style.transform = `translateX(${offsetX}%)`; // Move to next set of cards
   }

   setInterval(showNext, 3000); // Change slide every 3 seconds
}