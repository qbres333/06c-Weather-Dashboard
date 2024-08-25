const searchFormEl = document.getElementById("search-form");
const searchInputEl = document.querySelector("#search-input");
const cityHeaderEl = document.getElementById("city-header");
const cityButton = document.querySelector(".cityBtn");

const apiKey = '32545b0997265663df9ff6fd8f6c9fca';


/* get latitude and longitude data by searching the city name,
then store locally */ 
function fetchGeocodeData(city) {  
    // URL for direct Geocoding API call - converts city name input to coordinates
    const geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    // request GeoCode data
    fetch(geocodeURL)
      .then(function (response) {
        // if the request fails, show the JSON error. Otherwise return the promise.
        if (!response.ok) {
          throw response.json();
        }
        return response.json();
      })
      .then(function (geocodeData) {
        // create an array to store the various weather elements
        const geocodeArray = [];
        /* search API for city weather info; API output is an array of objects, 
            so geocodeData is an array and cityGeocode is an object */
        for (const cityGeocode of geocodeData) {
          // if (typeof cityGeocode === "object") {
            if (cityGeocode.name == city) {
                const cityObj = {};
                cityObj["cityName"] = cityGeocode.name;
                // lat and long must be rounded to 3 decimals to be matched in the weather functions
                cityObj["cityLatitude"] = cityGeocode.lat.toFixed(3);
                cityObj["cityLongitude"] = cityGeocode.lon.toFixed(3);
                // ----------------------------test -----------------------------------
                console.log(cityObj["cityName"]);
                console.log(cityObj["cityLatitude"]);
                console.log(cityObj["cityLongitude"]);

                // add the geocode data object to the array
                geocodeArray.push(cityObj);
                storeSearchedCity(geocodeArray);
            } else {
                const errorMsg = document.createElement("h3");
                
                errorMsg.innerHTML =
                    "No results found. Please check spelling and try again.";
                cityHeaderEl.appendChild(errorMsg);
                console.log(errorMsg);
                               
            }
            
          // }
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    // } 
}

// store city data locally
function storeSearchedCity(cityData) {
    localStorage.setItem('cityData', JSON.stringify(cityData));
}

function getStoredData() {
    let cityData = JSON.parse(localStorage.getItem('cityData'));
    // if there's no data in local storage, store cities in new empty array
    if(!cityData) {
        cityData = [];
    }
    return cityData;
}

// retrieve 5-day forecast
function fetchForecast(city) {
  // get the geocode data for the city
  const cityData = getStoredData();
  const cityObj = cityData.find((cityObj) => cityObj.cityName == city);
  // if geocode data was retrieved for the city
  if (cityObj) {
    // get lat/lon data from the parsed data
    const lat = cityObj.cityLatitude;
    const lon = cityObj.cityLongitude;
    // URL for fetching weather data by latitude,longitude
    const regURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    //send API request
    fetch(regURL)
      .then(function (response) {
        // if the request fails, show the JSON error. Otherwise return the promise.
        if (!response.ok) {
          throw response.json();
        }
        return response.json();
      })
      .then(function (weatherData) {
        
        // Weather is in 3hr increments for each day. Return the 12pm temp data
        const middayForecasts = weatherData.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));
        middayForecasts.forEach((forecast) => {
            
            //API date must be converted to unix timestamp.
            const dateToday = dayjs(forecast.dt * 1000).format("MM/DD/YYYY");
            const fTemp = convertKelvins(forecast.main.temp);
            const icon = forecast.weather[0].icon;        
            const windMPH = convertWindSpeed(forecast.wind.speed);
            const humidity = forecast.main.humidity;

            // Create a forecast card
            const forecastCard = document.getElementById("container");
            const forecastEl = document.createElement("div");
            forecastEl.classList.add("has-text-white");
            forecastEl.innerHTML = `
                <h3 class="is-size-6 pl-2 has-text-weight-bold">${dateToday}</h3>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="image is-32x32 mr-2 mb-2"/>
                <div class="is-size-7 mb-2 pl-2">Temp: ${fTemp}</div>
                <div class="is-size-7 mb-2 pl-2">Wind: ${windMPH}</div>
                <div class="is-size-7 mb-2 pl-2">Humidity: ${humidity}%</div>            
                `;

            // Append forecast element to the container
            forecastCard.appendChild(forecastEl);
        });

      })
     
  }
}

// retrieve current weather (today)
function fetchCurrentWeather(city) {
    // get the geocode data for the city
    fetchGeocodeData(city);
    // parse stored data (if any)
    const cityData = getStoredData();
    const cityObj = cityData.find((cityObj) => cityObj.cityName == city)
    
    // if geocode data is retrieved for the city
    if (cityObj) {
        // get lat/lon data from the parsed data
        const lat = cityObj.cityLatitude;
        const lon = cityObj.cityLongitude;
        // URL for fetching weather data by latitude,longitude
        const regURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        //send API request
        fetch(regURL)
        .then(function (response) {
            // if the request fails, show the JSON error. Otherwise return the promise.
            if (!response.ok) {
            throw response.json();
            }
            return response.json();
        })
        .then(function (weatherData) {
        
            // const [currentWeather] = weatherData;
            // retrieve city weather info
            
                const cName = weatherData.name;
                const dateToday = dayjs(weatherData.dt * 1000).format("MM/DD/YYYY");
                const icon = weatherData.weather[0].icon;
                // API temperature is in Kelvins. Call function to convert to F
                const fTemp = convertKelvins(weatherData.main.temp);                
                // API wind speed is in meters/sec. Call function to convert to MPH
                const windMPH = convertWindSpeed(weatherData.wind.speed);
                // API humidity is a percentage (add the % sign when rendered)
                const humidity = weatherData.main.humidity.toFixed(0);

                // Create a current weather card
                const currWeatherCard = document.getElementById("current-card");
                const currWeatherEl = document.createElement("div");
                currWeatherEl.classList.add("black-border");
                currWeatherEl.innerHTML = `
                    <h3 class="is-size-5 mr-5 pl-2">${cName} (${dateToday}) <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="image is-32x32"/>
                    </h3>                    
                    <div class="is-size-6 mr-5 pl-2 pb-2">Temp: ${fTemp}</div>
                    <div class="is-size-6 mr-5 pl-2 pb-2">Wind: ${windMPH}</div>
                    <div class="is-size-6 mr-5 pl-2 pb-2">Humidity: ${humidity}%</div>            
                    `;

                // Append forecast element to the container
                currWeatherCard.appendChild(currWeatherEl);
             
        });
    }
}

// function to convert kelvins to fahrenheit
function convertKelvins(kelvins) {
    const fahrenheit = (((kelvins - 273.15)*1.8)+32).toFixed(2);
    return `${fahrenheit} °F`;
}

// function to convert wind speed from m/s to MPH
function convertWindSpeed(metersPerSec) {
    const mph = (metersPerSec*2.2369).toFixed(2);
    return `${mph} MPH`;
}

/* ----------------------- old weather card functions ----------------------------
// render current weather box
function createCurrentWeatherCard() {
    const currentWeatherCard = document.getElementById("current-card");
    // Clear any existing content
    currentWeatherCard.innerHTML = "";  
    const currentCardBody = $("<div>").addClass("current-card-body");
    const currWeatherHeader = $("<h2>").addClass("city-header p-2").text(`${weatherObj.name} (${weatherObj.date}) ${weatherObj.icon}`);
    const currentTemp = $('<div>').addClass('current-Temp p-2').text(`Temp: ${weatherObj.temp}`);
    const currentWind = $('<div>').addClass('current-Wind p-2').text(`Wind: ${weatherObj.wind}`);
    const currentHumidity = $('<div>').addClass('current-Humidity p-2').text(`Humidity: ${weatherObj.humidity}%`);
    // append current weather info to the card
    currentCardBody.append(currWeatherHeader, currentTemp, currentWind, currentHumidity);
    currentWeatherCard.append(currentCardBody);

    return currentWeatherCard;

}

// render 5-day forecast data
function createForecastCards() {

    const forecastCard = document.getElementById("container");
    const forecastCardBody = $("<div>").addClass(
      "forecast-card-body card has-background-info-dark has-text-white"
    );
    const forecastHeader = $("<h2>").addClass("card-header date-header p-2").text(`${forecastObj.date}`);
    const forecastTemp = $('<div>').addClass('forecast-Temp p-2').text(`Temp: ${forecastObj.temp}`);
    const forecastWind = $('<div>').addClass('forecast-Wind p-2').text(`Wind: ${forecastObj.wind}`);
    const forecastHumidity = $('<div>').addClass('forecast-Humidity p-2').text(`Humidity: ${forecastObj.humidity}%`);
    // append current weather info to the card
    forecastCardBody.append(forecastHeader, forecastTemp, forecastWind, forecastHumidity);
    forecastCard.append(forecastCardBody);

    return forecastCard;

}
*/


// perform search and render data
// 2 conditions: search button being clicked when there is an input value
// and the button shortcuts being clicked
function citySearch(event) {
  event.preventDefault();

    fetchGeocodeData(searchInputEl.value);
    fetchCurrentWeather(searchInputEl.value);
    fetchForecast(searchInputEl.value);

}

searchFormEl.addEventListener('submit', citySearch);

