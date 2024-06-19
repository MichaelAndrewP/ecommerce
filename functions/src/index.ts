import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions';
import * as pubsub from '@google-cloud/pubsub';

admin.initializeApp();

process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

const pubSubClient = new pubsub.PubSub();

async function listSubscriptions() {
  try {
    const [subscriptions] = await pubSubClient
      .topic('products')
      .getSubscriptions();
    console.log('Subscriptions:');
    subscriptions.forEach((subscription) => console.log(subscription.name));
  } catch (error) {
    console.log('Error listing subscriptions: ', error);
  }
}

export const createProductTopic = functions.https.onRequest(
  async (req, res) => {
    const topicName = 'products';

    try {
      await pubSubClient.createTopic(topicName);
      console.log(`Topic ${topicName} created.`);

      // Call listSubscriptions function after the topic is created
      await listSubscriptions();

      res.status(200).send(`Topic ${topicName} created.`);
    } catch (error) {
      console.error(`Error creating topic ${topicName}: `, error);
      res.status(500).send(`Error creating topic ${topicName}: ${error}`);
    }
  }
);

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

/* const assignRole = async (email: string, role: string) => {}; */

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
    await admin.firestore().collection('customer').doc(user.uid).set({
      email: user.email,
      role: 'customer',
    });
    console.log(`User: ${user.email} assigned role: customer`);
  } catch (error) {
    console.log('Error assigning user role: ', error);
  }
});

export const publishMessage = functions.firestore
  .document('products/{productId}')
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();
      const dataBuffer = Buffer.from(JSON.stringify(message));
      const messageId = await pubSubClient
        .topic('products')
        .publishMessage({ data: dataBuffer });
      await listSubscriptions();
      console.log(`Message published.`, messageId);
      return null;
    } catch (error) {
      console.log('Error publishing message: ', error);
      return null;
    }
  });
