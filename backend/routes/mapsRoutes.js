const express     = require('express');
const router      = express.Router();
const mapsCtrl    = require('../controllers/mapsController');
const { optionalAuth } = require('../middlewares/authMiddleware');
// GET /api/maps/items
router.get('/items',  optionalAuth, mapsCtrl.getItems);
// GET /api/maps/cities
router.get('/cities', mapsCtrl.getCities);

module.exports = router;