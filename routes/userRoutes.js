const { Router } = require('express');
const router = Router();
const { getAllUsers, createNewUser, updateUser, deleteUser } = require('../controllers/userController');

router.route('/')
.get(getAllUsers)
.post(createNewUser)
.patch(updateUser)
.delete(deleteUser);

module.exports = router;