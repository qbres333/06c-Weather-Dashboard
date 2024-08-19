const inputEl = document.getElementByID("search-input");
const cityHeaderEl = document.getElementByID("city-header");

const apiKey = '32545b0997265663df9ff6fd8f6c9fca'


/* get latitude and longitude data by searching the city name,
then return today's weather */ 
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
                        // cityObj["cityCountry"] = cityGeocode[0].country;
                        // cityObj["cityState"] = cityGeocode[0].state;

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
function storeSearchedCity(cityData) {
    localStorage.setItem('cityData', JSON.stringify(cityData));
}

function getStoredData() {
    const cityData = JSON.parse(localStorage.getItem('cityData'));
    // if there's no data in local storage, store cities in new empty array
    if(!cityData) {
        cityData = [];
    }
    return cityData;
}

// retrieve 5-day forecast
function fetchForecast(city) {
    // parse stored data (if any)
    fetchGeocodeData(city);
    const cityData = getStoredData();
    
    if(cityData.cityName != city){
        /* error checking done in fetchGeocode function; shouldn't be 
        needed here but will print to console */
        console.error("City data not found for:", city);
    } else {        
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
            const weatherArray = [];

            // retrieve city weather info
            for (const cityWeather of weatherData) {                
                if (typeof cityWeather === "object") {
                    const weatherObj = {};
                    weatherObj["name"] = cityWeather.city.name;
                    // Weather is in 3hr increments for each day. Return the 12pm temp data (5th element)
                    //API date is a unix timestamp. Convert.
                    const dateToday = dayjs(cityWeather.list[5].dt, "MM/DD/YYYY");
                    weatherObj["date"] = dateToday;
                    // weather icon
                    weatherObj["icon"] = cityWeather.list[5].weather.icon;
                    // API temperature is in Kelvins. Call function to convert to F
                    weatherObj["temp"] = cityWeather.list[5].main.temp;
                    // API wind speed is in meters/sec. Call function to convert to MPH
                    weatherObj["wind"] = cityWeather.list[5].wind.speed;
                    // API humidity is a percentage
                    weatherObj["humidity"] = cityWeather.list[5].main.humidity;
            
                }



            }

            // checks for entries with the city's name
        });
    }





}