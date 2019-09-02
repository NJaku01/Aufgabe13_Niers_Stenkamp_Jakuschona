// jshint esversion: 6

const lat = 51.96;
const lon = 7.59;
const start_latlng = [lat, lon];
var drawnItems;
var mongodbJSONUserRoutes = [];
var mongodbJSONAnimalRoutes = [];


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
 * Some events that happen if the page is loaded, to reload the last result or set the navigation bar.
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
 * Shows the Items from mongodb in a textarea, by calling the function getFilesFromMongodb.
 * @param collection
 * @param query
 * @returns {Promise<void>}
 */
async function showFiles(collection, query) {
try {
    mongodbJSON = await getFilesFromMongodb(collection, query);

    if (mongodbJSON.length == 0) {
        alert("no routes in database");
    }
    document.getElementById("database").value = JSON.stringify(mongodbJSON);
}
catch {}
}

/**
 * Gets the Items from mongodb depending on the collection in which the items are stored in the mongodb.
 * @param collection
 * @param query
 * @returns {Promise<*|jQuery|{getAllResponseHeaders, abort, setRequestHeader, readyState,
 *          getResponseHeader, overrideMimeType, statusCode}>}
 */
async function getFilesFromMongodb(collection, query) {

    //Example query: "{\"User_ID\" : \"1234\"}"
    return $.ajax({
        url: "/item", // URL of the request
        data: {collection: collection, query: query},
        type: "POST"
    })

}

/**
 * Function for inserting an item into mongodb.
 * @param data
 */
function insertItem(data){
$.ajax({
    url: "/item/create", // URL of the request
    data: data,
    type: "POST"
})
    .done(function (response) {
        // parse + use data here
    })
    .fail(function (xhr, status, errorThrown) {
        // handle errors
    })
    .always(function (xhr, status) {


    });

}

/**
 * If the textfield will be edited the Inserted Route will be loaded in the Route Creator,
 * so it is possible to edit the route.
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
            document.getElementById("geojsonUpdate").value = route;
            document.getElementById("geojson").value = route;
        } else {
            control.spliceWaypoints(0, 10000000);
            for (var i = 0; i < length; i++) {

                control.spliceWaypoints(i, 0, [line.features[0].geometry.coordinates[i][1], line.features[0].geometry.coordinates[i][0]]);

            }
            control.spliceWaypoints(length, 2);
        }


    } else {
        alert("No valid Line string inserted");
    }
}

/**
 * Proofs if the the given string is a valid GeoJson Feature collection of LineStings.
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
 * Transforms an array of coordinates in a correct GeoJSON LineString.
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
 * Changes the coordinates lat,lng.
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
 * Clears the Text area.
 */
function deleteText() {
    "use strict";
    document.getElementById("geojsontextarea").value = "";

}

/**
 * Creates a geojson text representation from the the drawnItems with a FeatureCollection as root element.
 */
function updateText() {
    "use strict";

    setCookie("resultLine", "1", 15);
    localStorage.setItem("resultLine", JSON.stringify(drawnItems.toGeoJSON()));

    document.getElementById("geojsontextarea").value = JSON.stringify(drawnItems.toGeoJSON());

}

/**
 * Function that return the vale of the cookie with the name cname.
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
 * Function to set a cookie.
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
 * Validate the form, if the values are saved(created)/updated/deleted in the mongodb. Besides if there are
 * intersections between stored animalRoutes/ userRoutes and the input userRoute, the intersections are stored
 * in mongodb.
 * @param form
 * @returns {Promise<boolean>}
 */
