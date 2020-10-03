# Weather Dashboard
### 06 Server-Side APIs: Weather Dashboard



https://ramulc.github.io/WeatherDashboard/

https://github.com/RAMulc/WeatherDashboard



<u>**Overview:**</u>

An application utilising a combination of html, JavaScript and css to create a dashboard to report current weather conditions for a selected city.

Data is obtained via from [openweathermap.org](https://openweathermap.org/).

When the application opens,  the user will be presented with the last displayed city weather, or will default to "Perth,AU" if this is the first time opening the application. 

*Search:*

The user may search for a city in the search input field and pressing enter or clicking the magnifying glass. The input field may be just the city name, or accompanied by the country code with a comma separating the city name and country code.

*Search History:*

Each successful search will be added to the search history (formatted, and country code added), unless it is already there.

Search history may be cleared by clicking the 'Clear History' button. The history will be cleared with the exception of the currently displayed city weather.

Successfully searching for a city will generate the current days' weather, with:

- City name, Country Code and current weather icon;
- Temperature;
- Humidity;
- Wind Speed; and
- UV-Index with colour code for index severity;
  - low - green;
  - moderate - yellow;
  - high - orange;
  - very high - red; and
  - extreme - violet.

A forecast will be also be generated for the following 5-days. This forecast targets daytime values. NOTE: The last day may not be daytime values as insufficient data may be supplied from the API query (night time values may substitute, and is distinguished by the night icon).

![Screenshot 2020-10-03](https://github.com/RAMulc/WeatherDashboard/blob/master/Assets/images/Screenshot%202020-10-03.png)



**<u>Core Files:</u>**



**index.html**

Main content for the web page. Links to script.js and style.css. 

Additional styling from Bootstrap, fontawesome, cloudflare.

Makes use of:

​		jquery (v3.2.1): https://code.jquery.com



**./Assets/script/script.js**

Script for the core logic of the dashboard.



**./Assets/css/style.css**

Customised styling (in addition to Bootstrap) for the dashboard.
