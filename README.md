
# Bihar Hostel System - Improved

This improved build adds security, UI, and developer features:
- Helmet, CORS, cookie-parser
- Express-validator for input validation
- Theme toggle (dark/light)
- DataTables for admin lists (search & pagination)
- CSV export for students
- Nodemailer wrapper (utils/emailService.js)
- Dark/Light theme using CSS variables

Run:
1. npm install
2. set .env (MONGO_URI, SESSION_SECRET, optionally SMTP_*)
3. npm run seed
4. npm run dev
