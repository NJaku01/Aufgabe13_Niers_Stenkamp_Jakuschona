
var json; // array with the result from the request to the openweathermap API
var username = "t_nier01";
var password = "Geosoft.123";

/**
 * @desc Function which is requesting the needed data from the openWeatherMap API.
 * Here the name, temperature, description, icon and main weather for given coordinate is requested from the API.
 * If there is not any weather data available e.g. because of lost internet connection there is alert.
 * @param {array} coordinate Array which contains to numbers for the coordinates
 */
/**
function Request1() {
    $.ajax({
        // with this URL also data which is private can be requested
        url: 'https://' + username + ':' + password + '@www.movebank.org/movebank/service/json-auth?&study_id=2911040&individual_local_identifiers[]=4262-84830876&max_events_per_individual=5&sensor_type=gps',
        // url: 'https://t_nier01:Geosoft.123@www.movebank.org/movebank/service/json-auth?&study_id=2911040&individual_local_identifiers[]=4262-84830876&max_events_per_individual=5&sensor_type=gps',
        // url: 'https://www.movebank.org/movebank/service/json-auth?&study_id=2911040&individual_local_identifiers[]=4262-84830876&max_events_per_individual=5&sensor_type=gps', // URL der Abfrage,
        //contentType: "application/json"
        dataType: "jsonp"
    })

        .done(function (response) {
            console.log(json);
            json = response;
            //$("#content").text(JSON.stringify(response, null, 4));
            console.log("done");
            console.log(json);
            console.log(username + password);
        })

        .fail(function (xhr, status, errorThrown) {
            // handle errors
            console.log(xhr, status, errorThrown);
        })

        .always(function (xhr, status) {
            show();
        });
}

**/

var resource = "weather.json";

    $.get(resource, function (response, status, x) {
        let formatted_response = JSON.stringify(response, null, 4);
        $("#weather-info").text(formatted_response);
    });

/**
 * @desc Function which shows the two GeoJSON files in the text fields already by loading the html page.

function show() {
    "use strict";
    document.getElementById("jsonWindow").value = JSON.stringify(json);
}

*/

