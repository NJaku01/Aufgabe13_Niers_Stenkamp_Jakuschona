// jshint esversion: 6

const express = require('express');
const app = express();

var https = require("https");

var server = require('http').createServer(app);


const mongodb = require('mongodb');

function connectMongoDb() {
    // finish this block before the server starts,
    // there are some async tasks inside we need to wait for => declare async so we can use await
    (async () => {

        try {
            // Use connect method to the mongo-client with the mongod-service
            //                      and attach connection and db reference to the app

            // using a local service on the same machine
            //app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017", {useNewUrlParser: true});

            // using a named service (e.g. a docker container "mongodbservice")
            app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://mongo:27017", {useNewUrlParser: true});

            app.locals.db = await app.locals.dbConnection.db("itemdb");
            console.log("Using db: " + app.locals.db.databaseName);
        } catch (error) {
            try {
                app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017", {useNewUrlParser: true});
                app.locals.db = await app.locals.dbConnection.db("itemdb");
                console.log("Using db: " + app.locals.db.databaseName);
            } catch (error2) {
                console.dir(error2);

                console.dir(error);
                setTimeout(connectMongoDb, 3000); // retry until db-server is up
            }
        }

    })();
}

connectMongoDb();



// const dirname="C:/Users/nick1/OneDrive - uni-muenster.de/UNI/Geosoftware/Aufgabe_07_Jakuschona";

app.use(express.static(__dirname + '/Public'));
app.use(express.static(__dirname + '/private'));
app.use(express.json());

// middleware for handling urlencoded request data
// https://expressjs.com/en/4x/api.html#express.urlencoded
app.use(express.urlencoded({extended: false}));

app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use("/leaflet-control-geocoder", express.static(__dirname + "/node_modules/leaflet-control-geocoder/dist"));
app.use("/leaflet-routing-machine", express.static(__dirname + "/node_modules/leaflet-routing-machine/dist"));
app.use("/pub-pkg-bootstrap-min", express.static(__dirname + "/node_modules/pub-pkg-bootstrap-min"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/turf", express.static(__dirname + "/node_modules/@turf/turf"));
app.use("/token.js", express.static(__dirname + "/private/token.js"));
app.use("/routes_editor.js", express.static(__dirname + "/Public/routes_editor.js"));


app.post("/item", (req, res) => {
    // find all
    console.log(req.body.query);
    var queryJSON = req.body.query;
    if(queryJSON!=null) {
        queryJSON = JSON.parse(queryJSON);
    }
    app.locals.db.collection(req.body.collection).find(queryJSON).toArray((error, result) => {
        if (error) {
            console.dir(error);
        }
        console.log(result);
        res.json(result);
    });
});

app.post("/item/create", (req, res) => {
    // insert item
    console.log(req.body.collection);
    console.log(req.body);
    app.locals.db.collection(req.body.collection).insertOne(req.body, (error, result) => {
        if (error) {
            console.dir(error);
        }
        res.redirect('/routes_editor.html');
    });
});

app.post("/item/update", (req, res) => {
    // update item
    console.log("update item " + req.body._id);
    let id = req.body._id;
    delete req.body._id;
    console.log(req.body);// => { name:req.body.name, description:req.body.description }
    app.locals.db.collection('userRoute').updateOne({_id: new mongodb.ObjectID(id)}, {$set: req.body}, (error, result) => {
        if (error) {
            console.dir(error);
        }
        res.redirect('/routes_editor.html');
    });
});

app.post("/item/delete", (req, res) => {
    // delete item
    console.log("delete item " + JSON.stringify(req.body));
    let objectId = "ObjectId(" + req.body._id + ")";
    app.locals.db.collection('userRoute').deleteOne({_id: new mongodb.ObjectID(req.body._id)}, (error, result) => {
        if (error) {
            console.dir(error);
        }
        res.redirect('/routes_editor.html');
    });
});

app.post("/item/deleteAll", (req, res) =>{


    app.locals.db.collection(req.body.collection).deleteMany({}, (error, result) => {
        if (error) {
            console.dir(error);
        }
        res.redirect('/routes_editor.html');
    });
});


var login = require(__dirname + "/private/token.js").token.MOVEBANK_login;
var password = require(__dirname + "/private/token.js").token.MOVEBANK_password;

var movebankEndpoint = "https://www.movebank.org/movebank/service/public/json?study_id=";

var testEndpoint = "https://www.movebank.org/movebank/service/public/json?&study_id=2911040&max_events_per_individual=5&sensor_type=gps"

const options = {
    headers: {
        'Authorization':'Basic ' + Buffer.from(login+':'+password).toString('base64')
    }
};

var transformMovebankJson = function(movebankResponse) {

    var jsonArray = [];

    var coordinates = [];
    var latlon = [];

    console.log(movebankResponse);

    for (i = 0; i < movebankResponse.individuals.length; i++){

        var json = {"User_ID":"","Name":"","Type":"","date":"","time":"",
            "geojson":{"type":"FeatureCollection","features":{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[]}}}};

        json.User_ID = movebankResponse.individuals[i].individual_taxon_canonical_name;
        json.Name = movebankResponse.individuals[i].individual_local_identifier;
        json.Type = "animal";

        coordinates = [];

        for (j = 0; j < movebankResponse.individuals[i].locations.length; j++) {
            latlon = [];
            latlon[0] = movebankResponse.individuals[i].locations[j].location_lat;
            latlon[1] = movebankResponse.individuals[i].locations[j].location_long;
            coordinates.push(latlon);
        }

        json.geojson.features.geometry.coordinates = coordinates;

        jsonArray.push(json);
    }
    return jsonArray;
}

app.get("/movebank", (req, res) => {

    console.log("Study_ID: " + req.query.Study_ID);
    console.log(req.body);
    console.log(req.params.id);

    var study = req.query.Study_ID;
    var endpoint = movebankEndpoint + study + "&individual_local_identifiers[]=1163-1163&individual_local_identifiers[]=2131-2131&max_events_per_individual=10&sensor_type=gps";

    https.get(endpoint, options, (httpResponse) => {
        // concatenate updates from datastream

        console.log(endpoint);
        var body = "";
        httpResponse.on("data", (chunk) => {
            //console.log("chunk: " + chunk);
            body += chunk;
        });

        httpResponse.on("end", () => {
            console.log("Body:" + body);
            var weather = JSON.parse(body);

            var movebankJson = transformMovebankJson(weather);

            console.log(movebankJson);

            console.log("Req.query: " + req.query.collection);

            app.locals.db.collection(req.query.collection).insertMany(movebankJson, (error, result) => {
                if (error) {
                    console.dir(error);
                }
                res.redirect('/routes_editor.html');
            });

        });

        httpResponse.on("error", (error) => {
            throw error;
        });


    });

});



process.on("SIGTERM", () => {
    server.close();
    app.locals.dbConnection.close();
    console.log("SIGTERM");
    process.exit(0);
});

process.on("SIGINT", () => {
    server.close();
    app.locals.dbConnection.close();
    console.log("SIGINT");
    process.exit(0);
});

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});

