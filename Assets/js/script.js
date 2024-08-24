const searchFormEl = document.getElementById("search-form");
const searchInputEl = document.querySelector("#search-input");
const cityHeaderEl = document.getElementById("city-header");
const cityButton = document.querySelector(".cityBtn");

const apiKey = '32545b0997265663df9ff6fd8f6c9fca'


/* get latitude and longitude data by searching the city name,
then store locally */ 
function fetchGeocodeData(city) {
    // URL for direct Geocoding API call - converts city name input to coordinates
    const geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=3&appid=${apiKey}`;

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
            for(const cityGeocode of geocodeData) {

                if(typeof cityGeocode === "object") {
                    if(cityGeocode[0].name = city) {
                        const cityObj = {};
                        cityObj["cityName"] = cityGeocode[0].name;
                        cityObj["cityLatitude"] = cityGeocode[0].lat;
                        cityObj["cityLongitude"] = cityGeocode[0].lon;
                      
                        // add the geocode data object to the array
                        geocodeArray.push(cityObj);
                        storeSearchedCity(geocodeArray);
                    } 
                    
                }
            }

            
        });

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
    // parse stored data (if any)
    const cityData = getStoredData();
    // if geocode data was retrieved for the city
    if(cityData.name == city) {
      // get lat/lon data from the parsed data
      const lat = cityData.cityLatitude;
      const lon = cityData.cityLongitude;
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
          /* create an array to store the various weather elements (date, icon, temp, wind, humidity) */
          const forecastArray = [];

          // retrieve city weather info
          for (const cityForecast of weatherData) {
            if (typeof cityWeather === "object") {
              const forecastObj = {};
              forecastObj["name"] = cityForecast.city.name;
              // Weather is in 3hr increments for each day. Return the 12pm temp data (5th element)
              //API date is a unix timestamp. Convert.
              const dateToday = dayjs(cityForecast.list[5].dt, "MM/DD/YYYY");
              forecastObj["date"] = dateToday;
              // weather icon
              forecastObj["icon"] = cityForecast.list[5].weather.icon;
              // API temperature is in Kelvins. Call function to convert to F
              const fTemp = convertKelvins(cityForecast.list[5].main.temp);
              forecastObj["temp"] = fTemp;
              // API wind speed is in meters/sec. Call function to convert to MPH
              const windMPH = convertWindSpeed(cityForecast.list[5].wind.speed);
              forecastObj["wind"] = windMPH;
              // API humidity is a percentage (add the % sign when rendered)
              forecastObj["humidity"] = cityForecast.list[5].main.humidity;

              forecastArray.push(forecastObj);
              // storeSearchedCity(forecastArray);
            }
          }
        });
    }
}

// retrieve current weather (today)
function fetchCurrentWeather(city) {
  // parse stored data (if any)
  const cityData = getStoredData();

// if geocode data is retrieved for the city
  if(cityData.name == city) {
    // get lat/lon data from the parsed data
    const lat = cityData.cityLatitude;
    const lon = cityData.cityLongitude;
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
        /* create an array to store the various weather elements (date, icon, temp, wind, humidity) */
        const currWeatherArray = [];

        // retrieve city weather info
        for (const currentWeather of weatherData) {
          if (typeof currentWeather === "object") {
            const weatherObj = {};
            weatherObj["name"] = currentWeather.name;
            // Weather is in 3hr increments for each day. Return the 12pm temp data (5th element)
            //API date is a unix timestamp. Convert.
            const dateToday = dayjs(currentWeather.dt, "MM/DD/YYYY");
            weatherObj["date"] = dateToday;
            // weather icon
            weatherObj["icon"] = currentWeather.weather[0].icon;
            // API temperature is in Kelvins. Call function to convert to F
            const fTemp = convertKelvins(currentWeather.main.temp);
            weatherObj["temp"] = fTemp;
            // API wind speed is in meters/sec. Call function to convert to MPH
            const windMPH = convertWindSpeed(currentWeather.wind.speed);
            weatherObj["wind"] = windMPH;
            // API humidity is a percentage (add the % sign when rendered)
            weatherObj["humidity"] = currentWeather.main.humidity;

            currWeatherArray.push(weatherObj);
            //   storeSearchedCity(currWeatherArray);
          }
        }
      });
    }
}

// function to convert kelvins to fahrenheit
function convertKelvins(kelvins) {
    const fahrenheit = ((kelvins - 273.15)*1.8)+32
    return `${fahrenheit} °F`;
}

// function to convert wind speed from m/s to MPH
function convertWindSpeed(metersPerSec) {
    const mph = metersPerSec*2.2369;
    return `${mph} MPH`;
}

// render current weather box
function createCurrentWeatherCard() {
    const currentWeatherCard = getElementByID("current-card");
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

    const forecastCard = getElementByID("container");
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

// perform search and render data
// 2 conditions: search button being clicked when there is an input value
// and the button shortcuts being clicked
function citySearch(city) {
  fetchGeocodeData(city);
  const weatherData = getStoredData();

  // checks for entries of cities
  if (weatherData.length === 0) {
    const errorMsg = document.createElement("h3");
    errorMsg.innerHTML =
      "No results found. Please check spelling and try again.";
    cityHeaderEl.appendChild(errorMsg);
    console.log(errorMsg);
  }

  
  const matchingCity = weatherData.find(
    (btnCity) => btnCity.name == cityButton.value
  );
  const searchedCity = weatherData.find(
    (inputCity) => inputCity.name == searchInputEl.value
  );

  if (matchingCity) {
    // if the button matches a city in the weather API
    cityButton.addEventListener("click", () => {
      // fetchGeocodeData(cityButton.value);
      fetchCurrentWeather(cityButton.value);
      fetchForecast(cityButton.value);
      createCurrentWeatherCard();
      createForecastCards();
    });
  } else if (searchedCity) {
    //search for input value
    // fetchGeocodeData(searchInputEl.value);
    fetchCurrentWeather(searchInputEl.value);
    fetchForecast(searchInputEl.value);
    createCurrentWeatherCard();
    createForecastCards();
  }
}

searchFormEl.addEventListener('submit', citySearch());
