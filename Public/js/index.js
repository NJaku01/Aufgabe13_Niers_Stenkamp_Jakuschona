"use strict";

const lat = 51.96;
const lon = 7.59;
const start_latlng = [lat, lon];

var map = L.map("mapdiv", {
    center: start_latlng,
    zoom: 11
});


var routesFeature = L.featureGroup();


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


// Testroute
var line1test = {
    "_id": "5d41a216205cf30395e99b8221",
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        7.492675781249999,
                        51.60437164681676
                    ],
                    [
                        8.37158203125,
                        51.05520733858494
                    ]
                ]
            }
        }
    ]
}
// console.log(line1test.type);

// Testroute
var line2test = {
    "_id": "5d41a216205cf30395e99b8a22",
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        7.18505859375,
                        51.45400691005982
                    ],
                    [
                        8.50341796875,
                        51.699799849741936
                    ]
                ]
            }
        }
    ]
}

// Testroute
var line3test = {
    "_id": "5d41a216205cf30395e99b8123",
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        8.33587646484375,
                        51.47796179607121
                    ],
                    [
                        7.87994384765625,
                        51.037939894299356
                    ]
                ]
            }
        }
    ]
}

// Test AllRoutes
var lines = [];
lines.push(line2test, line3test);
//console.log(lines);
//console.log(line1test);
//console.log(line1test._id);
//console.log(turf.lineIntersect(line1test, line2test));

// console.log(turf);
//console.log(intersect);
/**
 * function which takes one new inputRoute and compares this one with all other animalGeoJson in allRoutes if they intersect.
 * function returns all given intersections.
 * @param inputRoute
 * @param allRoutes
 * @returns {Array}
 */
function calculateIntersect(inputRoute, allRoutes) {
    var intersectAll = [];

    for (var j = 0; j < allRoutes.length; j++) {
        var intersect = turf.lineIntersect(inputRoute, allRoutes[j]);
        intersectAll.push(intersect);
    }

    for (var i = 0; i < intersectAll.length; i++) {
        if (intersectAll[i].features.length == 0) {
            intersectAll.splice(i, 1);
        }
    }
    return intersectAll;
}

//console.log(calculateIntersect(line1test, lines));


function addMap() {

    routesFeature = L.featureGroup();


    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
        id: "osm"
    }).addTo(map); //ad a background Layer to the Map


    //Show coordinates by Click of the Map
    map.on('click', function (e) {
        var popLocation = e.latlng;
        var popup = L.popup()
            .setLatLng(popLocation)
            .setContent("You clicked at " + popLocation)
            .openOn(map);
    });

    $("#mapdiv")[0].scrollIntoView();
    $("#mapdiv")[0].style.visibility = "visible";
}

function addUserRoutes(userRoutes) {

    var geojsons = [];
    var linesArray = [];
    var routes = [];
    var midpoints = [];
    for (var j in userRoutes) {
        var geojson = userRoutes[j].geoJson;
        geojsons.push(JSON.parse(geojson));

    }


    for (var i in geojsons) {
        linesArray.push(geojsons[i].features[0].geometry.coordinates);
        midpoints.push(turf.centroid(geojsons[i]));
    }


    for (var i = 0; i < linesArray.length; i++) {
        for (var j = 0; j < linesArray[i].length; j++) {
            var help = linesArray[i][j][0];
            linesArray[i][j][0] = linesArray[i][j][1];
            linesArray[i][j][1] = help;
        }

        var weather = weatherRequest(midpoints[i].geometry.coordinates[0], midpoints[i].geometry.coordinates[1]);
        weather = JSON.parse(weather);

        var route = L.polyline(linesArray[i], {color: 'red'}).addTo(map);
        routes.push(route);
        routesFeature.addLayer(route);

        //add all Routes to the Map
        var popup = L.popup();
        popup.setContent('Route: ' + userRoutes[i].routeID + "<br/>" + "UserID:" + userRoutes[i].User_ID + "<br/> <img src=\"http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png\" /> <br/>" + "Weather: " + weather.weather[0].description);
        routes[i].bindPopup(popup);

        routes[i].on('mouseover', function (e) {
            var popup = e.target.getPopup();
            popup.setLatLng(e.latlng).openOn(map);
        });

        routes[i].on('mouseout', function (e) {
            e.target.closePopup();
        });
        //add  the PopUps to the Map for the Routes


        for (var j = 0; j < linesArray[i].length; j++) {
            var help = linesArray[i][j][0];
            linesArray[i][j][0] = linesArray[i][j][1];
            linesArray[i][j][1] = help;
        }
    }

    /**
     for (i = 0; i < popUpInformation.length; i++) {
        var marker = L.marker(popUpInformation[i][0]).addTo(map);
        marker.bindPopup("<img src=\"http://openweathermap.org/img/w/" + popUpInformation[i][3] + ".png\" /> <br/>" + popUpInformation[i][1] + "<br>" + popUpInformation[i][2] + "<br>" + popUpInformation[i][4] + "<br>" + popUpInformation[i][5] + "<br>");
        points.addLayer(marker);
    } //add all Markers to the Map with the weather Information

     */

    map.fitBounds(routesFeature.getBounds());// zoom Map to the Markers
}

