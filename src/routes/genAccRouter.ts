import { SendPassword, SendOTP, verificationAcccount } from '../controller/email.controller';
import { Router } from 'express';

const router = Router();
router.route('/:email').post(SendPassword);
router.route('/otp/:email').post(SendOTP);
const router2 = Router();
router2.route('/').post(verificationAcccount);
export { router, router2 };