import twilio from "twilio";
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendSMS = async (to, message) => {
  await client.messages.create({
    from: process.env.TWILIO_PHONE,
    to,
    body: message,
  });
};