async function validateForm(form) {
    "use strict";
    if(form === "update"){
        var id = document.forms[form]["_id"].value;
        deleteDatabaseFiles("userIntersections", "{\"$or\" : [ {\"routeID\" : \"" + id + "\"} , {\"routeIDInput\" : \"" + id + "\"}]} ");
        deleteDatabaseFiles("animalIntersections", "{\"$or\" : [ {\"routeID\" : \"" + id + "\"} , {\"routeIDInput\" : \"" + id + "\"}]} ")
    }

    try {
        // If there is a new userRoute added or if a userRoute is updated
        if (form == "create" || form == "update") {
            var inputJSON = document.forms[form]["geoJson"].value;
            var userIDInput = document.forms[form]["User_ID"].value;
           if (inputJSON == "") {
                alert("A route must be selected");
                return false;
            } else if (!checkIfGeoJsonLineString(inputJSON)) {
                alert("No valid GeoJson inserted. Use the Routing Machine to create a valid GeoJson");
                return false;
            }
            if (userIDInput == "") {
                alert("A userID must be selected");
                return false;
            }

            /*
             There is a random routeID for each added userRoute. This routeID gets only created if there is a new
             userRoute, but not if the userRoute is only updated
             */
            var routeIDInput;
            if(form=== "create") {
                routeIDInput = "U" + Math.random().toString(36).substring(3, 15);
                document.getElementById("routeID").value = routeIDInput;
            }
            else{
                routeIDInput = id;
            }

            // variable for all the userRoutes stored in Mongodb
            mongodbJSONUserRoutes = await getFilesFromMongodb("userRoutes");
            /*
            If the userRoute with the corresponding routeID is already in Mongodb, the userRoute will not be added again
             */
            for (var i in mongodbJSONUserRoutes){
                if(mongodbJSONUserRoutes[i].routeID == id){
                    mongodbJSONUserRoutes.splice(i, 1);
                }
            }

            // variable for all the animalRoutes stored in Mongodb
            mongodbJSONAnimalRoutes = await getFilesFromMongodb("animalRoutes");

            /*
             Calculation of the Intersects between the userRoutes stored in Mongodb and the new input userRoute. If
             there is an intersection, its stored in mongo db under the collection userIntersections.
             */
            calculateIntersect(routeIDInput, userIDInput, inputJSON, mongodbJSONUserRoutes, "userIntersections");

            /*
             Calculation of the Intersects between the userRoutes stored in Mongodb and the new input animalRoute. If
             there is an intersection, its stored in mongo db under the collection userIntersections.
             */
            calculateIntersect(routeIDInput, userIDInput, inputJSON, mongodbJSONAnimalRoutes, "animalIntersections");
        }
        // if a userRoute gets updated or delete there is a need for the corresponding id.
        if (form == "update" || form == "delete") {
            var id = document.forms[form]["_id"].value;
            if (id == "") {
                alert("A id must be selected");
                return false;
            }
        }

        // depending on the input id the corresponding element in mongodb is deleted.
        if (form == "deleteAnimal") {
            var id = document.forms[form]["Study_ID"].value;
            if (id == "") {
                alert("A Study_ID must be selected");
                return false;
            }
        }

        if(form == "deleteAnimal"){
            var id = document.forms[form]["Study_ID"].value;
            // deleteDatabaseFiles("userIntersections", "{\"$or\" : [ {\"routeID\" : \"" + id + "\"} , {\"routeIDInput\" : \"" + id + "\"}]} ");
            deleteDatabaseFiles("animalIntersections", "{\"$or\" : [ {\"routeID\" : \"" + id + "\"} , {\"routeIDInput\" : \"" + id + "\"}]} ")
        }

        if(form === "delete"){
            var id = document.forms[form]["_id"].value;
            deleteDatabaseFiles("userIntersections", "{\"$or\" : [ {\"routeID\" : \"" + id + "\"} , {\"routeIDInput\" : \"" + id + "\"}]} ");
            deleteDatabaseFiles("animalIntersections", "{\"$or\" : [ {\"routeID\" : \"" + id + "\"} , {\"routeIDInput\" : \"" + id + "\"}]} ")
        }
    }
    catch(e){ console.log(e)}
}

/**
 * If the function is called, the item in mongodb depending on collection and query is deleted.
 * @param collection
 * @param query
 * @returns {Promise<void>}
 */
async function deleteDatabaseFiles(collection, query) {
    //Example query: "{\"User_ID\" : \"1234\"}"
    $.ajax({
        url: "/item/delete", // URL of the request
        data: {collection: collection, query: query},
        type: "POST"
    })


};

/**
 * All items in mongodb depending on collection will get deleted.
 * @param collection
 */
function deleteAll(collection){
    $.ajax({
        url: "/item/deleteAll", // URL of the request
        data: {collection: collection},
        type: "POST"
    })
        .done(function (response) {
            // parse + use data here
        })
        .fail(function (xhr, status, errorThrown) {
            // handle errors
        })
        .always(function (xhr, status) {


        });

}

/**
 * Transforms the Response from the Movebank Request into an json with the necessary information
 * including a valid geojson.
 * @param movebankResponse
 * @returns {Array} of json animal routes
 */
function transformMovebankJson(movebankResponse) {

    var jsonArray = [];

    var coordinates = [];
    var latlon = [];

    // compose a json for every animal returned by the movebank api
    for (i = 0; i < movebankResponse.individuals.length; i++){

        var json = {"User_ID":"","Name":"","Type":"","date":"","time":"", "routeID": "",
            "geoJson":{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[]}}]}};

        json.User_ID = movebankResponse.individuals[i].individual_taxon_canonical_name;
        json.Name = movebankResponse.individuals[i].individual_local_identifier;
        json.Type = "animal";
        json.routeID = "A" +  Math.random().toString(36).substring(3, 15);
        var date = new Date(movebankResponse.individuals[i].locations[0].timestamp);
        json.date = date.toISOString().substring(0, 10);;
        json.time = date.toISOString().substring(12, 16);;

        coordinates = [];

        // compose coordinates
        for (j = 0; j < movebankResponse.individuals[i].locations.length; j++) {
            latlon = [];
            latlon[1] = movebankResponse.individuals[i].locations[j].location_lat;
            latlon[0] = movebankResponse.individuals[i].locations[j].location_long;
            coordinates.push(latlon);
        }

        // add coordinates to json
        json.geoJson.features[0].geometry.coordinates = coordinates;

        jsonArray.push(json);
    }
    return jsonArray;
}

