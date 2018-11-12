const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Game = require('../models/game');
var Developer = require('../models/developer');
var Genre = require('../models/genre');
var Engine = require('../models/engine');
var Platform = require('../models/platform');

var async = require('async');

exports.index = function(req, res) {   
    
    async.parallel({
        game_count: function(callback) {
            Game.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        platform_count: function(callback) {
            Platform.countDocuments({}, callback);
        },
       /* platform_available_count: function(callback) {
            Platform.countDocuments({status:'Available'}, callback);
        },*/
        developer_count: function(callback) {
            Developer.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        },
        engine_count: function(callback) {
            Engine.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all Games.
exports.game_list = function(req, res, next) {

  Game.find({}, 'title developer')
    .populate('developer')
    .exec(function (err, list_games) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('game_list', { title: 'Game List', game_list: list_games });
    });
    
};

// Display detail page for a specific game.
exports.game_detail = function(req, res, next) {

    async.parallel({
        game: function(callback) {

            Game.findById(req.params.id)
              .populate('developer')
			  .populate('platform')
              .populate('genre')
              .populate('engine')
              .exec(callback);
        },
        platform: function(callback) {

          Platform.find({ 'game': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.game==null) { // No results.
            var err = new Error('Game not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('game_detail', { title: 'Title', game: results.game, platforms: results.platform } );
    });

};

// Display game create form on GET.
exports.game_create_get = function(req, res, next) { 
      
    // Get all developers, platforms, genres and engines which we can use for adding to our game.
    async.parallel({
        developers: function(callback) {
            Developer.find(callback);
        },
		platforms: function(callback) {
            Platform.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        engines: function(callback) {
            Engine.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('game_form', { title: 'Create Game', developers: results.developers, platforms: results.platforms, genres: results.genres, engines: results.engines });
    });
    
};

// Handle game create on POST.
exports.game_create_post = [

    

	// Convert the platform to an array.
    (req, res, next) => {
        if(!(req.body.platform instanceof Array)){
            if(typeof req.body.platform==='undefined')
            req.body.platform=[];
            else
            req.body.platform=new Array(req.body.platform);
        }
        next();
    },
	
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
	
	// Convert the engine to an array.
    (req, res, next) => {
        if(!(req.body.engine instanceof Array)){
            if(typeof req.body.engine==='undefined')
            req.body.engine=[];
            else
            req.body.engine=new Array(req.body.engine);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('developer', 'Developer must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('platform', 'Platform must not be empty').isLength({ min: 1 }).trim(),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),
  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Game object with escaped and trimmed data.
        var game = new Game(
          { title: req.body.title,
            developer: req.body.developer,
            summary: req.body.summary,
            platform: req.body.platform,
            genre: req.body.genre,
			engine: req.body.engine,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all developers, platforms, genres and engines for form.
            async.parallel({
                developers: function(callback) {
                    Developer.find(callback);
                },
				platforms: function(callback) {
                    Platform.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
			    engines: function(callback) {
                    Engine.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
				
				// Mark our selected platforms as checked.
                for (let i = 0; i < results.platforms.length; i++) {
                    if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                        results.platforms[i].checked='true';
                    }
                }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (game.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
				
                // Mark our selected engines as checked.
                for (let i = 0; i < results.engines.length; i++) {
                    if (game.engine.indexOf(results.engines[i]._id) > -1) {
                        results.engines[i].checked='true';
                    }
                }
                res.render('game_form', { title: 'Create Game',developers:results.developers, platforms:results.platforms, genres:results.genres, engines:results.engines, game: game, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save game.
            game.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new game record.
                   res.redirect(game.url);
                });
        }
    }
];

// Display game delete form on GET.
exports.game_delete_get = function(req, res, next) {

    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id).populate('developer').populate('platform').populate('genre').populate('engine').exec(callback);
        },
        game_platforms: function(callback) {
            Platform.find({ 'game': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.game==null) { // No results.
            res.redirect('/catalog/games');
        }
        // Successful, so render.
        res.render('game_delete', { title: 'Delete Game', game: results.game, platforms: results.game_platforms } );
    });

};

// Handle game delete on POST.
exports.game_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id).populate('developer').populate('platform').populate('genre').populate('engine').exec(callback);
        },
        game_platforms: function(callback) {
            Platform.find({ 'game': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.game_platforms.length > 0) {
            // Game has platforms. Render in same way as for GET route.
            res.render('game_delete', { title: 'Delete Game', game: results.game, platforms: results.game_platforms } );
            return;
        }
        else {
            // Game has no Platform objects. Delete object and redirect to the list of games.
            Game.findByIdAndRemove(req.body.id, function deleteGame(err) {
                if (err) { return next(err); }
                // Success - got to games list.
                res.redirect('/catalog/games');
            });

        }
    });

};

// Display game update form on GET.
exports.game_update_get = function(req, res, next) {

    // Get game, developers, platforms, genres and engines for form.
    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id).populate('developer').populate('genre').exec(callback);
        },
        developers: function(callback) {
            Developer.find(callback);
        },
		platforms: function(callback) {
            Platform.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        engines: function(callback) {
            Engine.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.game==null) { // No results.
                var err = new Error('Game not found');
                err.status = 404;
                return next(err);
            }
            // Success.
			// Mark our selected platforms as checked.
            for (var all_g_iter = 0; all_g_iter < results.platforms.length; all_g_iter++) {
                for (var game_g_iter = 0; game_g_iter < results.game.platform.length; game_g_iter++) {
                    if (results.platforms[all_g_iter]._id.toString()==results.game.platform[game_g_iter]._id.toString()) {
                        results.platforms[all_g_iter].checked='true';
                    }
                }
            }
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var game_g_iter = 0; game_g_iter < results.game.genre.length; game_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.game.genre[game_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            // Mark our selected engines as checked.
            for (var all_g_iter = 0; all_g_iter < results.engines.length; all_g_iter++) {
                for (var game_g_iter = 0; game_g_iter < results.game.engine.length; game_g_iter++) {
                    if (results.engines[all_g_iter]._id.toString()==results.game.engine[game_g_iter]._id.toString()) {
                        results.engines[all_g_iter].checked='true';
                    }
                }
            }
            res.render('game_form', { title: 'Update Game', developers:results.developers, platforms:results.platforms, genres:results.genres, engines:results.engines, game: results.game });
        });

};

// Handle game update on POST.
exports.game_update_post = [

    // Convert the platform to an array
    (req, res, next) => {
        if(!(req.body.platform instanceof Array)){
            if(typeof req.body.platform==='undefined')
            req.body.platform=[];
            else
            req.body.platform=new Array(req.body.platform);
        }
        next();
    },

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Convert the engine to an array
    (req, res, next) => {
        if(!(req.body.engine instanceof Array)){
            if(typeof req.body.engine==='undefined')
            req.body.engine=[];
            else
            req.body.engine=new Array(req.body.engine);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('developer', 'Developer must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('platform', 'Platform must not be empty').isLength({ min: 1 }).trim(),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('developer').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('platform').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),
    sanitizeBody('engine.*').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Game object with escaped/trimmed data and old id.
        var game = new Game(
          { title: req.body.title,
            developer: req.body.developer,
            summary: req.body.summary,
            platform: req.body.platform,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            engine: (typeof req.body.engine==='undefined') ? [] : req.body.engine,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all developers, platforms, genres and engines for form.
            async.parallel({
                developers: function(callback) {
                    Developer.find(callback);
                },
				platforms: function(callback) {
                    Platform.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
                engines: function(callback) {
                    Engine.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
				
				// Mark our selected platforms as checked.
                for (let i = 0; i < results.platforms.length; i++) {
                    if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                        results.platforms[i].checked='true';
                    }
                }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (game.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                // Mark our selected engines as checked.
                for (let i = 0; i < results.engines.length; i++) {
                    if (game.engine.indexOf(results.engines[i]._id) > -1) {
                        results.engines[i].checked='true';
                    }
                }
                res.render('game_form', { title: 'Update Game',developers:results.developers, platforms:results.platforms, genres:results.genres, engines:results.engines, game: game, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Game.findByIdAndUpdate(req.params.id, game, {}, function (err,thegame) {
                if (err) { return next(err); }
                   // Successful - redirect to game detail page.
                   res.redirect(thegame.url);
                });
        }
    }
];