const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/claimController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.post('/',ctrl.createClaim);
router.get('/',ctrl.getMyClaims);
router.get('/:id',            ctrl.getClaimById);
router.patch('/:id/accept',   ctrl.acceptClaim);
router.patch('/:id/reject',   ctrl.rejectClaim);

module.exports = router;