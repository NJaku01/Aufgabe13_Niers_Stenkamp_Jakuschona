//Nick Jakuschona 450709
// jshint esversion: 6

const lat = 51.96;
const lon = 7.59;
const start_latlng = [lat, lon];
var drawnItems;
var mongodbJSON;


var map = L.map("mapdiv", {
    center: start_latlng,
    zoom: 11
});

var layers = L.featureGroup().addTo(map);

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
    id: "osm"
}).addTo(map);


var control = L.Routing.control({
    waypoints: [], routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim()
}).on('routesfound', function (e) {
    "use strict";
    layers.clearLayers();
    drawnItems = e.routes[0];
    var coord = drawnItems.coordinates;
    drawnItems = L.geoJson(getGeoJson(coord));
    control.hide();
    document.getElementById("geojson").value = JSON.stringify(drawnItems.toGeoJSON());
    document.getElementById("geojsonUpdate").value = JSON.stringify(drawnItems.toGeoJSON());
    updateText();
    // alert('Found ' + .length + ' route(s).');
});
control.addTo(map);

/**
 * Some events that happen if the page is loaded, to reload the last result or set the navigation bar
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 */
function events() {
    $(function () {
        $("#nav-placeholder").load("nav.html");
    });
    if (getCookie("resultLine") == "1") {
        var eval = confirm("Do you wont to load last result?");
        var value = "";
        if (eval === true) {
            value = localStorage.getItem("resultLine");
            document.getElementById("geojsontextarea").value = value;
        } else {
            drawnItems = "";
            document.getElementById("geojsonUpdate").value = "";
            document.getElementById("geojson").value = "";
            setCookie("resultLine", "", 15)
            deleteText();
        }
    }

}

/**
 * Shows the Items from mongodb in a textarea
 * @desc Abgabe zu Aufgabe 7, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 */
function showFiles() {
    $.ajax({
        url: "/item", // URL der Abfrage,
        //data: {foo: "bar"},
        type: "GET"
    })
        .done(function (response) {
            // parse + use data here
            mongodbJSON = response;
        })
        .fail(function (xhr, status, errorThrown) {
            // handle errors
        })
        .always(function (xhr, status) {
            if (mongodbJSON.length == 0) {
                alert("no routes in database");
            }
            document.getElementById("database").value = JSON.stringify(mongodbJSON);

        });

    //insertItem({foo: "bar"})
}

function insertItem(data){

$.ajax({
    url: "/item/create", // URL der Abfrage,
    data: data,
    type: "POST"
})
    .done(function (response) {
        // parse + use data here
        console.log("inerst data" +data);
    })
    .fail(function (xhr, status, errorThrown) {
        // handle errors
    })
    .always(function (xhr, status) {


    });

}

/**
 * If the textfield will be edited the Inserted Route will be loaded in the Route Creator, so it is possible to edit the route.
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 * @param route the route that can be edited
 */
function showLine(route) {
    var line;
    try {
        line = JSON.parse(route);

    } catch (e) {
        alert("No JSON inserted");
    }
    if (checkIfGeoJsonLineString(route)) {

        var length = line.features[0].geometry.coordinates.length;
        if (length > 30) {
            alert("You are only allowed to insert 30 Waypoints to calculate the route");
        } else {
            control.spliceWaypoints(0, 10000000);
            for (var i = 0; i < length; i++) {

                control.spliceWaypoints(i, 0, [line.features[0].geometry.coordinates[i][1], line.features[0].geometry.coordinates[i][0]]);

            }
            control.spliceWaypoints(length, 2);
        }


    } else {
        alert("No valid Line string inserted");
        document.getElementById("geojsonUpdate").value = route;
        document.getElementById("geojson").value = route;
    }
}

/**
 * Proofs if the the given string is a valid GeoJson Feature collection of LineStings
 * @desc Abgabe zu Aufgabe 4, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 * @param text the text to proof
 * @returns {boolean} true if the text is a geojson Linestring
 */
