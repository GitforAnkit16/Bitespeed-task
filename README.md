# Bitespeed Identity Reconciliation API

A backend service that identifies and links multiple contact records belonging to the same customer using email and phone number relationships.

This project solves the **Bitespeed Backend Task: Identity Reconciliation**, where customers may place orders using different emails or phone numbers but still belong to the same identity.

---

## Live API

**Base URL**

```
https://bitespeed-task-2mvr.onrender.com
```

**Endpoint**

```
POST /identify
```

Example:

```
POST https://bitespeed-task-2mvr.onrender.com/identify
```

---

# Problem Statement

Customers may place orders using different emails or phone numbers.
The system must identify whether the incoming request belongs to an existing customer and consolidate all related contacts.

Contacts are stored with relationships such that:

* The **oldest contact becomes the primary contact**
* Other contacts become **secondary contacts**
* Contacts are linked through **email or phone number matches**

The service returns a **consolidated view of the customer identity**.

---

# Tech Stack

* **Node.js**
* **Express.js**
* **TypeScript**
* **PostgreSQL**
* **Prisma ORM**
* **Render (Deployment)**

---

# API Specification

## Endpoint

```
POST /identify
```

### Request Body

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

At least one field must be provided.

---

# Example Request

```json
{
  "email": "doc@fluxkart.com",
  "phoneNumber": "123456"
}
```

---

# Example Response

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": [
      "doc@fluxkart.com",
      "mcfly@fluxkart.com"
    ],
    "phoneNumbers": [
      "123456"
    ],
    "secondaryContactIds": [2]
  }
}
```

---

# Identity Resolution Logic

The API follows these rules:

### 1. New Contact

If no existing contact matches the email or phone number:

* A **new primary contact** is created.

---

### 2. Existing Contact Found

If a match exists:

* The system retrieves all linked contacts.
* Returns the **primary contact identity**.

---

### 3. New Information

If a request contains **new email or phone information**:

* A **secondary contact** is created and linked to the primary.

---

### 4. Primary Merge

If two primary contacts become linked through a request:

* The **oldest primary remains primary**
* The newer primary becomes **secondary**

---

# Database Schema

Contact table fields:

```
id
phoneNumber
email
linkedId
linkPrecedence
createdAt
updatedAt
deletedAt
```

* `linkPrecedence` determines whether a contact is **primary** or **secondary**
* `linkedId` points to the **primary contact**

---

# Running Locally

### Install dependencies

```
npm install
```

### Run database migrations

```
npx prisma migrate dev
```

### Start development server

```
npm run dev
```

Server runs on:

```
http://localhost:3000
```

---

# Production Deployment

The API is deployed using **Render**.

Deployment steps:

1. Push repository to GitHub
2. Create PostgreSQL database on Render
3. Create Web Service connected to GitHub repo
4. Add environment variable:

```
DATABASE_URL=<render_postgres_url>
```

Build command:

```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

Start command:

```
npm start
```

---

# Testing

The API can be tested using **Postman**.

Example test:

```
POST /identify
```

```
{
 "email": "doc@fluxkart.com",
 "phoneNumber": "123456"
}
```

---

# Author

Ankit Panda

GitHub:
https://github.com/GitforAnkit16

Snapshots showcasing the expected output:
---<img width="997" height="605" alt="Screenshot 2026-03-08 at 6 20 50 PM" src="https://github.com/user-attachments/assets/ec8d222b-54c1-479f-806b-6f25c312699a" />
<img width="974" height="605" alt="Screenshot 2026-03-08 at 6 20 35 PM" src="https://github.com/user-attachments/assets/b1fd0acd-9a60-49ca-8ca1-2b03ab558194" />
<img width="1005" height="618" alt="Screenshot 2026-03-08 at 6 20 04 PM" src="https://github.com/user-attachments/assets/758450d7-4a8f-4f88-8c97-9f32163fc9b4" />
<img width="989" height="608" alt="Screenshot 2026-03-08 at 6 19 26 PM" src="https://github.com/user-attachments/assets/f8f1980a-f5b7-4989-8e88-097b1a7b9076" />
<img width="1002" height="584" alt="Screenshot 2026-03-08 at 6 18 55 PM" src="https://github.com/user-attachments/assets/8fae6d3f-fa60-451a-8db0-463ec5392c8f" />