function addAnimalRoutes(animalRoutes) {
    console.log(animalRoutes);
    var animalGeoJson = [];
    for (var i = 0; i < animalRoutes.length; i++) {
        animalGeoJson.push((JSON.parse(animalRoutes[i].geoJson)));
    }
    console.log(animalGeoJson);
    var collectionOfRoutes = [];
    var coordinates = [];
    for (var i = 0; i < animalGeoJson.length; i++) {

        coordinates.push(animalGeoJson[i].features[0].geometry.coordinates);

        for (var j in coordinates[i]) {
            var help = coordinates[i][j][0];
            coordinates[i][j][0] = coordinates[i][j][1];
            coordinates[i][j][1] = help;
        }

        var polyline = L.polyline(coordinates[i]).addTo(map);
        collectionOfRoutes.push(polyline);
        routesFeature.addLayer(polyline);

        var popup = L.popup();
        popup.setContent("Animal:" + animalRoutes[i].User_ID);
        collectionOfRoutes[i].bindPopup(popup);

        collectionOfRoutes[i].on('mouseover', function (e) {
            var popup = e.target.getPopup();
            popup.setLatLng(e.latlng).openOn(map);
        });

        collectionOfRoutes[i].on('mouseout', function (e) {
            e.target.closePopup();
        });
    }

    map.fitBounds(routesFeature.getBounds());// zoom Map to the Markers
}

function copy(id) {
    console.log("run");
    var existsTextarea = document.getElementById('id');
    existsTextarea.value = "localhost:3000/" + id;
    existsTextarea.select();
    var status = document.execCommand('copy');
    if (!status) {
        console.error("Cannot copy text");
    } else {
        console.log("The text is now on the clipboard");
    }
}

function addUserIntersections(userIntersections) {

    var routesToShow = []
    var userIntersectionsPoints = [];
    for (var i in userIntersections) {

        var lat;
        var lng;

        try {
            userIntersectionsPoints.push(JSON.parse(userIntersections[i].geoJson));

            for (var j in userIntersectionsPoints[i].features) {

                lng = userIntersectionsPoints[i].features[j].geometry.coordinates[0];
                lat = userIntersectionsPoints[i].features[j].geometry.coordinates[1];
                var link = userIntersections[i].id;
                var marker = L.marker([lat, lng]).addTo(map)
                    .bindPopup("User Intersection between: <br/> User1:" + userIntersections[i].UserId + "<br/> User2: " + userIntersections[i].UserIDInput + "<br/>" +
                        "<a href=" + link + ">Link to this Intersection </a> <br> localhost:3000/" + link + "<br> <button onClick='copy(\"" + link + "\")' >Copy Link </button><br>");
                routesFeature.addLayer(marker);
                routesToShow.push(userIntersections[i].routeID);
                routesToShow.push(userIntersections[i].routeIDInput);
            }

        } catch (e) {
            console.log(e);

        }
    }

    map.fitBounds(routesFeature.getBounds());
    return routesToShow;


}

