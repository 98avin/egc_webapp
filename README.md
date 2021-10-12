# Meeting Manager for Rutgers Engineering Governing Council
Simple web-app usable by organizations to facilitate and track attendance, and hold polls. Members can log-in with their school email and vote all from the mobile optimized website at egc-webapp.firebaseapp.com
```diff
@@ Requires Node v12 (LTS) @@
```
To run locally:
1. Create a new file called *config.json* in the src folder under the root directory. Populate it as follows:
```
{
  "apiKey": "",
  "authDomain": "",
  "databaseURL": "",
  "projectId": "",
  "storageBucket": "",
  "messagingSenderId": "",
  "appId": ""
}
```
 To obtain the config object you will need to set-up a firebase project and initialize an app under that project.
 See here for more info: https://support.google.com/firebase/answer/7015592?hl=en
 Follow the directions for *Obtain config object for your web-app*

2. Modify the *index.html* file in the public folder under the root directory to include your google API key in line 3:
```
  <script src="https://maps.googleapis.com/maps/api/js?&v=3.exp&libraries=geometry,drawing,places&key={YOUR API KEY HERE (remove brackets)}"></script>
```

3. Open the root directory in Terminal, and run *npm install*
4. Run *npm start*, and new browser window should open with the app running.

COMING SOON:
1. How to set-up the database from scratch (structure)
2. How to modify the app to run with different schools
3. How to deal with dependency issues (a little messy currently, need Node v12)
4. Hide scrollbars for Windows/Linux users

Other TO-DO:
1. Rework all React components for proper usage (big optimization potential)
2. Migrate from Firebase Real-time Database to Cloud Firestore (more reliability/speed), or move the whole thing to AWS
