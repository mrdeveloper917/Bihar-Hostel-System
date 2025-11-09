
import express from 'express';
import { body } from 'express-validator';
import { getLogin, getRegister, postRegister, postLogin, logout } from '../controllers/authController.js';
const router = express.Router();

router.get('/login', getLogin);
router.get('/register', getRegister);
router.post('/register',
  // body('email').isEmail().withMessage('Valid email required'),
  // body('password').isLength({ min:6 }).withMessage('Password min 6 chars'),
  postRegister);
router.post('/login', postLogin);
router.post('/logout', logout);
export default router;
