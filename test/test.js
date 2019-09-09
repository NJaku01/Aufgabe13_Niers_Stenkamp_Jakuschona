// jshint esversion: 8
// jshint node: true
"use strict";

const https = require('https');
let chai = require("chai");
let chaiHttp = require("chai-http");
let server= require("../server");
let expect = chai.expect;
let should = chai.should();
let token = require('../private/token.js').token;

const testroute = {
    User_ID:'jan',
    name: 'testroute',
    Type: 'justatest',
    geometry: '[[7.59624,51.96882],[7.5963,51.96881],[7.59637,51.9688],[7.59653,51.96877],[7.59655,51.96876],[7.59655,51.96876]]',
    collection: "userRoutes"
}

chai.use(chaiHttp);
describe("Routes", function(){

    before(function (done) {
        setTimeout(function() {
            done();},5000
        );

    });
    /**
}
    describe ("DELETE ALL", function(){
        it("should remove all first", done=>{
            console.log ("Deleting all data in db first.")
            chai.request(server)
                .post("/item/deleteAll")
                .send({})
                .end((err,res)=>{
                    //console.log (res)
                    // console.log("err",err);
                    res.should.have.status(200);
                    console.log("Response Body:", res.body);
                    // console.log (result);
                    done()
                })
        })

    })
     */


    //describe ("CRUD OPERATIONS", function(){

        // Problem, dass die Verbindung zu mongo zu lange dauert und der die deshalb noch nicht hinzufügen kann
        it("Should add Route to DB", (done) => {
            let request = chai.request(server)
                    .post("/item/create")
                    //.query({collection:"userRoutes"})
                    .send(testroute)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        done();
                    });
        });


        it("Should delete Route from DB", (done) => {
            chai.request(server)
                .post("/item/delete")
                //.query({collection:"userRoutes"})
                .send(testroute)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    console.log("Response Body:", res.body);
                    //res.should.have.status(200);
                    done();
                });
        });


/**
        it ("Should Fecth all the Books", (done)=>{
            chai.request(server)
                .get("/books/")
                .end((err, result)=>{
                    result.should.have.status(200);
                    console.log ("Got",result.body.data.length, " docs")
                    //console.log ("Result Body:", result.body);

                    done()
                })
        })

        it ("Should Fetch Particular Book only", (done)=>{
            chai.request(server)
                .get("/books/"+books[1].isbn)
                .end((err, result)=>{
                    result.should.have.status(200)
                    console.log("Fetched Particlar Book using /GET/BOOKS/:BOOKID ::::", result.body)
                    done()
                })
        })

        it ("Should Update Partcular Book Only", (done)=>{
            var updatedBook = {
                "isbn": "121213",
                "title": "Node JS",
                "author": "John",
                "year": "2017" /// year is changed
            }

            chai.request(server)
                .put("/books/"+books[1].isbn)
                .send(updatedBook)
                .end((err, result)=>{
                    result.should.have.status(200)
                    console.log("Updated Particlar Book using /GET/BOOKS/:BOOKID ::::", result.body)
                    done()
                })
        })

        it ("should check data updated in DB", (done)=>{
            chai.request(server)
                .get("/books/"+books[1].isbn)
                .end((err, result)=>{
                    result.should.have.status(200)
                    result.body.data.year.should.eq("2017")
                    console.log("Fetched Particlar Book using /GET/BOOKS/:BOOKID ::::", result.body)
                    done()
                })
        })

        it("Should Delete Particular Book", (done)=>{
            chai.request(server)
                .delete("/books/"+books[1].isbn)
                .end((err, result)=>{
                    result.should.have.status(200)
                    console.log("Deleted Particlar Book using /GET/BOOKS/:BOOKID ::::", result.body)
                    done()
                })
        })

        it("Should confirm delete with number of Docs from DB", (done)=>{
            chai.request(server)
                .get("/books/")
                .end((err, result)=>{
                    result.should.have.status(200);
                    result.body.data.length.should.eq(1);
                    console.log ("Got",result.body.data.length, " docs")
                    //console.log ("Result Body:", result.body);
                    done()
                })
                */
       // });

    });


/**
var assert = require("assert");

var code = require("../Public/routes_editor");
//var server = require("../server.js");



//import { switchCoordinates } from "Public/routes_editor";

describe('switchCoords', function () {
    it("check tests", function () {
        assert.ok( 1 == 1);
    });
    it("test if coordinates are switched correct", function () {
        var coord = [{lat:123, lon:345},{lat: 345, lon: 789}];
        var switchedCoord = code.switchC(coord);

        console.log(coord);
        console.log(switchedCoord);
        assert.ok(switchedCoord[0].lat === 456);
        assert.ok(switchedCoord[0].lon === 123);
        assert.ok(switchedCoord[1].lat === 789);
        assert.ok(switchedCoord[1].lon === 345);
    })
});
*/

describe('Tests for external APIs', function () {
    describe('movebank test', function () {
        it('should connect with movebank api', function (done) {
            var endpoint = "https://www.movebank.org/movebank/service/json-auth?&study_id=446579&individual_local_identifiers[]=1790 - Radolfzell JC72014&sensor_type=gps";
            var username = token.MOVEBANK_login;
            var password = token.MOVEBANK_password;
            // set authorization-header to get secured data
            const options = {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
                }
            };
            // movebank query
            var request = https.get(endpoint, options, (httpResponse) => {
                // concatenate updates from datastream
                var body = "";
                httpResponse.on("data", (chunk) => {
                    body += chunk;
                });
                httpResponse.on("end", () => {
                    try{
                        // if the response is not json, than the URL was wrong (catch-block)
                        var movebankData = JSON.parse(body);
                        expect(typeof movebankData).to.equal('object');
                        done();
                    }
                    catch(err){
                        //creates a wrong equation to fail the test
                        expect(true).to.equal(false);
                        done();
                    }
                });
            });
            request.on("error", (error) => {
                //creates a wrong equation to fail the test
                expect(true).to.equal(false);
                done();
            });
        });
    });

    describe('openweathermap API test', function() {
        it('should connect with openweathermap api', (done) => {
            var endpointOpenweather = "https://api.openweathermap.org/data/2.5/weather?lat=7.59624&lon=51.96882&units=metric&appid="+ token.OPENWEATHERMAP_TOKEN;
            var request = https.get(endpointOpenweather, (httpResponse) => {
                // concatenate updates from datastream
                var body = "";
                httpResponse.on("data", (chunk) => {
                    body += chunk;
                });
                httpResponse.on("end", () => {
                    try{
                        // if the response is not json, than the URL was wrong (catch-block)
                        var openweathermap = JSON.parse(body);
                        expect(typeof openweathermap).to.equal('object');
                        expect(openweathermap.cod).to.equal(200);
                        done();
                    }
                    catch(err){
                        //creates a wrong equation to fail the test
                        expect(true).to.equal(false);
                        done();
                    }
                });
            });
            request.on("error", (error) => {
                //creates a wrong equation to fail the test
                expect(true).to.equal(false);
                done();
            });
        });
});
});