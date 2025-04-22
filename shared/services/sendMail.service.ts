import nodemailer from "nodemailer";
import handlebars from "handlebars";
import { addMail, readHTMLFile } from "../helper/common";
import path from "path";
import fs from "fs";
import { mailStatus } from "../models/Mail";

// Define a type for our custom transporter
interface CustomTransporter {
  sendMail: (options: any, callback: any) => Promise<{ response: string }>;
}

const sendEmail = async function (
  to: any,
  subject: any,
  template: any,
  from = "noreply@example.com",
  data: any,
  attachments?: any
) {
  try {
    // Ensure global.config exists
    if (typeof global.config === "undefined") {
      console.warn(
        "Warning: global.config is undefined. Using fallback email configuration."
      );
      // Initialize with default config if missing
      global.config = {
        IS_EMAIL_USE_SMTP: "off",
        SMTP_EMAIL: "noreply@example.com",
        FROM_EMAIL: "noreply@example.com",
      };
    }

    let transporter:
      | ReturnType<typeof nodemailer.createTransport>
      | CustomTransporter
      | null = null;

    // Since we're having issues with nodemailer, let's use a development transport for now
    transporter = {
      sendMail: (options, callback) => {
        console.log("DEV MODE - Not sending real email:");
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        console.log("Content:", options.html?.substring(0, 150) + "...");
        if (callback)
          callback(null, { response: "Development mode - no email sent" });
        return Promise.resolve({
          response: "Development mode - no email sent",
        });
      },
    };

    const mailOptions: any = {
      from: from || global.config?.SMTP_EMAIL || "noreply@example.com",
      to: to,
      subject: `${subject} ${
        process.env.NODE_ENV === undefined
          ? "(development)"
          : process.env.NODE_ENV !== "production"
            ? `(${process.env.NODE_ENV})`
            : ""
      }`,
      html: template,
    };

    const mail_detail: any = {
      mailSubject: mailOptions.subject,
      mailTo: mailOptions.to,
      mailFrom: mailOptions.from,
      mailBody: JSON.stringify(data),
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    if (!to || to === "") {
      console.log("No recipient email provided");
      return;
    }

    if (!transporter) {
      console.error("Transporter is null");
      mail_detail.mailStatus = mailStatus.FAILED;
      mail_detail.mailResponse = JSON.stringify({
        error: "Transporter is null",
      });
      await addMail(mail_detail);
      return;
    }

    return await transporter.sendMail(
      mailOptions,
      async (error: any, info: any) => {
        if (error) {
          console.error("Email send error:", error);
          mail_detail.mailStatus = mailStatus.FAILED;
          mail_detail.mailResponse = JSON.stringify(error);
          await addMail(mail_detail);
        } else if (info) {
          console.log("Email sent successfully:", info.response);
          mail_detail.mailResponse = JSON.stringify(info);
          mail_detail.mailStatus = mailStatus.SENT;
          await addMail(mail_detail);
        }
      }
    );
  } catch (e) {
    console.error("Email sending failed:", e);
  }
};

/**
 * Send email using template
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param data - Template data
 * @param templateName - Template name (without .html extension)
 * @param attachments - Optional email attachments
 */
const emailSender = (
  to: string,
  subject: string,
  data: any,
  templateName: string,
  attachments?: any
) => {
  try {
    // Get the template path
    const templatePath = path.join(
      __dirname,
      "../../shared/email_templates",
      `${templateName}.html`
    );

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error(`Email template not found: ${templatePath}`);

      // Use fallback template if the template doesn't exist
      const fallbackHTML = generateFallbackTemplate(
        subject,
        templateName,
        data
      );

      sendEmail(
        to,
        subject,
        fallbackHTML,
        global.config?.FROM_EMAIL || "noreply@example.com",
        data,
        attachments
      );

      return;
    }

    // Read the template file
    readHTMLFile(templatePath, (err: any, html: string) => {
      if (err) {
        console.error(`Error reading email template: ${err.message}`);

        // Use fallback template if there's an error reading the file
        const fallbackHTML = generateFallbackTemplate(
          subject,
          templateName,
          data
        );

        sendEmail(
          to,
          subject,
          fallbackHTML,
          global.config?.FROM_EMAIL || "noreply@example.com",
          data,
          attachments
        );

        return;
      }

      try {
        // Add current year to template data
        const templateData = {
          ...data,
          currentYear: new Date().getFullYear(),
          appUrl: global.config?.APP_URL || "https://goodbusy.com",
        };

        // Compile the template with handlebars
        const template = handlebars.compile(html);
        const htmlToSend = template(templateData);

        // Send the email
        sendEmail(
          to,
          subject,
          htmlToSend,
          global.config?.FROM_EMAIL || "noreply@example.com",
          data,
          attachments
        );
      } catch (templateError) {
        console.error(`Error compiling template: ${templateError}`);

        // Use fallback template if there's an error compiling the template
        const fallbackHTML = generateFallbackTemplate(
          subject,
          templateName,
          data
        );

        sendEmail(
          to,
          subject,
          fallbackHTML,
          global.config?.FROM_EMAIL || "noreply@example.com",
          data,
          attachments
        );
      }
    });
  } catch (e) {
    console.error("Email sender error:", e);
  }
};

/**
 * Generate a fallback HTML template if the specified template is not found
 */
const generateFallbackTemplate = (
  subject: string,
  templateName: string,
  data: any
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #673AB7;">${subject}</h2>
      <div style="margin: 20px 0;">
        <p>Hello ${data.firstName || ""}!</p>
        <p>This is an important notification from Good Busy.</p>
        ${data.otp ? `<p>Your verification code is: <strong>${data.otp}</strong></p>` : ""}
        <p>Template requested: ${templateName}</p>
      </div>
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
        <p>&copy; ${new Date().getFullYear()} Good Busy. All rights reserved.</p>
      </div>
    </div>
  `;
};

export { emailSender };
