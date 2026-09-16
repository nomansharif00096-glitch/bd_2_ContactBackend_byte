📬 Contact Form Backend — Burner Email Relay

A privacy-first contact form backend built with NestJS. Every submission is masked behind a randomly generated "relay" identity before it's forwarded — Craigslist-style — so the recipient never sees the real sender's email address. Every submission is also persisted to disk as proof of delivery.

✨ Features
Single REST endpoint — POST /contact/form accepts name, email, and message.
Burner email relay — the sender's real email is masked behind a random hash (relay-3f9a1c2b8e@burner.local) before the message is forwarded, so it's never exposed to the recipient.
Server-side validation — required fields, email format, and length limits enforced via class-validator.
Real email delivery — messages are forwarded via SMTP (Nodemailer), to any provider (Gmail, SendGrid, Mailtrap, Ethereal, etc).
Durable storage — every submission is appended to a .jsonl file as proof of receipt, independent of email delivery.
Clear API responses — distinct status codes for validation errors (400), delivery failures (503), and storage failures (500).
Sample frontend included — a plain HTML/JS form ready to test against, with CORS enabled out of the box.
🔒 How the privacy relay works
On every submission, the backend generates a random hash with crypto.randomBytes(10).toString('hex') and builds a relay identity, e.g. relay-3f9a1c2b8e@burner.local.
The outgoing email's From and Reply-To headers use only that relay identity — never the sender's real address.
The real email is used only to validate the submission. It is not logged, emailed, or stored — the stored record and the forwarded email both only ever contain the relay identity.

Note: this makes the relay one-way by design. Replying to the relay address won't reach the real sender, since nothing listens on burner.local. See Extending to two-way replies if your use case needs that.

🧱 Tech stack
Layer	Choice
Framework	NestJS
Validation	class-validator / class-transformer
Email delivery	Nodemailer over SMTP
Storage	Append-only .jsonl file (src/data/submissions.jsonl)
Language	TypeScript
📁 Project structure
contact-backend/
├── src/
│   ├── contact/
│   │   ├── contact.controller.ts     # POST /contact/form
│   │   ├── contact.service.ts        # relay logic + persistence
│   │   ├── email.service.ts          # SMTP transport (Nodemailer)
│   │   ├── contact.module.ts
│   │   └── dto/
│   │       └── createContactDto.dto.ts
│   ├── data/
│   │   └── submissions.jsonl         # append-only submission log
│   ├── app.module.ts
│   └── main.ts
├── sample-form/
│   └── index.html                    # working test client
├── .env.example
└── README.md
🚀 Getting started
bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your SMTP credentials
cp .env.example .env

# 3. Run in watch mode
npm run start:dev

Environment variables
Variable	Description
PORT	API port (default 3000)
SMTP_HOST	SMTP server hostname, e.g. smtp.gmail.com
SMTP_PORT	465 (SSL) or 587 (STARTTLS)
SMTP_USER	SMTP account username
SMTP_PASS	SMTP account password / app password
MAIL_FROM	The verified mailbox the relay sends from — must match SMTP_USER for providers like Gmail
CONTACT_RECEIVER	The inbox that actually receives contact-form messages (you)


📡 API reference
POST /contact/form

Request body

json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hi, I'd like to get in touch."
}
Field	Rules
name	required, ≤ 100 characters
email	required, valid email format
message	required, 2–5000 characters

Success — 201 Created

json
{
  "success": true,
  "message": "Submission received, forwarded, and stored successfully.",
  "submission": {
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "relayAddress": "relay-3f9a1c2b8e@burner.local",
    "storedAt": "2026-09-10T12:00:00.000Z"
  }
}

Validation failure — 400 Bad Request Missing or invalid name, email, or message.

Delivery failure — 503 Service Unavailable SMTP server unreachable or misconfigured.

Storage failure — 500 Internal Server Error Email was sent, but the submission couldn't be written to disk.

