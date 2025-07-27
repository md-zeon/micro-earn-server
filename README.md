# MicroEarn - Server Side

## Overview

The server side of MicroEarn powers a micro-tasking platform that enables users to create, complete, and manage small online tasks for earning money. Built with Node.js, Express.js, and MongoDB, it provides a robust backend for user authentication, task management, payment processing, and real-time notifications. The server integrates with Firebase for secure authentication, Stripe for payments, and MongoDB for data persistence, ensuring a scalable and secure environment for Workers, Buyers, and Admins.

## 🌐 Live Site

**Server URL:** [https://micro-earn-server.vercel.app/](https://micro-earn-server.vercel.app/)

## 🔐 Admin Credentials

* **Email:** [admin@microearn.com](mailto:admin@microearn.com)
* **Password:** Admin\@1234

## 📁 Server-Side GitHub Repository

**Repository:** \[Insert your server-side GitHub repository link here]

## 🚀 Features

* **🔒 Secure Authentication with Firebase:** Token-based authentication with role enforcement (Worker, Buyer, Admin) using Firebase Admin SDK.
* **🛡️ Role-Based Middleware:** Custom middleware (`verifyBuyer`, `verifyWorker`, `verifyAdmin`) to restrict route access securely.
* **📋 Task Management:** Buyers can create, update, and delete tasks. Coin deductions/refunds handled automatically.
* **📤 Submission Handling:** Workers submit task proof; submissions stored in MongoDB and linked to task progress.
* **💰 Stripe Payment Integration:** Buyers can purchase coins securely via Stripe.
* **💸 Withdrawal Processing:** Workers can request withdrawals (min 200 coins = \$10), approved by Admins.
* **📥 Notification System:** Real-time alerts for approvals, rejections, and withdrawals.
* **📊 Admin Statistics:** Aggregated stats like total users, payments, and coins.
* **🧑‍💼 User Management:** Admins can manage users and tasks with full CRUD support.
* **🔝 Top Workers Endpoint:** Fetches top 6 Workers by coins.
* **🔐 Environment Variable Security:** Uses `dotenv` to secure sensitive information.

## 🧰 Tech Stack

* **Node.js** – Backend runtime
* **Express.js** – Web framework
* **MongoDB** – NoSQL database
* **Firebase Admin SDK** – Authentication
* **Stripe API** – Payment processing
* **dotenv** – Environment configuration
* **CORS** – Cross-origin resource sharing

## 📌 Endpoints

| Endpoint                     | Method | Description                                | Role Access   |
| ---------------------------- | ------ | ------------------------------------------ | ------------- |
| /user                        | POST   | Creates or updates user with initial coins | All           |
| /user/role                   | GET    | Retrieves user role                        | Authenticated |
| /available-coins             | GET    | Fetches user’s coin balance                | Authenticated |
| /update-coins/\:email        | PATCH  | Updates user coins                         | Authenticated |
| /tasks                       | POST   | Creates a new task                         | Buyer         |
| /my-tasks                    | GET    | Retrieves Buyer’s tasks                    | Buyer         |
| /tasks/\:id                  | GET    | Fetches task by ID                         | Authenticated |
| /tasks/\:id                  | PATCH  | Updates task details                       | Buyer         |
| /tasks/\:id                  | DELETE | Deletes a task                             | Buyer         |
| /create-payment-intent       | POST   | Creates Stripe payment intent              | Authenticated |
| /payments                    | POST   | Saves payment details                      | Buyer         |
| /payments                    | GET    | Retrieves Buyer’s payments                 | Buyer         |
| /tasks-for-worker            | GET    | Lists available tasks                      | Worker        |
| /submissions                 | POST   | Submits a task                             | Worker        |
| /submissions                 | GET    | Retrieves Worker’s submissions             | Worker        |
| /buyer-submissions           | GET    | Buyer views task submissions               | Buyer         |
| /submissions/status-update   | PATCH  | Updates submission status                  | Buyer         |
| /update-workers/\:id         | PATCH  | Updates worker count                       | Authenticated |
| /withdrawals                 | POST   | Worker requests withdrawal                 | Worker        |
| /withdrawals                 | GET    | Retrieves Worker withdrawal history        | Worker        |
| /admin/stats                 | GET    | Admin dashboard stats                      | Admin         |
| /admin/withdraw-requests     | GET    | Lists withdrawals                          | Admin         |
| /admin/approve-withdraw/\:id | PATCH  | Approves withdrawal                        | Admin         |
| /users                       | GET    | Lists users                                | Admin         |
| /update-role/user/\:id       | PATCH  | Updates user role                          | Admin         |
| /user/\:id                   | DELETE | Deletes user                               | Admin         |
| /admin/tasks                 | GET    | Lists all tasks                            | Admin         |
| /admin/task/\:id             | DELETE | Deletes a task (refunds coins)             | Admin         |
| /top-workers                 | GET    | Lists top 6 Workers by coins               | Public        |
| /notifications               | GET    | User notifications                         | Authenticated |
| /update-profile              | PATCH  | Updates name/photo                         | Authenticated |

## 🛠️ Installation

```bash
git clone https://github.com/Programming-Hero-Web-Course4/b11a12-server-side-md-zeon
cd b11a12-server-side-md-zeon
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
FB_SERVICE_KEY=your_base64_encoded_firebase_service_account_key
```

Start the server:

```bash
npm start
```

## ☁️ Deployment

* Hosted on Vercel: [https://micro-earn-server.vercel.app/](https://micro-earn-server.vercel.app/)
* Ensure environment variables are configured properly in your hosting platform.

## 🗃️ Database Structure

* **Users Collection:** `email`, `name`, `role`, `microCoins`, `photoURL`, `createdAt`, `lastLoggedInAt`
* **Tasks Collection:** `title`, `details`, `image`, `required_workers`, `payable_amount`, `posted_by`, `status`
* **Submissions Collection:** `task_id`, `task_title`, `worker_email`, `submission_details`, `status`
* **Payments Collection:** `amount`, `buyer_email`, `payment_date`
* **Withdrawals Collection:** `worker_email`, `withdrawal_amount`, `status`, `withdraw_date`
* **Notifications Collection:** `message`, `toEmail`, `actionRoute`, `time`

## 📝 Notes

* The client-side is hosted at: [https://micro-earn-7be08.web.app/](https://micro-earn-7be08.web.app/)
* Sensitive data is securely handled with `.env` and verified.
* Proper error handling with status codes: `401`, `400`, `403`, `404`, `500`

## 📄 License

This project is for educational purposes only.

## 🤝 Contributing

Contributions are welcome! Fork the repo and submit PRs for improvements.

## 📬 Contact

**Developer:** Zeanur Rahaman Zeon

**Email:** [zeon.cse@gmail.com](mailto:zeon.cse@gmail.com)

**LinkedIn:** [https://www.linkedin.com/in/zeanur-rahaman-zeon](https://www.linkedin.com/in/zeanur-rahaman-zeon)