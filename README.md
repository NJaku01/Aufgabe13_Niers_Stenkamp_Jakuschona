# Projektaufgabe_Geosoftware_I_SS_2019

##### HowTo start the project local:

###### always: 
- download the repository
- change with cd in the terminal to the project-directory

###### with node.js:
- start mongodb local 
- commands you have to input in the terminal: 
  - "npm install"
  - "npm start"
- open localhost:3000 in a browser you like 

###### with Docker:
- input in the terminal: "docker-compose up" 
- open localhost:3000 in a browser you like 

##### needed API-Keys:
- You have to register on openweathermap (https://openweathermap.org/) and movebank (https://www.movebank.org/) 
- Create in the project-directory a new directory called "private" 
  - in this directory you have to crate a file called "token.js", which got the form described below:
  -      if (typeof exports == "undefined"){
            var exports = window;
         };
         exports.token = {
            MOVEBANK_login: "your-movebank-login",
            MOVEBANK_password: "your-movebank-password",
            OPENWEATHERMAP_TOKEN: 'your-openweathermap-token'
         };
         
##### link to the public github-repository: 
- https://github.com/NJaku01/Projektaufgabe_Geosoftware_I_SS_2019

##### data-structure in mongoDB in itemdb: 
- animalIntersections {_id, "animalIntersections", geoJSON, id, routeID, UserId, UserIDInput, routeIDInput, studyID}
- animalRoutes {_id, "animalRoutes", Study_ID, User_ID, Name, Type, date, time, routeID, geoJson}
- userIntersections {_id, "userIntersections", geoJSON, id, routeID, UserId, UserIDInput, routeIDInput, studyID}
- userRoutes {_id, User_ID, Name, Type, date, time, geoJSON, "userRoutes", routeID}
- the attribute "_id" is automatically given by mongodb
- for each of the four datatypes there is a collection in mongodb where it gets stored, 
the certain collection e.g. "userRoutes" is named directly above)

##### further hints : 
- Instead of GitHub Issues we used Trello, because we are convinced that the features in Trello are really useful for 
a group-work like this. Because Trello is good useable in combination with Srum 
(a concept, to structure our workflow concerning time, what we used). With the link below you can find our Trello-Board
 https://trello.com/b/pld0FgoX/aufgabe13niersstenkampjakuschona
- Our API is running with all common browsers (Firefox, Google Chrome, Safari)
 
