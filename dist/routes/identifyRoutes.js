"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identifyController_1 = require("../controller/identifyController");
const router = (0, express_1.Router)();
router.post("/", identifyController_1.identifyController);
exports.default = router;
