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
    "_id":"5d41a216205cf30395e99b8221",
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
    "_id":"5d41a216205cf30395e99b8a22",
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
    "_id":"5d41a216205cf30395e99b8123",
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
    var intersectAll=[];

    for (var j=0; j<allRoutes.length; j++) {
                var intersect = turf.lineIntersect(inputRoute, allRoutes[j]);
                intersectAll.push(intersect);
        }

    for (var i=0; i<intersectAll.length; i++) {
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

function addUserRoutes(userRoutes){

    var geojsons=[];
    var linesArray=[];
    var routes=[];
    var midpoints=[];
    for (var j in userRoutes) {
        var geojson = userRoutes[j].geojson;
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

        var weather = weatherRequest(midpoints[i].geometry.coordinates[0],midpoints[i].geometry.coordinates[1]);
        weather= JSON.parse(weather);

        var route = L.polyline(linesArray[i], {color: 'red'}).addTo(map);
        routes.push(route);
        routesFeature.addLayer(route);

        //add all Routes to the Map
        var popup = L.popup();
        popup.setContent('Route: ' + (i + 1) + "<br/>" +  "UserID:" + userRoutes[i].User_ID + "<br/> <img src=\"http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png\" /> <br/>" +"Weather: " + weather.weather[0].description);
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

function addAnimalroutes(animalRoutes)
{
    var animalGeoJson=[];
    for (var i =0; i<animalRoutes.length; i++){
        animalGeoJson.push((animalRoutes[i].geoJson));
    }
    var collectionOfRoutes = [];
    var coordinates = [];
    for (var i = 0; i < animalGeoJson.length; i++) {

        coordinates.push(animalGeoJson[i].features.geometry.coordinates);

        var polyline = L.polyline(coordinates[i]).addTo(map);
        collectionOfRoutes.push(polyline);
        routesFeature.addLayer(polyline);

        var popup = L.popup();
        popup.setContent("Animal:" + animalRoutes[i].animal);
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

function addUserIntersections(userIntersections){

    var routesToShow= []
    var userIntersectionsPoints= [];
    for( var i in userIntersections){

        var lat;
        var lng;

        try{
          userIntersectionsPoints.push(JSON.parse(userIntersections[i].geoJson));

          lng=userIntersectionsPoints[i].features[0].geometry.coordinates[0];
          lat=userIntersectionsPoints[i].features[0].geometry.coordinates[1];
          var marker= L.marker([lat,lng]).addTo(map)
              .bindPopup("User Intersection between: <br/> User1:" + userIntersections[i].UserId +"<br/> User2: " + userIntersections[i].UserIDInput);
          routesFeature.addLayer(marker);
          routesToShow.push(userIntersections[i].routeID);
          routesToShow.push(userIntersections[i].routeIDInput);

        }
        catch(e){
            console.log(e);

        }
    }

    map.fitBounds(routesFeature.getBounds());
    return routesToShow;


}





function insertItem(data){

    $.ajax({
        url: "/item/create", // URL der Abfrage,
        data: data,
        type: "POST"
    })
        .done(function (response) {
            // parse + use data here
            console.log("insert data" +data);
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

    var resource = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=" + lat + "&lon=" + long + "&appid=" + OPENWEATHERMAP_TOKEN;
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

function componentDidMount(){
    var id= getParameterByName('id');
    if(id !== null){
        filter1(id)
    }else{
        filter1(null)
    }
}
async function filter1(id){


    var userID = document.forms["filter"]["User_ID"].value;
    var animals = document.forms["filter"]["Animal"].value;
    var wantUserRoutes = document.forms["filter"]["userRoutes"].checked;
    var wantAnimalRoutes = document.forms["filter"]["animalRoutes"].checked;
    var wantUserIntersection = document.forms["filter"]["userIntersections"].checked;
    var wantAnimalIntersections = document.forms["filter"]["animalIntersections"].checked;
    var userRoutes;
    var animalRoutes;
    var userIntersections;
    if(id !== null){
        userID=id;
        wantAnimalIntersections=false;
        wantAnimalRoutes=false;

    }



    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    addMap();

    if(wantUserIntersection) {
        var query = {};

        if (userID != "") {
            if (userID.indexOf(";") === -1) {
                query = "{\"$or\" : [{\"UserId\": \"" + userID + "\"} , { \"UserIDInput\" : \"" + user + "\"}]}"
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
        try {
            userIntersections = await getDatabaseFiles("userIntersections", query);

        } catch {

        }

        var routesToShow = addUserIntersections(userIntersections);

        if (routesToShow.length != 0) {
           query = "{\"$or\" : [ { \"routeID\" : \"" + routesToShow[0] + "\"}, ";
            for(var i=1;i < routesToShow.length-1; i++){
                query+= "{ \"routeID\" : \"" + routesToShow[i] + "\"},"
            }
            query+= "{ \"routeID\" : \"" + routesToShow[routesToShow.length-1] + "\"}]}"



            try {
                routesToShow = await getDatabaseFiles("userRoutes", query);

            } catch(e) {
                console.log(e)

            }

            addUserRoutes(routesToShow);

        }

    }


    if(wantUserRoutes){
        var query= {};

        if(userID!="")
        {
            if(userID.indexOf(";")=== -1) {
                query = "{\"User_ID\": \"" + userID + "\"}"
            }
            else{
                var user= userID.substring(0,userID.indexOf(";"));
                userID = userID.substring(userID.indexOf(";")+1, userID.length);
                query = "{ \"$or\" : [ {\"User_ID\": \"" + user + "\"} , ";
                while(userID.indexOf(";")!= -1){
                    user= userID.substring(1,userID.indexOf(";"));
                    userID = userID.substring(userID.indexOf(";")+1, userID.length);
                    query += " {\"User_ID\": \"" + user + "\"} , "
                }
                user= userID.substring(1,userID.length);
                query += " {\"User_ID\": \"" + user + "\"}]}";
            }
        }
        try {
            userRoutes = await getDatabaseFiles("userRoutes", query);

        }
        catch{

        }
        if (userRoutes.length === 0){
            alert("The API didn't found User Routes to show. Please makes sure there are User Routes in the Database or the UserID really exists. " +
                "Maybe you enteret the UserID the wrong way:" +
                "To Show all routes just leave the field empty" +
                "Tho Show routes of just on User enter only the UserID" +
                "Tho Show routes of more Users seperate the UserIDs by \";\" eg. \"1; 2\" ")
        }
        else{
            addUserRoutes(userRoutes);
        }
    }
    if(wantAnimalRoutes){

        var query={};
        if(animals!="")
        {
            if(animals.indexOf(";")=== -1) {
                query = "{\"animal\": \"" + animals + "\"}"
            }
            else{
                var animal = animals.substring(0,animals.indexOf(";"));
                animals = animals.substring(animals.indexOf(";")+1, animals.length);
                query = "{ \"$or\" : [ {\"animal\": \"" + animal  + "\"} , ";
                while(animals.indexOf(";")!= -1){
                    animal = animals.substring(1,animals.indexOf(";"));
                    animals = animals.substring(animals.indexOf(";")+1, animals.length);
                    query += " {\"User_ID\": \"" + animal  + "\"} , "
                }
                animal = animals.substring(1, animals.length);
                query += " {\"animal\": \"" + animal  + "\"}]}";
            }
        }
        try {
            animalRoutes = await getDatabaseFiles("animalRoutes", query);
            console.log(animalRoutes);
        }
        catch(e){
            console.log(e);
        }
        if (animalRoutes.length === 0){
            alert("No animal routes found");
        }
        else{
            addAnimalroutes(animalRoutes);
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

      return  $.ajax({
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

