var express = require('express');
var router = express.Router();

// Require controller modules.
var game_controller = require('../controllers/gameController');
var developer_controller = require('../controllers/developerController');
var genre_controller = require('../controllers/genreController');
var engine_controller = require('../controllers/engineController');
var platform_controller = require('../controllers/platformController');

/// GAME ROUTES ///

// GET catalog home page.
router.get('/', game_controller.index);

// GET request for creating a Game. NOTE This must come before routes that display Game (uses id).
router.get('/game/create', game_controller.game_create_get);

// POST request for creating Game.
router.post('/game/create', game_controller.game_create_post);

// GET request to delete Game.
router.get('/game/:id/delete', game_controller.game_delete_get);

// POST request to delete Game.
router.post('/game/:id/delete', game_controller.game_delete_post);

// GET request to update Game.
router.get('/game/:id/update', game_controller.game_update_get);

// POST request to update Game.
router.post('/game/:id/update', game_controller.game_update_post);

// GET request for one Game.
router.get('/game/:id', game_controller.game_detail);

// GET request for list of all Game items.
router.get('/games', game_controller.game_list);

/// DEVELOPER ROUTES ///

// GET request for creating Developer. NOTE This must come before route for id (i.e. display developer).
router.get('/developer/create', developer_controller.developer_create_get);

// POST request for creating Developer.
router.post('/developer/create', developer_controller.developer_create_post);

// GET request to delete Developer.
router.get('/developer/:id/delete', developer_controller.developer_delete_get);

// POST request to delete Developer.
router.post('/developer/:id/delete', developer_controller.developer_delete_post);

// GET request to update Developer.
router.get('/developer/:id/update', developer_controller.developer_update_get);

// POST request to update Developer.
router.post('/developer/:id/update', developer_controller.developer_update_post);

// GET request for one Developer.
router.get('/developer/:id', developer_controller.developer_detail);

// GET request for list of all Developers.
router.get('/developers', developer_controller.developer_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

//POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);

/// ENGINE ROUTES ///

// GET request for creating a Engine. NOTE This must come before route that displays Engine (uses id).
router.get('/engine/create', engine_controller.engine_create_get);

//POST request for creating Engine.
router.post('/engine/create', engine_controller.engine_create_post);

// GET request to delete Engine.
router.get('/engine/:id/delete', engine_controller.engine_delete_get);

// POST request to delete Engine.
router.post('/engine/:id/delete', engine_controller.engine_delete_post);

// GET request to update Engine.
router.get('/engine/:id/update', engine_controller.engine_update_get);

// POST request to update Engine.
router.post('/engine/:id/update', engine_controller.engine_update_post);

// GET request for one Engine.
router.get('/engine/:id', engine_controller.engine_detail);

// GET request for list of all Engine.
router.get('/engines', engine_controller.engine_list);

/// PLATFORM ROUTES ///

// GET request for creating a Platform. NOTE This must come before route that displays Platform (uses id).
router.get('/platform/create', platform_controller.platform_create_get);

// POST request for creating Platform. 
router.post('/platform/create', platform_controller.platform_create_post);

// GET request to delete Platform.
router.get('/platform/:id/delete', platform_controller.platform_delete_get);

// POST request to delete Platform.
router.post('/platform/:id/delete', platform_controller.platform_delete_post);

// GET request to update Platform.
router.get('/platform/:id/update', platform_controller.platform_update_get);

// POST request to update Platform.
router.post('/platform/:id/update', platform_controller.platform_update_post);

// GET request for one Platform.
router.get('/platform/:id', platform_controller.platform_detail);

// GET request for list of all Platform.
router.get('/platforms', platform_controller.platform_list);



module.exports = router;