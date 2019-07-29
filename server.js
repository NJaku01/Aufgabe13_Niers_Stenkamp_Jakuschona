// jshint esversion: 6

const express = require('express');
const app = express();
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
            console.dir(error);
            setTimeout(connectMongoDb, 3000); // retry until db-server is up
        }

    })();
}

connectMongoDb();



// const dirname="C:/Users/nick1/OneDrive - uni-muenster.de/UNI/Geosoftware/Aufgabe_07_Jakuschona";

app.use(express.static(__dirname + '/Public'));
app.use(express.json());

// middleware for handling urlencoded request data
// https://expressjs.com/en/4x/api.html#express.urlencoded
app.use(express.urlencoded({extended: false}));


app.get("/item", (req, res) => {
    // find all
    app.locals.db.collection('item').find({}).toArray((error, result) => {
        if (error) {
            console.dir(error);
        }
        console.log(result);
        res.json(result);
    });
});

app.post("/item/create", (req, res) => {
    // insert item
    console.log("insert item ");
    app.locals.db.collection('item').insertOne(req.body, (error, result) => {
        if (error) {
            console.dir(error);
        }
        res.json(result);
    });
});

app.post("/item/update", (req, res) => {
    // update item
    console.log("update item " + req.body._id);
    let id = req.body._id;
    delete req.body._id;
    console.log(req.body); // => { name:req.body.name, description:req.body.description }
    app.locals.db.collection('item').updateOne({_id: new mongodb.ObjectID(id)}, {$set: req.body}, (error, result) => {
        if (error) {
            console.dir(error);
        }
        res.json(result);
    });
});

app.post("/item/delete", (req, res) => {
    // delete item
    console.log("delete item " + JSON.stringify(req.body));
    let objectId = "ObjectId(" + req.body._id + ")";
    app.locals.db.collection('item').deleteOne({_id: new mongodb.ObjectID(req.body._id)}, (error, result) => {
        if (error) {
            console.dir(error);
        }
        res.json(result);
        res.redirect("/");
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