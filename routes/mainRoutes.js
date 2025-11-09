
import express from 'express';
import { getHome, getAbout, getContact, postContact } from '../controllers/mainController.js';
const router = express.Router();
router.get('/', getHome);
router.get('/about', getAbout);
router.get('/contact', getContact);
router.post('/contact', postContact);
export default router;