function addAnimalIntersections(userIntersections) {

    var userRoutesToShow = [];
    var animalRoutesToShow = [];
    var userIntersectionsPoints = [];
    var answer = {userRoutes: [], animalRoutes: []};
    for (var i in userIntersections) {

        var lat;
        var lng;

        try {
            userIntersectionsPoints.push(JSON.parse(userIntersections[i].geoJson));

            for (var j in userIntersectionsPoints[i].features) {

                lng = userIntersectionsPoints[i].features[j].geometry.coordinates[0];
                lat = userIntersectionsPoints[i].features[j].geometry.coordinates[1];
                var link = userIntersections[i].id;
                var marker = L.marker([lat, lng]).addTo(map)
                    .bindPopup("Animal Intersection between: <br/> User:" + userIntersections[i].UserIDInput + "<br/> Animal: " + userIntersections[i].UserId + "<br/>" +
                        "<a href=" + link + ">Link to this Intersection </a> <br> localhost:3000/" + link + "<br> <button onClick='copy(\"" + link + "\")' >Copy Link </button><br>");
                routesFeature.addLayer(marker);
                userRoutesToShow.push(userIntersections[i].routeIDInput);
                animalRoutesToShow.push(userIntersections[i].routeID);
            }

        } catch (e) {
            console.log(e);

        }
    }

    map.fitBounds(routesFeature.getBounds());
    answer.userRoutes = userRoutesToShow;
    answer.animalRoutes = animalRoutesToShow;
    return answer;


}


function insertItem(data) {

    $.ajax({
        url: "/item/create", // URL der Abfrage,
        data: data,
        type: "POST"
    })
        .done(function (response) {
            // parse + use data here
            console.log("insert data" + data);
        })
        .fail(function (xhr, status, errorThrown) {
            // handle errors
        })
        .always(function (xhr, status) {


        });

}

/**
 * Ask the openWeatherMap for the actual weather
 * @desc Abgabe zu Aufgabe 4, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 * @param lat
 * @param long
 * @returns {*}
 */
function weatherRequest(long, lat) {
    "use strict";

    console.log("Jungs: Bitte token in der Form speichern wie in der README angegeben, damit wir das einheitlich halten können!");
    var resource = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=" + lat + "&lon=" + long + "&appid=" + token.OPENWEATHERMAP_TOKEN;
    var response = null;

    var xhttp = new XMLHttpRequest();
    try {
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                response = xhttp.response;
            }
        };
        xhttp.open("GET", resource, false);
        xhttp.send();
    } catch (err) {
        alert("no connection to OpenWeatherMap. Please check your internet connection.");
    }


    return response;
}

/**
 * Function that runs when index.html is loaded
 */
function componentDidMount() {
    var id = getParameterByName('id'); //get Parameter from URL
    if (id !== null) {
        filter1(id)
    } else {
        filter1(null)
    }
}

