$(document).ready(function () {
    // declare variables
    var currentLocation = "";
    var key = "70adb56aad82f6d80d7d219777ea54b2";
    var cityHistory = [];
    var currentDate;

    // Function to run various queries
    function runQuery(queryURL, stage) {
        var a = $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                switch (stage) {
                    case "today":
                        setToday(response);
                        if (cityHistory.indexOf(currentLocation) === -1) {
                            updateCityHistory();
                        }
                        break;
                    case "uvToday":
                        setUVToday(response.value);
                        break;
                    case "forecast":
                        setForecast(response);
                        break;
                    default:
                        break;
                }
            });
    }

    // Function generate query for current day's weather
    function makeCurrentQueryURL() {
        var location = currentLocation;
        var curQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
            location + "&units=metric&APPID=" + key;
        return curQueryURL;
    }

    // Function to generate query to obtain UV index for current day
    // latitude and longitude obtained from current day query response 
    function makeCurrentUVQueryURL(latitude, longitude) {
        return curUVQueryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" +
            latitude + "&lon=" + longitude + "&appid=" + key;
    }

    // Function to render current day weather results for chosen city
    function setToday(curCityWeather) {
        var today = thisDay(curCityWeather.dt);
        currentLocation = curCityWeather.name + "," + curCityWeather.sys.country;
        $("#today-city-date").text(currentLocation + " (" + today + ")");
        setIcon("#today-icon", curCityWeather.weather[0].icon);
        $("#today-temp").text("Temperature: " + Math.round(curCityWeather.main.temp) + " °C");
        $("#today-humid").text("Humidity: " + Math.round(curCityWeather.main.humidity) + " %");
        var spd = curCityWeather.wind.speed * 60 * 60 / 1000;     //convert m/s to km/hr
        $("#today-wind").text("Wind Speed: " + Math.round(spd) + " kph");
        var lat = curCityWeather.coord.lat;
        var long = curCityWeather.coord.lon;
        if (curCityWeather.weather[0].icon[2] === "n") {
            setUVToday(0);
        }
        else {
            runQuery(makeCurrentUVQueryURL(lat, long), "uvToday");
        }
    }

    // Function to render uv index with colour coding from style.css classes
    function setUVToday(uv) {
        $("#today-uvIndex").text("UV Index: ");
        $("#uvValue").text(uv);
        $("#uvValue").removeClass();
        $("#uvValue").addClass("float-left");
        $("#uvValue").addClass(uvRange(uv));
    }

    // Function to determine class names by uv-index value
    function uvRange(uvValue) {
        if (uvValue >= 0 && uvValue < 3) {
            return "lowUV";     //low risk
        }
        if (uvValue >= 3 && uvValue < 6) {
            return "moderateUV";    //Moderate risk
        }
        if (uvValue >= 6 && uvValue < 8) {
            return "highUV";     //High risk
        }
        if (uvValue >= 8 && uvValue < 10) {
            return "veryHighUV";       //Very high risk
        }
        else {
            return "extremeUV";    //Extreme risk
        }
    }

    // Function to find forcast dat for following five days - targets results for day, rather than night
    function setForecast(forCityWeather) {
        $("#forecast-container").empty();
        var count = 0;
        var forecastDate = new Date();
        forecastDate.setDate(currentDate.getDate() + 1);
        // Look for the first 'day' result in the query response for each forecast date.
        // Depending on the time of day that the search is undertaken, there may be insufficient 
        // data returned from the query to give a 5-day forcast.
        // We could just read the first entry from each forecast date, but that could be night 
        // values at night, and does not seem logical.
        for (var i = 0; i < forCityWeather.list.length; i++) {
            var date = new Date((forCityWeather.list[i].dt) * 1000);
            if (forecastDate.getDate() === date.getDate() &&
                forCityWeather.list[i].sys.pod === "d") {
                for (var j = i; j < forCityWeather.list.length; j += 8) {
                    addForecastElement(forCityWeather.list[j]);
                    count++;
                }
                // A work-around to get 5-days of forecast - could be a night...
                if (count < 5) {
                    addForecastElement(forCityWeather.list[forCityWeather.list.length - 1]);
                }
                return;
            }
        }
    }

    // Function to render forecast results to the display
    function addForecastElement(listItem) {
        var div = $("<div>");
        div.addClass("col-sm with-frame forecast");
        var h = $("<h4>");
        var hDate = new Date((listItem.dt) * 1000);
        h.text(hDate.toLocaleDateString());
        div.append(h);

        var img = $("<img>");
        img.addClass("weather-icon")
        img.attr("src", "http://openweathermap.org/img/wn/" + listItem.weather[0].icon + "@2x.png");
        div.append(img);

        var p2 = $("<p>");
        p2.text("Temperature: " + Math.round(listItem.main.temp) + " °C");
        div.append(p2);

        var p3 = $("<p>");
        p3.text("Humidity: " + Math.round(listItem.main.humidity) + " %");
        div.append(p3);

        $("#forecast-container").append(div);
    }

    // Function to generate query for 5-day forecast
    function makeForecastQueryURL() {
        var location = currentLocation;
        var forQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" +
            location + "&units=metric&APPID=" + key;
        return forQueryURL;
    }

    // Function to set the path for weather icon
    function setIcon(eleID, iconCode) {
        $(eleID).attr("src", "http://openweathermap.org/img/wn/" + iconCode + "@2x.png");
    }

    // Function to return 'nicely' formatted date/month/year
    function thisDay(responseDate) {
        var theDate = new Date(responseDate * 1000);
        currentDate = theDate;
        var dd = String(theDate.getDate()).padStart(2, '0');
        var mm = String(theDate.getMonth() + 1).padStart(2, '0');
        var yyyy = theDate.getFullYear();

        return dd + '/' + mm + '/' + yyyy;
    }

    // Function to run queries for current day and forecast
    function runQueries() {
        runQuery(makeCurrentQueryURL(), "today");
        runQuery(makeForecastQueryURL(), "forecast")
    }

    // Function to maintain search city history, and add into local storage
    function updateCityHistory() {
        cityHistory.push(currentLocation);
        cityHistory.sort();
        localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
        localStorage.setItem("lastCity", currentLocation);
        addCompleteCityHistory();
    }

    // Function to rerieve any stored search history from local storage
    function getStoredCityHistory() {
        var hist = JSON.parse(localStorage.getItem("cityHistory"));
        if (hist !== null) {
            cityHistory = JSON.parse(localStorage.getItem("cityHistory"));
        }
        else {
            cityHistory = [];
        }
    }

    // Function to return the last 'searched for' city for diplay when the browser opens
    function getLastCity() {
        var lastCity = localStorage.getItem("lastCity");
        if (lastCity !== null) {
            currentLocation = lastCity;
        }
        else {
            // Set Perth,AU as the default location if nothing is stored. 
            // It is the best place on the planet after all!
            currentLocation = "Perth,AU";
        }
        runQueries();
    }

    // Render search history to the display
    function addCompleteCityHistory() {
        $("#search-history").empty();
        for (var i = 0; i < cityHistory.length; i++) {
            var cityButton = $("<button>");
            cityButton.addClass("history-item full-width-button");
            cityButton.attr("id", cityHistory[i]);
            cityButton.text(cityHistory[i]);
            $("#search-history").append(cityButton);
        }
    }

    // A Format the entered city name - just for looks!
    function capitaliseCityName(cityName) {
        cityName = cityName.toLowerCase()
            .split(' ').map((s) => s.charAt(0)
                .toUpperCase() + s.substring(1))
            .join(' ');
        console.log(cityName);
        return cityName;
    }

    // Format the entered search string to 'City,Country' - trim spaces
    // The city may be entered without Country
    function formatSearch(txt) {
        var arr = txt.split(",");
        arr = arr.map(x => x.trim());
        for (var i = 0; i < arr.length; i++) {
            if (i === 0) {
                arr[i] = capitaliseCityName(arr[i]);
            }
            else {
                arr[i] = arr[i].toUpperCase();
            }
        }
        return arr.join();
    }

    // on-click event for the search button
    $("#search-button").on("click", function (event) {
        event.preventDefault();
        if ($("#search-text").val()) {
            currentLocation = formatSearch($("#search-text").val());
            runQueries();
            $("#search-text").val("");
        }
    });

    // on-click event watching the 'search-history' container 
    // for button clicks on the dynamically generated buttons
    $("#search-history").on("click", "button", function (event) {
        event.preventDefault();
        currentLocation = $(this).attr("id");
        runQueries();
        localStorage.setItem("lastCity", currentLocation);
    });

    // on-click event to clear the search history.
    // The current diplayed city will not be cleared
    $(".clear-history").on("click", function (event) {
        event.preventDefault();
        cityHistory = [currentLocation];
        localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
        addCompleteCityHistory();
    });

    // Setup the display
    function init() {
        getStoredCityHistory();
        getLastCity();
        addCompleteCityHistory();
    }

    init();
});