"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyController = void 0;
const identityService_1 = require("../services/identityService");
const identifyController = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        if (!email && !phoneNumber) {
            return res.status(400).json({
                error: "Either email or phoneNumber must be provided"
            });
        }
        const result = await (0, identityService_1.identifyContact)({
            email,
            phoneNumber
        });
        return res.status(200).json({
            contact: {
                primaryContatctId: result.primaryContactId,
                emails: result.emails,
                phoneNumbers: result.phoneNumbers,
                secondaryContactIds: result.secondaryContactIds
            }
        });
    }
    catch (error) {
        console.error("Identify error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};
exports.identifyController = identifyController;
