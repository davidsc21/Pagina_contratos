const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {iniciarAuthGoogle, callbackGoogle, estadoGoogle} = require("../Controllers/googleAuthController");

router.get("/google", authMiddleware, iniciarAuthGoogle);
router.get("/google/callback", callbackGoogle);
router.get("/google/estado", authMiddleware, estadoGoogle);

module.exports = router;