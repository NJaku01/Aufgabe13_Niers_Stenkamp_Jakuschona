# Aufgabe13_Niers_Stenkamp_Jakuschona

##### Start des Projekts:
Mit node.js:
- repository downloaden
- in shell zum Projektordner wechseln
  - npm install 
  - npm start
- öffne localhost:3000 im Browser deiner Wahl

##### Mit Docker:
...


##### Benötigte API-Keys:
- Bei openweathermap (https://openweathermap.org/) und movebank (https://www.movebank.org/) registrieren
- im Projektordner einen neuen Ordner "private" erstellen
  - darin eine Datei token.js anlegen, die folgende Form besitzt:
  -      if (typeof exports == "undefined"){
            var exports = window;
         };
         exports.token = {
            MOVEBANK_login: "your-movebank-login",
            MOVEBANK_password: "your-movebank-password",
            OPENWEATHERMAP_TOKEN: 'your-openweathermap-token'
         };
         
##### Link zum öffentlichen github-Repository: 
- https://github.com/NJaku01/Aufgabe13_Niers_Stenkamp_Jakuschona

##### Datenstruktur in mongoDB in itemdb: 
- animalIntersections {routeIDInput, userIDInput, inputJSON, mongodbJSONAnimalRoutes, "animalIntersections"}
- animalRoutes {collection, Study_ID, User_ID, Name, Type, date, time, routeID, GeoJSON}
- userIntersections {routeIDInput, userIDInput, inputJSON, mongodbJSONUserRoutes, "userIntersections"}
- userRoutes {...}

##### weitere Hinweise: 
- Zu Beginn haben wir unser Repository fälschlicherweise "Aufgabe13_..." genannt, wegen Termin 13, an dem die Aufgabe 
vorgestellt wurde. 
Haben es dann einfach dabei belassen.
- Anstelle von GitHub Issues haben wir mit Trello gearbeitet, da wir die dort zur Verfügung stehenden Features für sehr
 sinnvoll, in einer Gruppenarbeit wie dieser, halten. Denn die Nutzung von Trello konnten wir gut in Kombination mit 
 Scrum nutzen, einem Konzept mit dem wir unsere Vorgehensweise zeitlich geregelt haben. Unter folgendem Link ist unser 
 Trello-Board zu finden: 
 https://trello.com/b/pld0FgoX/aufgabe13niersstenkampjakuschona
 
