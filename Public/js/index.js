"use strict";

/**
 * Schon in routes_editor definiert
const lat = 51.96;
const lon = 7.59;
const start_latlng = [lat, lon];


*/

var mongodbJSON;
var routes = [];
var routesFeature = L.featureGroup();


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
console.log(lines);
console.log(line1test);
console.log(line1test._id);
console.log(turf.lineIntersect(line1test, line2test));

// console.log(turf);
//console.log(intersect);
/**
 * function which takes one new inputRoute and compares this one with all other routes in allRoutes if they intersect.
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

console.log(calculateIntersect(line1test, lines));



function getFiles() {
    $.ajax({
        url: "/item", // URL der Abfrage,
        data: {collection: "userRoutes"},
        type: "POST"
    })
        .done(function (response) {
            // parse + use data here
            mongodbJSON = response;
            var routes = transformLinesIntoArray(mongodbJSON);
            addMap();
            addUserRoutes(routes);
        })
        .fail(function (xhr, status, errorThrown) {
            // handle errors
        })
        .always(function (response, xhr, status) {

            if (response.length == 0) {
                alert("no routes in database");
            }

        });

}


function addMap() {


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

function addUserRoutes(allRoutes){
    for (var i = 0; i < allRoutes.length; i++) {
        for (var j = 0; j < allRoutes[i].length; j++) {
            var help = allRoutes[i][j][0];
            allRoutes[i][j][0] = allRoutes[i][j][1];
            allRoutes[i][j][1] = help;
        }

        var route = L.polyline(allRoutes[i], {color: 'red'}).addTo(map);
        routes.push(route);
        routesFeature.addLayer(route);

        //add all Routes to the Map
        var popup = L.popup();
        popup.setContent('Route: ' + (i + 1));
        routes[i].bindPopup(popup);

        routes[i].on('mouseover', function (e) {
            var popup = e.target.getPopup();
            popup.setLatLng(e.latlng).openOn(map);
        });

        routes[i].on('mouseout', function (e) {
            e.target.closePopup();
        });
        //add  the PopUps to the Map for the Routes


        for (var j = 0; j < allRoutes[i].length; j++) {
            var help = allRoutes[i][j][0];
            allRoutes[i][j][0] = allRoutes[i][j][1];
            allRoutes[i][j][1] = help;
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

function addAnimalroutes(transMovebankResponse)
{
    var coordinates = []
    for (var i = 0; i < transMovebankResponse.length; i++) {

        coordinates.push(transMovebankResponse[i].features.geometry.coordinates)
    }
    console.log(coordinates);
    var polyline = L.polyline(coordinates).addTo(map);
    map.fitBounds(polyline.getBounds());
}

function transformLinesIntoArray(text) {
    "use strict";

    var linesArray = [];
    var geojsons = [];
    console.log(text);
    for (var j in text) {

        var geojson = text[j].geojson;
        geojsons.push(JSON.parse(geojson));
    }

    for (var i in geojsons) {
        linesArray.push(geojsons[i].features[0].geometry.coordinates);
    }


    return linesArray;

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

async function filter1(){

    var userID = document.forms["filter"]["User_ID"].value;
    var animal = document.forms["filter"]["Animal"].value;
    var wantUserRoutes = document.forms["filter"]["userRoutes"].checked;
    var wantAnimalRoutes = document.forms["filter"]["animalRoutes"].checked;
    var wantUserIntersection = document.forms["filter"]["userIntersections"].checked;
    var wantAnimalIntersections = document.forms["filter"]["animalIntersections"].checked;
    var userRoutes;
    var animalRoutes;

    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    addMap();

    if(wantUserRoutes){
        var query= {};
        if(userID!="")
        {
            query="{\"User_ID\": \"" + userID +"\"}"
        }
        try {
            userRoutes = await getDatabaseFiles("userRoutes", query);
            userRoutes = transformLinesIntoArray(userRoutes);
            addUserRoutes(userRoutes);
        }
        catch{

        }
    }
    console.log(wantAnimalRoutes);
    if(wantAnimalRoutes){
        var routes = []
        var query={};
        if(animal!="")
        {
            query="{\"animal\": \"" + animal +"\"}"
        }
        try {
            animalRoutes = await getDatabaseFiles("animalRoutes", query);
        }
        catch(e){
            console.log(e);
        }
        for (var i =0; i<animalRoutes.length; i++){
            routes.push(JSON.parse(animalRoutes[i].geoJson));
        }
        console.log(routes);
        addAnimalroutes(routes);


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
        var datastring = JSON.stringify(transMovebankResponse[i].geojson, '\\', 0);
        insertItem({collection: "animalRoutes", geoJson: datastring} );
        coordinates.push(transMovebankResponse[i].geojson.features.geometry.coordinates)
    }
    console.log(coordinates);
    var polyline = L.polyline(coordinates).addTo(map);
    map.fitBounds(polyline.getBounds());
});
*/

