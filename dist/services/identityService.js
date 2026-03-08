"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const prisma_1 = require("../db/prisma");
const identifyContact = async ({ email, phoneNumber }) => {
    const matchingContacts = await prisma_1.prisma.contact.findMany({
        where: {
            OR: [{ email: email || undefined },
                { phoneNumber: phoneNumber || undefined }
            ]
        },
        orderBy: { createdAt: "asc" }
    });
    if (matchingContacts.length === 0) {
        const newContact = await prisma_1.prisma.contact.create({
            data: { email, phoneNumber, linkPrecedence: "primary" }
        });
        return {
            primaryContactId: newContact.id,
            emails: email ? [email] : [],
            phoneNumbers: phoneNumber ? [phoneNumber] : [],
            secondaryContactIds: []
        };
    }
    const primaryContacts = matchingContacts.filter(c => c.linkPrecedence === "primary");
    const primaryContact = primaryContacts.length > 0 ? primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0] : matchingContacts[0];
    let linkedContacts = await prisma_1.prisma.contact.findMany({
        where: {
            OR: [{ id: primaryContact.id },
                { linkedId: primaryContact.id }
            ]
        },
        orderBy: { createdAt: "asc" }
    });
    const otherPrimaries = primaryContacts.filter(c => c.id !== primaryContact.id);
    for (const p of otherPrimaries) {
        await prisma_1.prisma.contact.update({
            where: { id: p.id },
            data: { linkedId: primaryContact.id,
                linkPrecedence: "secondary"
            }
        });
        await prisma_1.prisma.contact.updateMany({
            where: { linkedId: p.id },
            data: { linkedId: primaryContact.id }
        });
    }
    linkedContacts = await prisma_1.prisma.contact.findMany({
        where: {
            OR: [{ id: primaryContact.id },
                { linkedId: primaryContact.id }
            ]
        }, orderBy: { createdAt: "asc" }
    });
    const emailExists = email ? linkedContacts.some(c => c.email === email) : true;
    const phoneExists = phoneNumber ? linkedContacts.some(c => c.phoneNumber === phoneNumber) : true;
    if (!emailExists || !phoneExists) {
        const newSecondary = await prisma_1.prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkedId: primaryContact.id,
                linkPrecedence: "secondary"
            }
        });
        linkedContacts.push(newSecondary);
    }
    const emails = [
        ...new Set(linkedContacts.map(c => c.email).filter(Boolean))
    ];
    const phoneNumbers = [
        ...new Set(linkedContacts.map(c => c.phoneNumber).filter(Boolean))
    ];
    const secondaryContactIds = linkedContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.id);
    return {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
    };
};
exports.identifyContact = identifyContact;
