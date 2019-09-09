// jshint esversion: 8
// jshint node: true
"use strict";

const https = require('https');
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let expect = chai.expect;
let token = require('../private/token.js').token;
const assert = require('assert');

const testroute = {
    User_ID: 'jan',
    name: 'testroute',
    Type: 'justatest',
    geometry: '[[7.59624,51.96882],[7.5963,51.96881],[7.59637,51.9688],[7.59653,51.96877],[7.59655,51.96876],[7.59655,51.96876]]',
    collection: "userRoutes"
}

chai.use(chaiHttp);
describe("Insert and delete Routes", function () {

    before(function (done) {
        setTimeout(function () {
                done();
            }, 5000
        );

    });

    it("Should add Route to DB", (done) => {
        let request = chai.request(server)
            .post("/item/create")
            .send(testroute)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                // testroute is in the db now, so it isnt new anymore
                assert(!testroute.isNew);
                done();
            });
    });

    it("Should find added route in DB", (done) => {
        let request = chai.request(server)
            .post("/item")
            .send(testroute)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                //res.body[0].should.have.property('name');
                expect(res.body[0]).to.have.property('name');
                expect(res.body[0].name).to.equal('testroute');
                done();
            });
    });

    it("Should delete added route from DB.", (done) => {
        var lBefore;
        chai.request(server)
            .post("/item")
            .send({collection:'userRoutes'})
            .then(troute => {
                lBefore = troute.body.length;
                var lAfter;
                chai.request(server)
                    .post("/item/delete")
                    .send(testroute)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        chai.request(server)
                            .post("/item")
                            .send({collection:'userRoutes'})
                            .then(troute => {
                                lAfter = troute.body.length;
                                expect(lBefore).to.equal(lAfter+1);
                                done();
                            })
                    });

            });
    });
});

/**
 * Mit netter Unterstützung der Gruppe DeLucse
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
                    try {
                        // if the response is not json, than the URL was wrong (catch-block)
                        var movebankData = JSON.parse(body);
                        expect(typeof movebankData).to.equal('object');
                        done();
                    } catch (err) {
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

    describe('openweathermap API test', function () {
        it('should connect with openweathermap api', (done) => {
            var endpointOpenweather = "https://api.openweathermap.org/data/2.5/weather?lat=7.59624&lon=51.96882&units=metric&appid=" + token.OPENWEATHERMAP_TOKEN;
            var request = https.get(endpointOpenweather, (httpResponse) => {
                // concatenate updates from datastream
                var body = "";
                httpResponse.on("data", (chunk) => {
                    body += chunk;
                });
                httpResponse.on("end", () => {
                    try {
                        // if the response is not json, than the URL was wrong (catch-block)
                        var openweathermap = JSON.parse(body);
                        expect(typeof openweathermap).to.equal('object');
                        expect(openweathermap.cod).to.equal(200);
                        done();
                    } catch (err) {
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