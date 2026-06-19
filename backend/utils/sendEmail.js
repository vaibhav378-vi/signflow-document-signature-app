import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "SignFlow <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("RESEND ERROR:", error);
    throw new Error(error.message || "Email sending failed");
  }

  console.log("RESEND EMAIL SENT:", data);
  return data;
};

export default sendEmail;