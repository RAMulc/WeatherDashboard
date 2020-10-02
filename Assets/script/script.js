$(document).ready(function () {

    var currentLocation = "";
    var key = "70adb56aad82f6d80d7d219777ea54b2";
    var cityHistory = [];
    var currentDate;

    function runQuery(queryURL, stage) {
        //console.log("queryURL", queryURL);
        var a = $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                switch (stage) {
                    case "today":
                        //console.log("today response", response);
                        setToday(response);
                        if (cityHistory.indexOf(currentLocation) === -1) {
                            updateCityHistory();

                        }
                        break;
                    case "uvToday":
                        //console.log("uvtoday response", response);
                        setUVToday(response.value);
                        break;
                    case "forecast":
                        //console.log("forecast response", response);
                        setForecast(response);
                        break;
                    default:
                        break;
                }
            });
    }


    function makeCurrentQueryURL() {
        var location = currentLocation;
        var curQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
            location + "&units=metric&APPID=" + key;
        return curQueryURL;
    }

    function makeCurrentUVQueryURL(latitude, longitude) {
        return curUVQueryURL = "http://api.openweathermap.org/data/2.5/uvi?lat=" +
            latitude + "&lon=" + longitude + "&appid=" + key;
    }

    function setToday(curCityWeather) {
        var today = thisDay(curCityWeather.dt);
        $("#today-city-date").text(curCityWeather.name + " (" + today + ")");
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

    function setUVToday(uv) {
        $("#today-uvIndex").text("UV Index: ");
        $("#uvValue").text(uv);
        $("#uvValue").removeClass();
        $("#uvValue").addClass("float-left");
        $("#uvValue").addClass(uvRange(uv));
    }

    function setForecast(forCityWeather) {
        $("#forecast-container").empty();
        var count = 0;
        var forecastDate = new Date();
        forecastDate.setDate(currentDate.getDate()+1);
        // Look for the first 'day' result in the query response for each forecast date.
        // Depending on the time of day that the search is undertaken, there may be insufficient 
        // data returned from the query to give a 5-day forcast.
        // We could just read the first entry from each forecast date, but that could be night 
        // values at night, and does not seem logical.
        for (var i = 0; i < forCityWeather.list.length; i++) {
            var date = new Date((forCityWeather.list[i].dt) * 1000);

            if (forecastDate.getDate() === date.getDate() && forCityWeather.list[i].sys.pod === "d") {
                addForecastElement(forCityWeather.list[i]);
                count++;
                forecastDate.setHours(forecastDate.getDate() + 1);

                if (count > 5) {
                    return;
                }
            }
        }
    }

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

    function makeForecastQueryURL() {

        var location = currentLocation;

        var forQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" +
            location + "&units=metric&APPID=" + key;

        //console.log("forQueryURL: ", forQueryURL);
        return forQueryURL;
    }

    function setIcon(eleID, iconCode) {
        //console.log(iconCode);
        $(eleID).attr("src", "http://openweathermap.org/img/wn/" + iconCode + "@2x.png");
    }

    function thisDay(responseDate) {
        var theDate = new Date(responseDate * 1000);
        currentDate = theDate;
        var dd = String(theDate.getDate()).padStart(2, '0');
        var mm = String(theDate.getMonth() + 1).padStart(2, '0');
        var yyyy = theDate.getFullYear();

        return dd + '/' + mm + '/' + yyyy;
    }

    function runQueries() {
        runQuery(makeCurrentQueryURL(), "today");
        runQuery(makeForecastQueryURL(), "forecast")
    }

    function updateCityHistory() {
        cityHistory.push(currentLocation);
        cityHistory.sort();
        localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
        localStorage.setItem("lastCity", currentLocation);
        addCompleteCityHistory();
    }

    function getStoredCityHistory() {
        var hist = JSON.parse(localStorage.getItem("cityHistory"));
        if (hist !== null) {
            cityHistory = JSON.parse(localStorage.getItem("cityHistory"));
        }
        else {
            cityHistory = [];
        }
    }

    function getLastCity() {
        var lastCity = localStorage.getItem("lastCity");
        if (lastCity !== null) {
            currentLocation = lastCity;
        }
        else {
            currentLocation = "Perth,AUS";
        }
        runQueries();
    }

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

    function capitaliseCityName(cityName) {
        cityName = cityName.toLowerCase()
            .split(' ').map((s) => s.charAt(0)
                .toUpperCase() + s.substring(1))
            .join(' ');
            console.log(cityName);
        return cityName;
    }

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

    $("#search-button").on("click", function (event) {
        event.preventDefault();
        if ($("#search-text").val()) {
            currentLocation = formatSearch($("#search-text").val());
            runQueries();
            //currentLocation = capitaliseCityName(currentLocation);
            $("#search-text").val("");
        }
    });

    $("#search-history").on("click", "button", function (event) {
        event.preventDefault();
        currentLocation = $(this).attr("id");
        runQueries();
        localStorage.setItem("lastCity", currentLocation);
    });

    $(".clear-history").on("click", function (event) {
        event.preventDefault();
        cityHistory = [currentLocation];
        localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
        addCompleteCityHistory();
    });

    function init() {
        getStoredCityHistory();
        getLastCity();
        addCompleteCityHistory();
    }

    init();
});