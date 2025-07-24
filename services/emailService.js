const { transporter } = require('../config/email');

const sendOTPEmail = async (email, otp, userName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'PlaceGrad - Login Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">PlaceGrad</h1>
                        <p style="color: #64748b; margin: 5px 0 0 0;">Placement Portal</p>
                    </div>
                    
                    <h2 style="color: #1e40af; margin-bottom: 20px;">Login Verification</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${userName}</strong>,
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        You have successfully logged into PlaceGrad. To complete your login, please enter the verification code below:
                    </p>
                    
                    <div style="background: #3b82f6; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 25px 0; letter-spacing: 3px;">
                        ${otp}
                    </div>
                    
                    <p style="color: #ef4444; font-size: 14px; text-align: center; margin: 20px 0;">
                        ⚠️ This code expires in 10 minutes
                    </p>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you didn't attempt to log in, please ignore this email or contact support if you have concerns.
                    </p>
                    
                    <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                        © 2025 LDRP Institute of Technology and Research. All rights reserved.
                    </div>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'PlaceGrad - Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">PlaceGrad</h1>
                        <p style="color: #64748b; margin: 5px 0 0 0;">Placement Portal</p>
                    </div>
                    
                    <h2 style="color: #dc2626; margin-bottom: 20px;">Password Reset Request</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${userName}</strong>,
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        You requested to reset your password for your PlaceGrad account. Click the button below to create a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetURL}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetURL}" style="color: #3b82f6; word-break: break-all;">${resetURL}</a>
                    </p>
                    
                    <p style="color: #ef4444; font-size: 14px; text-align: center; margin: 20px 0;">
                        ⚠️ This link expires in 30 minutes
                    </p>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                    </p>
                    
                    <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                        © 2025 LDRP Institute of Technology and Research. All rights reserved.
                    </div>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendOTPEmail,
    sendPasswordResetEmail
};