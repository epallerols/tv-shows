TV Shows Database
=========================

Single page app that allows the user to search for a TV show and display its synopsis. All data is extracted from [The Movie Database API](https://www.themoviedb.org).

The initial commit contains the code created in 6 hours on December 2013 as part of an assignment for an interview. Nowadays, I use this repository as a playground.

# Installation

1) Create a TMDB account and generate a new API Key. More information can be
found in [here](http://docs.themoviedb.apiary.io/)

2) Open `js/tvshows.js` and modify the `api_key` variable.

````js
var api_key = 'YOUR_API_KEY';
````

3) Execute the following commands in a terminal to build the application:
```
$ npm install
$ bower install
$ grunt
```
4) Open `build/index.html` with your preferred browser.