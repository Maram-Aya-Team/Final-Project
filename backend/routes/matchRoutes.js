const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/matchController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', ctrl.getMyMatches);
router.patch('/:id/accept', ctrl.acceptMatch);
router.patch('/:id/reject', ctrl.rejectMatch);
router.post('/run/:lostPostId', ctrl.runMatching);

module.exports = router;
