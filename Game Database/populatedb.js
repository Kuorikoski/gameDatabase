#! /usr/bin/env node

console.log('This script populates some test games, developers, genres and platforms to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Game = require('./models/game')
var Developer = require('./models/developer')
var Genre = require('./models/genre')
var Platform = require('./models/platform')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var developers = []
var genres = []
var games = []
var platforms = []

function developerCreate(first_name, family_name, d_birth, d_death, cb) {
  developerdetail = {first_name:first_name , family_name: family_name }
  if (d_birth != false) developerdetail.date_of_birth = d_birth
  if (d_death != false) developerdetail.date_of_death = d_death
  
  var developer = new Developer(developerdetail);
       
  developer.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Developer: ' + developer);
    developers.push(developer)
    cb(null, developer)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function gameCreate(title, summary, isbn, developer, genre, cb) {
  gamedetail = { 
    title: title,
    summary: summary,
    developer: developer,
    isbn: isbn
  }
  if (genre != false) gamedetail.genre = genre
    
  var game = new Game(gamedetail);    
  game.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Game: ' + game);
    games.push(game)
    cb(null, game)
  }  );
}


function platformCreate(name, cb) {
  var platform = new Platform({ name: name });
       
  platform.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Platform: ' + platform);
    platforms.push(platform)
    cb(null, platform);
  }   );
}


function createGenrePlatformDevelopers(cb) {
    async.parallel([
        function(callback) {
          developerCreate('Patrick', 'Rothfuss', '1973-06-06', false, callback);
        },
        function(callback) {
          developerCreate('Ben', 'Bova', '1932-11-8', false, callback);
        },
        function(callback) {
          developerCreate('Isaac', 'Asimov', '1920-01-02', '1992-04-06', callback);
        },
        function(callback) {
          developerCreate('Bob', 'Billings', false, false, callback);
        },
        function(callback) {
          developerCreate('Jim', 'Jones', '1971-12-16', false, callback);
        },
        function(callback) {
          genreCreate("Fantasy", callback);
        },
        function(callback) {
          genreCreate("Science Fiction", callback);
        },
        function(callback) {
          genreCreate("French Poetry", callback);
        },
		function(callback) {
          platformCreate("PC/Windows", callback);
        },
		function(callback) {
          platformCreate("PlayStation", callback);
        },
        ],
        // optional callback
        cb);
}


function createGames(cb) {
    async.parallel([
        function(callback) {
          gameCreate('The Name of the Wind (The Kingkiller Chronicle, #1)', 'I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.', '9781473211896', developers[0], [genres[0],], callback);
        },
        function(callback) {
          gameCreate("The Wise Man's Fear (The Kingkiller Chronicle, #2)", 'Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.', '9788401352836', developers[0], [genres[0],], callback);
        },
        function(callback) {
          gameCreate("The Slow Regard of Silent Things (Kingkiller Chronicle)", 'Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.', '9780756411336', developers[0], [genres[0],], callback);
        },
        function(callback) {
          gameCreate("Apes and Angels", "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...", '9780765379528', developers[1], [genres[1],], callback);
        },
        function(callback) {
          gameCreate("Death Wave","In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...", '9780765379504', developers[1], [genres[1],], callback);
        },
        function(callback) {
          gameCreate('Test Game 1', 'Summary of test game 1', 'ISBN111111', developers[4], [genres[0],genres[1]], callback);
        },
        function(callback) {
          gameCreate('Test Game 2', 'Summary of test game 2', 'ISBN222222', developers[4], false, callback)
        }
        ],
        // optional callback
        cb);
}







async.series([
    createGenrePlatformDevelopers,
    createGames
    
],
// Optional callback
function (err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Platforms: '+platforms);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});

