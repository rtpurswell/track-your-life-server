const nodemailer = require("nodemailer");
const config = require("config");
const bcrypt = require("bcrypt");
class Emailer {
  constructor() {}
  async emailer(recepient, subject, htmlBody) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: config.get("mail.host"),
      port: config.get("mail.port"),
      secure: false, // use SSL?
      auth: {
        user: config.get("mail.username"),
        pass: config.get("mail.password"),
      },
      tls: {
        ciphers: "SSLv3", //We must specify TLS because we are using O365. This may need to change in the furure.
      },
    });

    // send mail with defined transport object
    try {
      let info = await transporter.sendMail({
        from: `"${config.get("mail.fromName")}" <${config.get(
          "mail.fromAddress"
        )}>`, // sender address
        to: recepient, // list of receivers
        subject: subject, // Subject line

        html: htmlBody, // html body
      });
      return info;
    } catch (error) {
      return error;
    }
  }
  async sendVerificationEmail(user) {
    const emailVerification = await bcrypt.hash(user._id.toString(), 10);
    const emailResult = await this.emailer(
      user.email,
      `Please confirm your email-- ${config.get("brand")}`,
      `<div>Please <a href='${config.get("protocol")}://${config.get(
        "domain"
      )}/api/users/validate?email=${
        user.email
      }&code=${emailVerification}'>Click here</a> to verify your email address. If the link is not working you can also copy paste the following address in your browser ${config.get(
        "protocol"
      )}://${config.get("domain")}/api/users/validate?email=${
        user.email
      }&code=${emailVerification}</div>`
    );
    return emailResult;
  }
}

module.exports = new Emailer();
