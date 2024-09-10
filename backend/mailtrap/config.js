import { MailtrapClient } from 'mailtrap'; // Hypothetical package
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const TOKEN =  "9a0badc3b48968f098992aff2a9c54db";

if (!TOKEN) {
  throw new Error('MAILTRAPTOKEN is not defined in the environment variables.');
}

export const client = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: 'mailtrap@demomailtrap.com',
  name: 'nisahtt',
};

