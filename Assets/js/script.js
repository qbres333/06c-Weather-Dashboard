const inputEl = document.getElementByID("search-input");
const cityHeaderEl = document.getElementByID("city-header");

const apiKey = '32545b0997265663df9ff6fd8f6c9fca'


//get latitude and longitude data by searching the city name
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
                        cityObj["cityLatitude"] = cityGeocode[0].lat; //is lat in quotes?
                        cityObj["cityLongitude"] = cityGeocode[0].lon;
                        cityObj["cityCountry"] = cityGeocode[0].country;
                        cityObj["cityState"] = cityGeocode[0].state;

                        // add the geocode data object to the array
                        geocodeArray.push(cityObj);
                        storeSearchedCity(geocodeArray);
                    } 
                    
                }
            }

            // checks for entries of cities
            if(geocodeArray.length == 0) {
                const errorMsg = document.createElement("h3");
                errorMsg.innerHTML = 
                    "No results found. Please check spelling and try again."
                cityHeaderEl.appendChild(errorMsg);
            } else {
                fetchForecast(geocodeArray);
                // const dateToday = dayjs().format('MM/DD/YYYY');

                // cityHeaderEl.textContent = `${city} (${dateToday})`
            }
            
        });

}

// store city data locally
function storeSearchedCity(array) {
    localStorage.setItem(array, JSON.stringify(array));
}

function getStoredData(array) {
    const cityData = JSON.parse(localStorage.getItem(array));
    return cityData;
}

function fetchForecast(geocodeObj) {
    // URL for fetching weather data by latitude,longitude
    let regURL = `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}`;
    // get lat and lon data from the fetchGeocodeData function
    const lat = geocodeObj.cityLatitude;
    const lon = geocodeObj.cityLongitude;

    regURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;


    // 
    fetch(regURL)
        .then(function (response) {
        // if the request fails, show the JSON error. Otherwise return the promise.
        if (!response.ok) {
            throw response.json();
        }
        return response.json();
        })
        .then(function (weatherData) {
            // create an array to store the various weather elements
            const weatherArray = [];
            // search API for city weather info
            for(const cityWeather of weatherData) {

                if(typeof cityWeather === "object") {
                    if(cityWeather[0].name = city) {
                       
                    } 
                    
                }
            }

            // checks for entries with the city's name
           
            

        })
}