async function filter1(id) {

//get Values from Form
    var userID = document.forms["filter"]["User_ID"].value;
    var animals = document.forms["filter"]["Animal"].value;
    var intersections = document.forms["filter"]["InteractionIDs"].value;
    var wantUserRoutes = document.forms["filter"]["userRoutes"].checked;
    var wantAnimalRoutes = document.forms["filter"]["animalRoutes"].checked;
    var wantUserIntersection = document.forms["filter"]["userIntersections"].checked;
    var wantAnimalIntersections = document.forms["filter"]["animalIntersections"].checked;
    var showEverything = false;
    var userRoutes;
    var routesToShow;
    var animalRoutes;
    var userIntersections = [];
    var animalIntersections = [];
    if (id !== null) {
        intersections = id;
        wantAnimalIntersections = true;
        wantUserIntersection = true;
        wantAnimalRoutes = false;
        wantUserRoutes = false;

    }

    if (userID === "" && animals === "" && intersections === "") {
        showEverything = true; //show Everything if no Filters are set

    }


    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    addMap();

    if (wantAnimalIntersections) {//show Intersections with animals
        query = {};

        if (!showEverything || intersections != "") {
            if (intersections.indexOf(";") === -1) {
                query = "{\"id\": \"" + intersections + "\"}"
            } else {
                var intersection = intersections.substring(0, intersections.indexOf(";"));
                intersections = intersections.substring(intersections.indexOf(";") + 1, intersections.length);
                query = "{ \"$or\" : [ {\"id\": \"" + intersection + "\"} , ";
                while (intersections.indexOf(";") != -1) {
                    intersection = intersections.substring(1, intersections.indexOf(";"));
                    intersections = intersections.substring(intersections.indexOf(";") + 1, intersections.length);
                    query += "{\"id\" : \"" + intersection + "\" } , "
                }
                intersection = intersections.substring(1, intersections.length);
                query += " {\"id\": \"" + intersection + "\"}]}";
            }
        }

        if (intersections != "" || showEverything) {
            try {
                animalIntersections = await getDatabaseFiles("animalIntersections", query);

            } catch {

            }
        }
        if (!showEverything || userID != "") { //filter by user
            if (userID.indexOf(";") === -1) {
                query = "{\"UserIDInput\": \"" + userID + "\"}"
            } else {
                var user = userID.substring(0, userID.indexOf(";"));
                userID = userID.substring(userID.indexOf(";") + 1, userID.length);
                query = "{ \"$or\" : [ {\"UserIDInput\": \"" + user + "\"} , ";
                while (userID.indexOf(";") != -1) {
                    user = userID.substring(1, userID.indexOf(";"));
                    userID = userID.substring(userID.indexOf(";") + 1, userID.length);
                    query += "{\"UserIDInput\" : \"" + user + "\" } , "
                }
                user = userID.substring(1, userID.length);
                query += " {\"UserIDInput\": \"" + user + "\"}]}";
            }


        var animalIntersections2 = [];
            try {
                animalIntersections2 = await getDatabaseFiles("animalIntersections", query);

            } catch {

            }
        }

        animalIntersections = animalIntersections.concat(animalIntersections2);
        query = {};
        if (animals != "") {
            if (animals.indexOf(";") === -1) {
                query = "{\"UserId\": \"" + animals + "\"}"
            } else {
                var animal = animals.substring(0, animals.indexOf(";"));
                animals = animals.substring(animals.indexOf(";") + 1, animals.length);
                query = "{ \"$or\" : [ {\"UserId\": \"" + animal + "\"} , ";
                while (animals.indexOf(";") != -1) {
                    animal = animals.substring(1, animals.indexOf(";"));
                    animals = animals.substring(animals.indexOf(";") + 1, animals.length);
                    query += "{\"UserId\" : \"" + animal + "\" } , "
                }
                animal = animals.substring(1, animals.length);
                query += " {\"UserId\": \"" + animal + "\"}]}";
            }

            animalIntersections2 = [];
            try {
                animalIntersections2 = await getDatabaseFiles("animalIntersections", query);

            } catch {

            }
            animalIntersections = animalIntersections.concat(animalIntersections2);
        }


        if (animalIntersections.length !== 0) {//if the database Found some Intersections show them
            routesToShow = addAnimalIntersections(animalIntersections);

            if (routesToShow.userRoutes.length != 0) { //if there are some user Routes, which belong to the Intersection show them
                var userRoutes
                query = "{\"$or\" : [ { \"routeID\" : \"" + routesToShow.userRoutes[0] + "\"}, ";
                for (var i = 1; i < routesToShow.userRoutes.length - 1; i++) {
                    query += "{ \"routeID\" : \"" + routesToShow.userRoutes[i] + "\"},"
                }
                query += "{ \"routeID\" : \"" + routesToShow.userRoutes[routesToShow.userRoutes.length - 1] + "\"}]}"


                try {
                    userRoutes = await getDatabaseFiles("userRoutes", query);

                } catch (e) {
                    console.log(e)

                }

                addUserRoutes(userRoutes);

                if (routesToShow.animalRoutes.length != 0) { //the same from ther user Routes for the animal routes
                    query = "{\"$or\" : [ { \"routeID\" : \"" + routesToShow.animalRoutes[0] + "\"}, ";
                    for (var i = 1; i < routesToShow.animalRoutes.length - 1; i++) {
                        query += "{ \"routeID\" : \"" + routesToShow.animalRoutes[i] + "\"},"
                    }
                    query += "{ \"routeID\" : \"" + routesToShow.animalRoutes[routesToShow.animalRoutes.length - 1] + "\"}]}"


                    try {
                        routesToShow = await getDatabaseFiles("animalRoutes", query);

                    } catch (e) {
                        console.log(e)

                    }

                    addAnimalRoutes(routesToShow);
                }
            }
        } else {
            alert("No Animal Intersections found")
        }
    }


    if (wantUserIntersection || intersections != "") {
        query = {};
        if (!showEverything) {
            if (intersections.indexOf(";") === -1) {
                query = "{\"id\": \"" + intersections + "\"}"
            } else {
                var intersection = intersections.substring(0, intersections.indexOf(";"));
                intersections = intersections.substring(intersections.indexOf(";") + 1, intersections.length);
                query = "{ \"$or\" : [ {\"id\": \"" + intersection + "\"} , ";
                while (intersections.indexOf(";") != -1) {
                    intersection = intersections.substring(1, intersections.indexOf(";"));
                    intersections = intersections.substring(intersections.indexOf(";") + 1, intersections.length);
                    query += "{\"id\" : \"" + intersection + "\" } , "
                }
                intersection = intersections.substring(1, intersections.length);
                query += " {\"id\": \"" + intersection + "\"}]}";
            }
        }
        if (intersections != "" || showEverything) {
            try {
                userIntersections = await getDatabaseFiles("userIntersections", query);

            } catch {

            }
        }

        query = {};
        routesToShow = [];

        if (!showEverything) {
            if (userID.indexOf(";") === -1) {
                query = "{\"$or\" : [{\"UserId\": \"" + userID + "\"} , { \"UserIDInput\" : \"" + userID + "\"}]}"
            } else {
                var user = userID.substring(0, userID.indexOf(";"));
                userID = userID.substring(userID.indexOf(";") + 1, userID.length);
                query = "{ \"$or\" : [ {\"UserId\": \"" + user + "\"} , { \"UserIDInput\" : \"" + user + "\"} ,  ";
                while (userID.indexOf(";") != -1) {
                    user = userID.substring(1, userID.indexOf(";"));
                    userID = userID.substring(userID.indexOf(";") + 1, userID.length);
                    query += " {\"UserId\": \"" + user + "\"} , { \"UserIDInput\" : \"" + user + "\"} , "
                }
                user = userID.substring(1, userID.length);
                query += " {\"UserId\": \"" + user + "\"} , { \"UserIDInput\" : \"" + user + "\"}]}";
            }

        }
        if (userID != "" || showEverything)
            try {
                var userIntersections2 = await getDatabaseFiles("userIntersections", query);
                userIntersections = userIntersections.concat(userIntersections2);


            } catch (e) {
                console.log(e)
            }

        if (userIntersections.length !== 0) {
            routesToShow = addUserIntersections(userIntersections);
        } else {
            alert("No User Intersections found")
        }

        if (routesToShow.length != 0) {
            query = "{\"$or\" : [ { \"routeID\" : \"" + routesToShow[0] + "\"}, ";
            for (var i = 1; i < routesToShow.length - 1; i++) {
                query += "{ \"routeID\" : \"" + routesToShow[i] + "\"},"
            }
            query += "{ \"routeID\" : \"" + routesToShow[routesToShow.length - 1] + "\"}]}"


            try {
                routesToShow = await getDatabaseFiles("userRoutes", query);

            } catch (e) {
                console.log(e)

            }

            addUserRoutes(routesToShow);

        }

    }


    if (wantUserRoutes) {

        var query = {};

        if (userID != "") {
            if (userID.indexOf(";") === -1) {
                query = "{\"User_ID\": \"" + userID + "\"}"
            } else {
                var user = userID.substring(0, userID.indexOf(";"));
                userID = userID.substring(userID.indexOf(";") + 1, userID.length);
                query = "{ \"$or\" : [ {\"User_ID\": \"" + user + "\"} , ";
                while (userID.indexOf(";") != -1) {
                    user = userID.substring(1, userID.indexOf(";"));
                    userID = userID.substring(userID.indexOf(";") + 1, userID.length);
                    query += " {\"User_ID\": \"" + user + "\"} , "
                }
                user = userID.substring(1, userID.length);
                query += " {\"User_ID\": \"" + user + "\"}]}";
            }
        }
        if (showEverything || userID != "") {
            try {
                userRoutes = await getDatabaseFiles("userRoutes", query);

            } catch (e) {
                console.log(e);

            }

            if (userRoutes.length === 0) {
                alert("The API didn't found User Routes to show. Please makes sure there are User Routes in the Database or the UserID really exists. " +
                    "Maybe you enteret the UserID the wrong way:" +
                    "To Show all routes just leave the field empty" +
                    "Tho Show routes of just on User enter only the UserID" +
                    "Tho Show routes of more Users seperate the UserIDs by \";\" eg. \"1; 2\" ")
            } else {
                addUserRoutes(userRoutes);
            }
        }
    }
    if (wantAnimalRoutes) {

        var query = {};
        if (animals != "") {
            if (animals.indexOf(";") === -1) {
                query = "{\"USER_ID\": \"" + animals + "\"}"
            } else {
                var animal = animals.substring(0, animals.indexOf(";"));
                animals = animals.substring(animals.indexOf(";") + 1, animals.length);
                query = "{ \"$or\" : [ {\"USER_ID\": \"" + animal + "\"} , ";
                while (animals.indexOf(";") != -1) {
                    animal = animals.substring(1, animals.indexOf(";"));
                    animals = animals.substring(animals.indexOf(";") + 1, animals.length);
                    query += " {\"USER_ID\": \"" + animal + "\"} , "
                }
                animal = animals.substring(1, animals.length);
                query += " {\"USER_ID\": \"" + animal + "\"}]}";
            }
        }
        if (showEverything || animals != "") {


            try {
                animalRoutes = await getDatabaseFiles("animalRoutes", query);
                console.log(animalRoutes);
            } catch (e) {
                console.log(e);
            }

            if (animalRoutes.length === 0) {
                alert("No animal routes found");
            } else {
                addAnimalRoutes(animalRoutes);
            }
        }


    }


}


