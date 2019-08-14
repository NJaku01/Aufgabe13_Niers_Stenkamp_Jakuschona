# Aufgabe13_Niers_Stenkamp_Jakuschona

Start des Projekts:

Mit node.js:
- repository downloaden
- in shell zum Projektordner wechseln
  - npm init ..
  - npm install 
  - npm start
- öffne localhost:3000 im Browser deiner Wahl

Mit Docker:
...


Benötigte API-Keys:
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
         
Link zum öffentlichen github-Repository: 
- https://github.com/NJaku01/Aufgabe13_Niers_Stenkamp_Jakuschona

Zu Beginn haben wir unser Repository fälschlicherweise "Aufgabe13_..." genannt, wegen Termin 13, an dem die Aufgabe vorgestellt wurde. 
Haben es dann einfach dabei belassen.
