import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions';

admin.initializeApp();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mpazdev@gmail.com',
    pass: 'gqqrkpdrfqufroca',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (email: string, subject: string, text: string) => {
  const mailOptions = {
    from: 'mpazdev@gmail.com',
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully!');
  } catch (error) {
    console.log('Error sending email: ', error);
  }
};

const assignRole = async (email: string, role: string) => {};

export const createCustomer = functions.auth.user().onCreate(async (user) => {
  try {
    await sendEmail(
      user.email as string,
      'Welcome to my practice project!',
      'Click here to get started: http://localhost:4200/customer/login'
    );
  } catch (error) {
    console.log('Error sending email: ', error);
  }
});
export const updateProduct = onDocumentUpdated(
  'products/{productId}',
  async (event: { data: any }) => {
    try {
      await sendEmail(
        'pazmichaelandrew70@gmail.com',
        'test',
        'This is a test from mpazdev'
      );
    } catch (error) {
      console.log('Error sending email: ', error);
    }
  }
);

export const assginUserRole = functions.auth.user().onCreate(async (user) => {
  try {
    console.log('User: ', user);
    await admin.firestore().collection('customer').doc(user.uid).set({
      email: user.email,
      role: 'customer',
    });
    console.log(`User: ${user.email} assigned role: customer`);
  } catch (error) {
    console.log('Error assigning user role: ', error);
  }
});
