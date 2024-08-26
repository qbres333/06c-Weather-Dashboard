const searchFormEl = document.getElementById("search-form");
const searchInputEl = document.querySelector("#search-input");
const cityHeaderEl = document.getElementById("city-header");
const cityButton = document.querySelector(".cityBtn");
const currWeather = document.getElementById("current-card");
const foreHeader = document.getElementById("forecast");
const foreWeather = document.getElementById("container");

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
          foreHeader.innerHTML = `5-Day Forecast:`;
          const forecastEl = document.createElement("div");
          forecastEl.classList.add("has-text-white");
          forecastEl.classList.add("has-background-info-dark");
        //   forecastEl.classList.add("ml-0");
          forecastEl.innerHTML = `
                <h3 class="is-size-6 pl-2 pr-2 pt-2 has-text-weight-bold">${dateToday}</h3>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="image is-32x32 mr-2 mb-2"/>
                <div class="is-size-7 mb-1 pl-2 pr-2">Temp: ${fTemp}</div>
                <div class="is-size-7 mb-1 pl-2 pr-2">Wind: ${windMPH}</div>
                <div class="is-size-7 mb-1 pl-2 pr-2 pb-2">Humidity: ${humidity}%</div>            
                `;

          // Append elements
          foreWeather.appendChild(forecastEl);
        });

      })
     
  }
}

// retrieve current weather (today)
function fetchCurrentWeather(city) {
    // get the geocode data for the city
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
            currWeather.appendChild(currWeatherEl);
             
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


// perform search and render data
function citySearch(event) {
    event.preventDefault();

    currWeather.innerHTML = "";
    foreHeader.innerHTML = "";
    foreWeather.innerHTML = "";
    const city = formatInput(searchInputEl.value);

    fetchGeocodeData(city);
    fetchCurrentWeather(city);
    fetchForecast(city);

}

searchFormEl.addEventListener('submit', citySearch);

// when the city button is clicked, the button value goes to the input field, and a search is performed.
function formatInput(input) {
    const firstLetter = input.charAt(0).toUpperCase();
    const remainingLetters = input.substring(1).toLowerCase();
    input = firstLetter + remainingLetters;
    searchInputEl.value = input;
    return searchInputEl.value; //with this included, geocode data prints to console but doesn't render
}