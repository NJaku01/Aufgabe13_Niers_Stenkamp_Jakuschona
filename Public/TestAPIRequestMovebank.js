
var json; // array with the result from the request to the openweathermap API


/**
 * @desc Function which is requesting the needed data from the openWeatherMap API.
 * Here the name, temperature, description, icon and main weather for given coordinate is requested from the API.
 * If there is not any weather data available e.g. because of lost internet connection there is alert.
 * @param {array} coordinate Array which contains to numbers for the coordinates
 */
function Request1() {
    $.ajax({
        url: 'https://www.movebank.org/movebank/service/public/json?&study_id=2911040&individual_local_identifiers[]=4262-84830876&max_events_per_individual=5&sensor_type=gps', // URL der Abfrage,
        //contentType: "application/json"
    })
        .done(function (response) {
            console.log(json);
            json = response;
            //$("#content").text(JSON.stringify(response, null, 4));
            console.log("done");
        })

        .fail(function (xhr, status, errorThrown) {
            // handle errors
            console.log(xhr, status, errorThrown);
        })



        /*
         with always the next function which is called is startApplication(). The function startApplicationWithMongodb()
         is an asynchronous function because its an ajax call. The functions which are named below always are only
         (erst) called if the ajax request is done.
         */
        .always(function (xhr, status) {
            show();
        });
}

/**
 * @desc Function which shows the two GeoJSON files in the text fields already by loading the html page.
 */
function show() {
    "use strict";
    document.getElementById("jsonWindow").value = JSON.stringify(json);
}