/**
 * Shows the Items from mongodb in a textarea
 * @desc Abgabe zu Aufgabe 7, Geosoft 1, SoSe 2019
 * @author Nick Jakuschona n_jaku01@wwu.de
 */
async function getDatabaseFiles(collection, query) {

    //Example query: "{\"User_ID\" : \"1234\"}"

    return $.ajax({
        url: "/item", // URL der Abfrage,
        data: {collection: collection, query: query},
        type: "POST"
    })


};

var resource = "movebank";

/**
 $.get(resource, function(response, status, x){
    let formatted_response = JSON.stringify(response,null,4);
    $("#movebankJson").text(formatted_response);

    let transMovebankResponse = transformMovebankJson(response);
    console.log(transMovebankResponse);
    console.log(transMovebankResponse[0].geojson.features.geometry.coordinates);

    var coordinates = [];

    for (i = 0; i < transMovebankResponse.length; i++) {
        var datastring = JSON.stringify(transMovebankResponse[i].geojson);
        insertItem({collection: "animalRoutes", animal: transMovebankResponse[i].User_ID, geoJson: datastring} );
        coordinates.push(transMovebankResponse[i].geojson.features.geometry.coordinates)
    }
    console.log(coordinates);
    //var polyline = L.polyline(coordinates).addTo(map);
    //map.fitBounds(polyline.getBounds());
});
 */

