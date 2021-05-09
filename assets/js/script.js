var historyContainer = document.querySelector('#historyContainer');
var pastSearches = [];

// Button handler: Search button
function btnSearchHandler(event) {
     var city = getCity();
     fetchData(buildCurdayUrl(city), "currentWeather");
     fetchData(buildFivedayUrl(city), "fivedayForecast");
     setHistory(city);
}

// Button handler: Previous searches
function citySearchHandler(event) {
     var city = event.target.getAttribute('data-city');
     fetchData(buildCurdayUrl(city), "currentWeather");
     fetchData(buildFivedayUrl(city), "fivedayForecast");
}

// Get search city from user
function getCity() {
     return document.getElementById("inpCity").value;
}

// Get past searches from local storage
function getHistory() {
     if (localStorage["pastSearches"]) {
          pastSearches = JSON.parse(localStorage["pastSearches"]);
     }
}

// Store last search in local storage
function setHistory(search) {
     if(pastSearches.indexOf(search) == -1) {
          pastSearches.unshift(search);
          if(pastSearches.length > 5) { 
             pastSearches.pop();
          }
          localStorage["pastSearches"] = JSON.stringify(pastSearches);
     }
}

// Display previous search buttons
function displayHistory() {
     var historyContainer = document.getElementById("historyContainer");
     historyContainer.innerHTML = "";
     for (var i = 0; i < pastSearches.length; i++) {
        
          var btn = document.createElement("button");
          var p = document.createElement("p");
        
          btn.textContent = pastSearches[i];
          btn.setAttribute("data-city", pastSearches[i]);
          btn.setAttribute("type","button");
          btn.setAttribute("class","btn btn-primary");
        
          historyContainer.appendChild(p);
          historyContainer.appendChild(btn);
        
          if (i === 0) {
               fetchData(buildCurdayUrl(pastSearches[i]), "currentWeather");
               fetchData(buildFivedayUrl(pastSearches[i]), "fivedayForecast");
          }
     }
}

// Buld URLs for API
function buildCurdayUrl(city) {
     return "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=689e7816efbb0d3a154fea46ac09c553";
}
function buildFivedayUrl(city) {
     return "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=689e7816efbb0d3a154fea46ac09c553";
}
function buildUVUrl(lat, lon) {
     return "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,daily,alerts&appid=689e7816efbb0d3a154fea46ac09c553";
}

// Fetch the data from the APIs
function fetchData(requestUrl, requestType) {
     fetch(requestUrl)
          .then(function (response) { return response.json() })
          .then(function (data) {
               if (requestType === "currentWeather") {
                    updateCurrentWeather(data);
               } else if (requestType === "fivedayForecast") {
                    updateFivedayForecast(data);
               } else {
                    getUVIndex(data);
               }
          })
}

// Display the UV index, with red, blue, green background to indicate severity
function getUVIndex(d) {
     
     var spanUV = document.getElementById('curdayUV');
     spanUV.textContent = d.current.uvi;

     if (d.current.uvi >= 0 && d.current.uvi < 3 ) {
          spanUV.setAttribute("class","p-3 mb-2 bg-success text-white")
     } else if (d.current.uvi >= 3 && d.current.uvi < 6) {
          spanUV.setAttribute("class", "p-3 mb-2 bg-info text-white");
     } else {
          spanUV.setAttribute("class", "p-3 mb-2 bg-danger text-white");
     }
}

// Populate the current weather container
function updateCurrentWeather(d) {

     var h2 = document.getElementById('city');     
     h2.textContent = d.name + " " + moment.unix(d.dt).format("MM/DD/YYYY");

     var img = document.getElementById("curdayIcon");
     img.setAttribute("src", "http://openweathermap.org/img/wn/" + d.weather[0].icon + ".png");

     var spanTemp = document.getElementById('curdayTemp');
     spanTemp.textContent = d.main.temp + " F";

     var spanWind = document.getElementById('curdayWind');
     spanWind.textContent = d.wind.speed + " MPH";

     var spanHumidity = document.getElementById('curdayHumidity');
     spanHumidity.textContent = d.main.humidity + " %";

     fetchData(buildUVUrl(d.coord.lat, d.coord.lon), "uvIndex");
}

// Collect data and populate the five day forecast containers
function updateFivedayForecast(d) {
     var date;
     var forecastDay = 1;
     for (i = 0; i < 40; i++) {
          date = d.list[i].dt_txt.split(" ", 2)
          if (date[1] === "00:00:00" && forecastDay <= 5 ) {
               populateForecastContainer(d, date, forecastDay, i);
               forecastDay++;
          }
     }
}

// Display the five day forecast
function populateForecastContainer(d, dt, fDay, i) {

     var h3 = document.getElementById("day" + fDay + "Date");
     h3.textContent = dt[0];

     var img = document.getElementById("day" + fDay + "Icon");
     img.setAttribute("src", "http://openweathermap.org/img/wn/" + d.list[i].weather[0].icon + ".png");

     var spanTemp = document.getElementById("day" + fDay + "Temp");
     spanTemp.textContent = d.list[i].main.temp;

     var spanWind = document.getElementById("day" + fDay + "Wind");
     spanWind.textContent = d.list[i].wind.speed + " MPH";

     var spanHumidity = document.getElementById("day" + fDay + "Humidity");
     spanHumidity.textContent = d.list[i].main.humidity + " %";
}

// Main: Display last search on the way into the website as default
getHistory();
displayHistory();

// Button Listeners
btnSearch.addEventListener("click", btnSearchHandler);
historyContainer.addEventListener("click",citySearchHandler);
