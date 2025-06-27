const express = require("express");
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
// TODO: implement role-based admin middleware

const router = express.Router();

// All routes protected; ideally only admin access
router.use(authMiddleware);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
