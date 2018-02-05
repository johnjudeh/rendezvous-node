# Rendez Vous

## Description

Rendez Vous is an application that helps connect people in big cities. By using
the locations of you and your friends, it can find a fair place to meet close to
the middle. The application also allows users to register and update their
preferences of types of places to meet up. Search results will then match the
logged in user's preferences where possible.

The application is just a hobby for now and should be fun to use. It might even
help you see those 'other-side-of-the-city' friends that you never get the
chance to :wink:

Demo: https://rendez-vous-me.herokuapp.com

## Developer Guide

Interested in getting this project on your local machine and playing around
with it? Check out the instructions below!

### Prerequisites

To run the application locally, make sure that you have [node](https://nodejs.org/en/)
and npm installed before proceeding. The application also uses [mongoDB](https://www.mongodb.com/)
which either needs to be set up locally or hosted.

### Installing

If you are planning to pull the project from the Github website, click the
**Clone or download** button above. Alternatively, if you would like to pull it
from the command line, make sure you have [Git](https://git-scm.com/) installed
and type in the following command in your terminal.

```
cd <chosen folder>
git clone https://github.com/johnjudeh/Rendez-Vous.git
```

Once the files have been downloaded, navigate into the applications root
directory and download the dependencies needed.

```
cd Rendez-Vous
npm install
```

### Setting Environment Variables

In order to ensure the highest level of security for the deployed version of the
application, some environment variables have been set to hide API keys and other
sensitive information.

In order to run the application, these environment variables must be set on your
local system. The following variables are needed:

1. **SESSION_SECRET** - must be set to any secret string used for express session
1. **RV_DB_URL** - a mongoDB url must be used here. The recommended value for
this is `mongodb://localhost/rendez_vous`
1. **MAPS_KEY** - a free Google Maps Javascript API key must be generated on the
[Google API Console](https://console.developers.google.com/apis/). Make sure to
read the terms and conditions on how the key is allowed to be used if you plan
to develop further

### Running

To run the application, make sure you are in the application's root directory
and type `gulp` into the terminal. This will build the application into the build
folder and start the server on localhost:8080.

## Built With

* [Express](https://expressjs.com/) - NodeJS framework used
* [mongoDB](https://www.mongodb.com/) - Database employed
* [SemanticUI](https://semantic-ui.com/) - Front-end library used

## Author

* [John Judeh](https://www.linkedin.com/in/hannajudeh/)

## Acknowledgements

A big thank you to all of the friends who have talked through this idea with me
and helped me flesh out how it should work. This development is for you guys!
