import { prisma } from "../db/prisma"

interface IdentifyInput {
 email?: string
 phoneNumber?: string
}

export const identifyContact = async ({ email, phoneNumber }: IdentifyInput) => {


 const matchingContacts = await prisma.contact.findMany({
  where: {
   OR: [{ email: email || undefined },
    { phoneNumber: phoneNumber || undefined }
   ] },
  orderBy: {createdAt: "asc"}
 })

 if (matchingContacts.length === 0) {

  const newContact = await prisma.contact.create({
   data: {email,phoneNumber,linkPrecedence: "primary"}
  })

  return {
   primaryContactId: newContact.id,
   emails: email ? [email] : [],
   phoneNumbers: phoneNumber ? [phoneNumber] : [],
   secondaryContactIds: []
  }
 }

 const primaryContacts = matchingContacts.filter(c => c.linkPrecedence === "primary")

 const primaryContact =
  primaryContacts.length > 0 ? primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]: matchingContacts[0]

 let linkedContacts = await prisma.contact.findMany({
  where: {
   OR: [{ id: primaryContact.id },
    { linkedId: primaryContact.id }
   ]},
  orderBy: {createdAt: "asc"}
 })

 const otherPrimaries = primaryContacts.filter(c => c.id !== primaryContact.id)

 for (const p of otherPrimaries) {

  await prisma.contact.update({
   where: { id: p.id },
   data: {linkedId: primaryContact.id,
    linkPrecedence: "secondary"
   }
  })

  await prisma.contact.updateMany({
   where: { linkedId: p.id },
   data: { linkedId: primaryContact.id }
  })
 }


 linkedContacts = await prisma.contact.findMany({
  where: {
   OR: [{ id: primaryContact.id },
    { linkedId: primaryContact.id }
   ]
  }, orderBy: {createdAt: "asc"}
 })


 const emailExists = email? linkedContacts.some(c => c.email === email) : true

 const phoneExists = phoneNumber? linkedContacts.some(c => c.phoneNumber === phoneNumber) : true

 if (!emailExists || !phoneExists) {

  const newSecondary = await prisma.contact.create({
   data: {
    email,
    phoneNumber,
    linkedId: primaryContact.id,
    linkPrecedence: "secondary"
   }
  })

  linkedContacts.push(newSecondary)
 }

 const emails = [
  ...new Set(linkedContacts.map(c => c.email).filter(Boolean))] as string[]

 const phoneNumbers = [
  ...new Set(linkedContacts.map(c => c.phoneNumber).filter(Boolean))] as string[]

 const secondaryContactIds = linkedContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.id)

 return {
  primaryContactId: primaryContact.id,
  emails,
  phoneNumbers,
  secondaryContactIds
 }
}