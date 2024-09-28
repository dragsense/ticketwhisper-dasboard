const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/count', userController.getUsersCount);


// Get users
router.get('/', userController.getUsers);

// Add user
router.post('/', userController.addUser);

router.post('/notifications/setting/:preferredPlan', userController.updateNotificationsSetting);
router.get('/notifications/setting/:preferredPlan', userController.getNotificationsSetting);

// Update or delete users
router.put('/:userId', userController.updateUser);

router.delete('/:userId', userController.deleteUser);

module.exports = router;