const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Game = require('../models/game');
var async = require('async');
var Engine = require('../models/engine');

// Display list of all Engine.
exports.engine_list = function(req, res, next) {

  Engine.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_engines) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('engine_list', { title: 'Engine List', list_engines: list_engines });
    });
	
};
	

// Display detail page for a specific Engine.
exports.engine_detail = function(req, res, next) {

    async.parallel({
        engine: function(callback) {
            Engine.findById(req.params.id)
              .exec(callback);
        },

        engine_games: function(callback) {
          Game.find({ 'engine': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.engine==null) { // No results.
            var err = new Error('Engine not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('engine_detail', { title: 'Engine Detail', engine: results.engine, engine_games: results.engine_games } );
    });

};

// Display Engine create form on GET.
exports.engine_create_get = function(req, res, next) {       
    res.render('engine_form', { title: 'Create Engine' });
};

// Handle Engine create on POST.
exports.engine_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Engine name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a engine object with escaped and trimmed data.
        var engine = new Engine(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('engine_form', { title: 'Create Engine', engine: engine, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Engine with same name already exists.
            Engine.findOne({ 'name': req.body.name })
                .exec( function(err, found_engine) {
                     if (err) { return next(err); }

                     if (found_engine) {
                         // Engine exists, redirect to its detail page.
                         res.redirect(found_engine.url);
                     }
                     else {

                         engine.save(function (err) {
                           if (err) { return next(err); }
                           // Engine saved. Redirect to engine detail page.
                           res.redirect(engine.url);
                         });

                     }

                 });
        }
    }
];

// Display Engine delete form on GET.
exports.engine_delete_get = function(req, res, next) {

    async.parallel({
        engine: function(callback) {
            Engine.findById(req.params.id).exec(callback);
        },
        engine_games: function(callback) {
            Game.find({ 'engine': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.engine==null) { // No results.
            res.redirect('/catalog/engines');
        }
        // Successful, so render.
        res.render('engine_delete', { title: 'Delete Engine', engine: results.engine, engine_games: results.engine_games } );
    });

};

// Handle Engine delete on POST.
exports.engine_delete_post = function(req, res, next) {

    async.parallel({
        engine: function(callback) {
            Engine.findById(req.params.id).exec(callback);
        },
        engine_games: function(callback) {
            Game.find({ 'engine': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.engine_games.length > 0) {
            // Engine has games. Render in same way as for GET route.
            res.render('engine_delete', { title: 'Delete Engine', engine: results.engine, engine_games: results.engine_games } );
            return;
        }
        else {
            // Engine has no games. Delete object and redirect to the list of engines.
            Engine.findByIdAndRemove(req.body.id, function deleteEngine(err) {
                if (err) { return next(err); }
                // Success - go to engines list.
                res.redirect('/catalog/engines');
            });

        }
    });

};

// Display Engine update form on GET.
exports.engine_update_get = function(req, res, next) {

    Engine.findById(req.params.id, function(err, engine) {
        if (err) { return next(err); }
        if (engine==null) { // No results.
            var err = new Error('Engine not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('engine_form', { title: 'Update Engine', engine: engine });
    });

};

// Handle Engine update on POST.
exports.engine_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Engine name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a engine object with escaped and trimmed data (and the old id!)
        var engine = new Engine(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('engine_form', { title: 'Update Engine', engine: engine, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Engine.findByIdAndUpdate(req.params.id, engine, {}, function (err,theengine) {
                if (err) { return next(err); }
                   // Successful - redirect to engine detail page.
                   res.redirect(theengine.url);
                });
        }
    }
];