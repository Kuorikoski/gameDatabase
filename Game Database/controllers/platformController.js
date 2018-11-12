const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Game = require('../models/game');
var async = require('async');
var Platform = require('../models/platform');

// Display list of all Platform.
exports.platform_list = function(req, res, next) {

  Platform.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_platforms) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('platform_list', { title: 'Platform List', list_platforms: list_platforms });
    });
	
};
	

// Display detail page for a specific Platform.
exports.platform_detail = function(req, res, next) {

    async.parallel({
        platform: function(callback) {
            Platform.findById(req.params.id)
              .exec(callback);
        },

        platform_games: function(callback) {
          Game.find({ 'platform': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.platform==null) { // No results.
            var err = new Error('Platform not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('platform_detail', { title: 'Platform Detail', platform: results.platform, platform_games: results.platform_games } );
    });

};

// Display Platform create form on GET.
exports.platform_create_get = function(req, res, next) {       
    res.render('platform_form', { title: 'Create Platform' });
};

// Handle Platform create on POST.
exports.platform_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Platform name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a platform object with escaped and trimmed data.
        var platform = new Platform(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('platform_form', { title: 'Create Platform', platform: platform, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Platform with same name already exists.
            Platform.findOne({ 'name': req.body.name })
                .exec( function(err, found_platform) {
                     if (err) { return next(err); }

                     if (found_platform) {
                         // Platform exists, redirect to its detail page.
                         res.redirect(found_platform.url);
                     }
                     else {

                         platform.save(function (err) {
                           if (err) { return next(err); }
                           // Platform saved. Redirect to platform detail page.
                           res.redirect(platform.url);
                         });

                     }

                 });
        }
    }
];

// Display Platform delete form on GET.
exports.platform_delete_get = function(req, res, next) {

    async.parallel({
        platform: function(callback) {
            Platform.findById(req.params.id).exec(callback);
        },
        platform_games: function(callback) {
            Game.find({ 'platform': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.platform==null) { // No results.
            res.redirect('/catalog/platforms');
        }
        // Successful, so render.
        res.render('platform_delete', { title: 'Delete Platform', platform: results.platform, platform_games: results.platform_games } );
    });

};

// Handle Platform delete on POST.
exports.platform_delete_post = function(req, res, next) {

    async.parallel({
        platform: function(callback) {
            Platform.findById(req.params.id).exec(callback);
        },
        platform_games: function(callback) {
            Game.find({ 'platform': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.platform_games.length > 0) {
            // Platform has games. Render in same way as for GET route.
            res.render('platform_delete', { title: 'Delete Platform', platform: results.platform, platform_games: results.platform_games } );
            return;
        }
        else {
            // Platform has no games. Delete object and redirect to the list of platforms.
            Platform.findByIdAndRemove(req.body.id, function deletePlatform(err) {
                if (err) { return next(err); }
                // Success - go to platforms list.
                res.redirect('/catalog/platforms');
            });

        }
    });

};

// Display Platform update form on GET.
exports.platform_update_get = function(req, res, next) {

    Platform.findById(req.params.id, function(err, platform) {
        if (err) { return next(err); }
        if (platform==null) { // No results.
            var err = new Error('Platform not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('platform_form', { title: 'Update Platform', platform: platform });
    });

};

// Handle Platform update on POST.
exports.platform_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Platform name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a platform object with escaped and trimmed data (and the old id!)
        var platform = new Platform(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('platform_form', { title: 'Update Platform', platform: platform, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Platform.findByIdAndUpdate(req.params.id, platform, {}, function (err,theplatform) {
                if (err) { return next(err); }
                   // Successful - redirect to platform detail page.
                   res.redirect(theplatform.url);
                });
        }
    }
];