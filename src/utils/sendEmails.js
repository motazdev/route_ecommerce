import nodemailer from "nodemailer";

export const sendEmail = async ({ attachments, to, html, subject }) => {
    const transporter = nodemailer.createTransport({
        host: "localhost",
        port: 465,
        secure: true,
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
    async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"Ecommerce App 🛍️" <${process.env.EMAIL}>`,
            to,
            subject,
            html,
            attachments
        });

        console.log("Message sent: %s", info.messageId);

    }

    main().catch(console.error);
};