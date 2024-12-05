import { validateEmail, validatePassword } from '../utils/validate';
import  UserModel  from '../models/user.model';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
const bcrypt = require('bcrypt');
// import { envs } from '@be/configs';
// const EMAIL = envs.EMAIL_ADDRESS;
// const PASSWORD = envs.APP_PASSWORD;
const EMAIL = "2121";
const PASSWORD = "2121";
export const GeneratePassword = (length: number): string => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numericChars = '0123456789';
    const specialChars = '!@#$%^&*()-_+=';

    let password = '';

    // Ensure at least one of each character type
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += numericChars.charAt(Math.floor(Math.random() * numericChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    // Generate the rest of the password
    for (let i = 4; i < length; i++) {
        const randomType = Math.floor(Math.random() * 4); // Choose a random character type
        switch (randomType) {
            case 0:
                password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
                break;
            case 1:
                password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
                break;
            case 2:
                password += numericChars.charAt(Math.floor(Math.random() * numericChars.length));
                break;
            case 3:
                password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
                break;
        }
    }

    // Shuffle the password characters
    password = password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    return password;
};

export const GenerateOTP = (length: number): string => {
    const chars = '0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars.charAt(randomIndex);
    }
    return password;
};

export const SendPassword = async (req: Request, res: Response) => {
    try {
        const email = req.params.email;
        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Missing email!'
            });
        }
        if (!validateEmail(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Invalid email!'
            });
        }
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' });
        }
        const genPassword = GeneratePassword(10);
        await user.updateOne({
            password: await bcrypt.hash(genPassword, 10)
        });
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Replace 'Gmail' with your email service provider
            auth: {
                user: EMAIL, // Your email address
                pass: PASSWORD // Your email password or app-specific password
            }
        });
        // Define email options
        const mailOptions: nodemailer.SendMailOptions = {
            from: EMAIL, // Sender email address
            to: email, // Recipient email address
            subject: genPassword + 'is your new password', // Email subject
            // Email body
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Content</title>
            </head>
            <body>
            <p style="font-size: 18px; color: black;">Hi!</p>
            <p style="font-size: 18px; color: black;">Thank you for using our service.</p>
            <p style="font-size: 18px; color: black;">Your password is: <span style="font-size: 24px; color: blue;"><b>${genPassword}</b></span></p>
            <p style="font-size: 18px; color: black;">Please do not reply to this email.</p>
            </body>
            </html>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        return res.status(StatusCodes.OK).json({ message: 'Message sent' });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export const SendOTP = async (req: Request, res: Response) => {
    try {
        const email = req.params.email;

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Missing email!'
            });
        }
        if (!validateEmail(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Invalid email!'
            });
        }
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' });
        }
        const genOTP = GenerateOTP(6);
        const currentTime = new Date();
        if (user.otpExpired !== undefined) {
            if (currentTime.getTime() - user.otpExpired.getTime() < 30 * 60000) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Not over 30 minutes'
                });
            }
        }
        await user.updateOne({ otp: genOTP, otpExpired: currentTime.getTime() + 30 * 60000 });
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Replace 'Gmail' with your email service provider
            auth: {
                user: EMAIL, // Your email address
                pass: PASSWORD // Your email password or app-specific password
            }
        });
        const mailOptions: nodemailer.SendMailOptions = {
            from: EMAIL, // Sender email address
            to: email, // Recipient email address
            subject: genOTP + 'is your verification code', // Email subject
            // Email body
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nội dung email</title>
            </head>
            <body>
            <p style="font-size: 18px; color: black;">Xin chào!</p>
            <p style="font-size: 18px; color: black;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
            <p style="font-size: 18px; color: black;">Mã xác thực của bạn là: <span style="font-size: 24px; color: blue;"><b>${genOTP}</b></span></p>
            <p style="font-size: 18px; color: black;">Vui lòng dùng mã xác thực này trong vòng 30 phút.</p>
            <p style="font-size: 18px; color: black;">Vui lòng không trả lời email này.</p>
            </body>
            </html>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Failed to send email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Email sent successfully' });
            }
        });
    } catch (error) {
        console.log('Error sending email:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};
//attach to create notification in notification controller
export const SendNotification = async (email: string, deviceName: string, context: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Replace 'Gmail' with your email service provider
            auth: {
                user: EMAIL, // Your email address
                pass: PASSWORD // Your email password or app-specific password
            }
        });
        const mailOptions: nodemailer.SendMailOptions = {
            from: EMAIL, // Sender email address
            to: email, // Recipient email address
            subject: 'Thông báo đến từ hệ thống Aya', // Email subject
            // Email body
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Content</title>
            </head>
            <body>
            <p style="font-size: 18px; color: black;">Xin chào!</p>
            <p style="font-size: 18px; color: black;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
            <p style="font-size: 18px; color: black;">Có một thông báo đến từ: <span style="font-size: 24px; color: orange;"><b>${deviceName}</b></span></p>
            <p style="font-size: 18px; color: black;">${context}</p>
            <p style="font-size: 18px; color: black;">Vui lòng không trả lời email này.</p>
            <p style="font-size: 18px; color: black;">Trân trọng!</p>
            </body>
            </html>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error sending email:', error);
    }
};
export const verificationAcccount = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const otp = req.body.otp;
        if (!validateEmail(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Bad request',
                message: 'Email sai định dạng'
            });
        } else if (!validatePassword(password)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Bad request',
                message: 'Password không đúng định dạng'
            });
        } else {
            console.log('test');

            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'Bad request',
                    message: 'Không tồn tại user với email này'
                });
            }
            // check date expired with otp (30min)
            const currentTime = new Date();
            if (user.otpExpired !== undefined) {
                if (!(currentTime.getTime() - user.otpExpired.getTime() < 30 * 60000)) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        status: 'Bad request',
                        message: 'OTP của bạn đã hết hạn vui lòng lấy otp mới'
                    });
                }
                if (user.otp === undefined) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        status: 'error',
                        message: 'OTP not found for the user!'
                    });
                }
                // otp is valid with datetime check
                if (parseInt(otp) === parseInt(user.otp)) {
                    await user.updateOne({
                        password: await bcrypt.hash(password, 10),
                        otpExpired: undefined
                    });
                    return res.status(StatusCodes.OK).json({
                        message: 'Bạn đã đổi được mật khẩu hãy đăng nhập lại vào tài khoản'
                    });
                } else {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        error: 'Bad request',
                        message: 'OTP của bạn không chính xác hãy kiểm tra lại'
                    });
                }
            } else {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: 'Bad request',
                    message: 'Xin vui lòng lấy OTP trước.'
                });
            }
        }
    } catch (error) {
        console.error('Error in emailController/verificationAccount');
        return res.status(500).json({
            error: 500,
            message: 'Have prolem in server!'
        });
    }
};