function checkIfGeoJsonLineString(text) {
    "use strict";

    var regex = /\s*{\s*"type"\s*:\s*"FeatureCollection"\s*,\s*"features"\s*:\s*\[\s*({\s*"type"\s*:\s*"Feature"\s*,\s*"properties"\s*:\s*{(\s*"[a-zA-z\d]"*\s*:\s*"[a-zA-z\d]"\s*,\s*)*(\s*"[a-zA-z\d]"*\s*:\s*"[a-zA-z\d]"\s*)?}\s*,\s*"geometry"\s*:\s*{\s*"type"\s*:\s*"LineString"\s*,\s*"coordinates"\s*:\s*\s*\[\s*(\[\s*-?\d{1,2}(\.\d*)?,\s*-?\d{1,3}(\.\d*)?\s*\]\s*,\s*)*\[\s*-?\d{1,2}(\.\d*)?,\s*-?\d{1,3}(\.\d*)?\s*\]\s*\]\s*\}\s*\}\s*,\s*)*\s*{\s*"type"\s*:\s*"Feature"\s*,\s*"properties"\s*:\s*{(\s*"[a-zA-z\d]"*\s*:\s*"[a-zA-z\d]"\s*,\s*)*(\s*"[a-zA-z\d]"*\s*:\s*"[a-zA-z\d]"\s*)?}\s*,\s*"geometry"\s*:\s*{\s*"type"\s*:\s*"LineString"\s*,\s*"coordinates"\s*:\s*\[\s*(\[\s*-?\d{1,2}(\.\d*)?\s*,\s*-?\d{1,3}(\.\d*)?\s*\]\s*,\s*)*\[\s*-?\d{1,2}(\.\d*)?\s*,\s*-?\d{1,3}(\.\d*)?\s*\]\s*\]\s*\}\s*\}\s*\]\s*\}\s*/gi;
    var answer = document.getElementById("lineAnswer");
    var button = document.getElementById("button");

    if (regex.test(text)) {
        return true;
    } else {
        return false;
    }


}

/**
 * Transforms an array of coordinates in a correct GeoJSON LineString
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 * @param coord the coordinates of the line string
 * @returns {{features: Array, type: string}} the GeoJSON LineString
 */
function getGeoJson(coord) {
    "use strict";
    var instrPts = {
        type: "FeatureCollection",
        features: []
    };
    var coordinates = switchCoordinates(coord);
    var g = {
        "type": "LineString",
        "coordinates": coordinates
    };

    instrPts.features.push({

        "type": "Feature",
        "properties": {},
        "geometry": g,
    });

    return instrPts;

}

/**
 * Changes the coordinates lat,lng
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 * @param coord coordinates to change
 * @returns {Array} changed coordinnates
 */
function switchCoordinates(coord) {
    "use strict";
    var coordi = [];
    for (var i = 0; i < coord.length; ++i) {
        var waypoints = [];
        waypoints.push(coord[i].lng);
        waypoints.push(coord[i].lat);
        coordi.push(waypoints);
    }
    return coordi;
}

/**
 * clears the Text area
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 */
function deleteText() {
    "use strict";
    document.getElementById("geojsontextarea").value = "";

}

/**
 * creates a geojson text representation from the the drawnItems with a FeatureCollection as root element
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 */
function updateText() {
    "use strict";

    setCookie("resultLine", "1", 15);
    localStorage.setItem("resultLine", JSON.stringify(drawnItems.toGeoJSON()));

    document.getElementById("geojsontextarea").value = JSON.stringify(drawnItems.toGeoJSON());

}

/**
 * Function that return the vale of the cookie with the name cname
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 * @param cname the name of the cookie
 * @returns {string} the value of the cookie
 */
function getCookie(cname) {
    "use strict";
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/**
 * Function to set a cookie
 * @desc Abgabe zu Aufgabe 5, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 * @param cname name of the cookie
 * @param cvalue value of the cookie
 * @param exdays days when the cookie extend
 */
function setCookie(cname, cvalue, exdays) {
    "use strict";
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * validate the form, if the values can svaed/updated/deleted in the database
 * @param form to validate
 * @returns {boolean} if the form is correct
 */
function validateForm(form) {
    "use strict";
    if (form == "create" || form == "update") {
        var x = document.forms[form]["geojson"].value;
        if (x == "") {
            alert("A route must be selected");
            return false;
        }
        else if(!checkIfGeoJsonLineString(x))
        {
            alert("No valid GeoJson inserted. Use the Routing Machine to create a valid GeoJson");
            return false;
        }
    }
    if (form == "update" || form == "delete") {
        x = document.forms[form]["_id"].value;
        if (x == "") {
            alert("A id must be selected");
            return false;
        }
        else if(x.length<12)
        {
            alert("A id must be at least 12 characters long");
            return false;
        }
    }

}