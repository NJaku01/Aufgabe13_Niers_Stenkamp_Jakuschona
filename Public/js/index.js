"use strict";

const lat = 51.96;
const lon = 7.59;
const start_latlng = [lat, lon];

var map = L.map("mapdiv").setView(start_latlng, 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
    id: "osm"
}).addTo(map);

var mongodbJSON;
var routes = [];
var routesFeature = L.featureGroup();

var line1 = {
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
var line2 ={
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
console.log(turf);
var intersect = turf.lineOverlap(line1,line2);
console.log(intersect);


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
            addMap(routes);
            console.log(mongodbJSON);
            console.log(JSON.stringify(response, null, 4));
        })
        .fail(function (xhr, status, errorThrown) {
            // handle errors
        })
        .always(function (xhr, status) {

            if (response.length == 0) {
                alert("no routes in database");
            }

        });

}


function addMap(allRoutes) {


    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
        id: "osm"
    }).addTo(map); //ad a background Layer to the Map


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


var resource = "movebank";

$.get(resource, function(response, status, x){
    let formatted_response = JSON.stringify(response,null,4);
    $("#movebankJson").text(formatted_response);
    console.log(formatted_response);

});