/**
 * Sends the server-request to the movebank-API, converts the response, calculates the Intersections between users and
 * animals and saves everything to the database.
 * @returns {Promise<void>}
 */
async function getFilesFromMovebank() {
    try {
        /**
         * Working Study IDs:
         * Belgien bis Afrika: 604806671
         * Galapagos: 2911040
         * Süddeutschland / Osteuropa: 446579
         * Süddeutschland bis Spanien: 186178781, 173641633
         * Nord-Osteuropa: 92261778
         * Litauen bis Spanien: 195375760
         * Litauen bis Afrika: 150764908
         *
         * Mit Agreement:
         * Dänemark: 49535504
         * Spiekeroog: 183209639
         * NIederland: 163020445
         * Nord- & Osteuropa: 467107447
         * Schweden bis Holland: 350174730
         * Schweden bis Spanien: 10722328
         *
         */

        // get study id from the form
        var study = document.forms["createAnimal"]["Study_ID"].value;

        var resource = "movebank/" + study;

        $('body').css('cursor', 'progress');

        $.get(resource, async function (response, status, x) {

            /**
             let formatted_response = JSON.stringify(response, null, 4);
             $("#movebankJson").text(formatted_response);
             */

            let transMovebankResponse = transformMovebankJson(response);

            // variable for all the userRoutes stored in Mongodb
            mongodbJSONUserRoutes = await getFilesFromMongodb("userRoutes");

            for (i = 0; i < transMovebankResponse.length; i++) {
                insertItem({
                    collection: "animalRoutes",
                    Study_ID: study,
                    User_ID: transMovebankResponse[i].User_ID,
                    Name: transMovebankResponse[i].Name,
                    Type: transMovebankResponse[i].Type,
                    date: transMovebankResponse[i].date,
                    time: transMovebankResponse[i].time,
                    routeID: transMovebankResponse[i].routeID,
                    geoJson: JSON.stringify(transMovebankResponse[i].geoJson)
                });

                // Calculates intersections between user and new animal routes if there are any
                calculateIntersect(transMovebankResponse[i].routeID, transMovebankResponse[i].User_ID, JSON.stringify(transMovebankResponse[i].geoJson), mongodbJSONUserRoutes, "animalIntersections");
            }

            // request progress finished
            $('body').css('cursor', 'default');
            alert("Routes of Study No. " + study + " have been added to the Database!");

        })
    } catch {}
}

function showMovebankInformation() {
    $("#movebankInfo").toggleClass('d-none');
}


/**
 * function which takes one new inputRoute with the corresponding routeID and userID and compares this one with
 * all other routes in allRoutes. If there is an intersection this intersection will be saved in the proportionate
 * collection in mongodb. For example intersections between userRoute and userRoute are saved in collection
 * userIntersections and intersections between userRoute and animalRoute are saved in the collection
 * animalIntersections. For each intersection there is a random userInteractionsID created.
 * @param inputRoute
 * @param allRoutes
 * @param routeIDInput
 * @param userIDInput
 * @param inputRoute
 * @param allRoutes
 * @param collection
 */
function calculateIntersect(routeIDInput, userIDInput, inputRoute, allRoutes, collection) {
    var parseInputRoute = JSON.parse(inputRoute);

    for (var j=0; j<allRoutes.length; j++) {

        var intersect = turf.lineIntersect(parseInputRoute, JSON.parse(allRoutes[j].geoJson));
        /*
        The turf function returns an empty array with length 0 if there is no intersection, therefore only the arrays
        with an content are stored in mongodb.
         */
        if (intersect.features.length != 0) {
            intersect=JSON.stringify(intersect);
            var intersectionsID = Math.random().toString(36).substring(2, 15);
            if (routeIDInput.substring(0,0)== "U") {
                insertItem({collection: collection, geoJson: intersect, id: intersectionsID, routeID: allRoutes[j].routeID, UserId: allRoutes[j].User_ID, UserIDInput: userIDInput, routeIDInput: routeIDInput});
            } else {
                insertItem({collection: collection, geoJson: intersect, id: intersectionsID, routeID: allRoutes[j].routeID, UserId: userIDInput, UserIDInput: allRoutes[j].User_ID, routeIDInput: routeIDInput});
            }

        }
      intersect = {};
    }
}

