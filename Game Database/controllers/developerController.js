const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var Game = require('../models/game');
var Developer = require('../models/developer');

// Display list of all Developers.
exports.developer_list = function(req, res, next) {

  Developer.find()
    .sort([['first_name', 'ascending']])
    .exec(function (err, list_developers) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('developer_list', { title: 'Developer List', developer_list: list_developers });
    });

};

// Display detail page for a specific Developer.
exports.developer_detail = function(req, res, next) {

    async.parallel({
        developer: function(callback) {
            Developer.findById(req.params.id)
              .exec(callback)
        },
        developers_games: function(callback) {
          Game.find({ 'developer': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.developer==null) { // No results.
            var err = new Error('Developer not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('developer_detail', { title: 'Developer Detail', developer: results.developer, developer_games: results.developers_games } );
    });

};

// Display Developer create form on GET.
exports.developer_create_get = function(req, res, next) {       
    res.render('developer_form', { title: 'Create Developer'});
};

// Handle Developer create on POST.
exports.developer_create_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('Company name must be specified.'),
	body('location_name').isLength({ min: 1 }).trim().withMessage('Country name must be specified.'),
        //.isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
	sanitizeBody('location_name').trim().escape(),
    //sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('developer_form', { title: 'Create Developer', developer: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Developer object with escaped and trimmed data.
            var developer = new Developer(
                {
                    first_name: req.body.first_name,
					location_name: req.body.location_name,
                    //family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            developer.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new developer record.
                res.redirect(developer.url);
            });
        }
    }
];

// Display Developer delete form on GET.
exports.developer_delete_get = function(req, res, next) {

    async.parallel({
        developer: function(callback) {
            Developer.findById(req.params.id).exec(callback)
        },
        developers_games: function(callback) {
          Game.find({ 'developer': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.developer==null) { // No results.
            res.redirect('/catalog/developers');
        }
        // Successful, so render.
        res.render('developer_delete', { title: 'Delete Developer', developer: results.developer, developer_games: results.developers_games } );
    });

};

// Handle Developer delete on POST.
exports.developer_delete_post = function(req, res, next) {

    async.parallel({
        developer: function(callback) {
          Developer.findById(req.body.developerid).exec(callback)
        },
        developers_games: function(callback) {
          Game.find({ 'developer': req.body.developerid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.developers_games.length > 0) {
            // Developer has games. Render in same way as for GET route.
            res.render('developer_delete', { title: 'Delete Developer', developer: results.developer, developer_games: results.developers_games } );
            return;
        }
        else {
            // Developer has no games. Delete object and redirect to the list of developers.
            Developer.findByIdAndRemove(req.body.developerid, function deleteDeveloper(err) {
                if (err) { return next(err); }
                // Success - go to developer list
                res.redirect('/catalog/developers')
            })
        }
    });
};

// Display Developer update form on GET.
exports.developer_update_get = function (req, res, next) {

    Developer.findById(req.params.id, function (err, developer) {
        if (err) { return next(err); }
        if (developer == null) { // No results.
            var err = new Error('Developer not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('developer_form', { title: 'Update Developer', developer: developer });

    });
};

// Handle Developer update on POST.
exports.developer_update_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),
     //   .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('location_name').isLength({ min: 1 }).trim().withMessage('Country name must be specified.'),
       // .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('location_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
   sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Developer object with escaped and trimmed data (and the old id!)
        var developer = new Developer(
            {
                first_name: req.body.first_name,
                location_name: req.body.location_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('developer_form', { title: 'Update Developer', developer: developer, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Developer.findByIdAndUpdate(req.params.id, developer, {}, function (err, thedeveloper) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(thedeveloper.url);
            });
        }
    }
];