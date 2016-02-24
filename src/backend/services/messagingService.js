"use strict"

const emailUtil = require("../lib/emailUtil"),
      config = require("config"),
      logger = require("../lib/logger"),
      Q = require("q")

function logAndRethrow(message) {
  return (error) => {
    logger.logError(error, message)
    throw new Error(error)
  }
}

function logAndRethrow(message) {
  return (error) => {
    logger.logError(error, message)
    throw new Error(error)
  }
}

const emails = {
  welcome: {
    logger: logger.logWelcomeEmailSent,
    subject: "The Pirate Party - Welcome",
    text() {
      return `Welcome to the Pirate Party!

      You can now start participating and getting involved towards the development of a more secure and transparent Australia.

      For a list of upcoming meetings and discussions, head to pirateparty.org.au

      Best,

      The Pirate Party`
    }
  },
  verification: {
    logger: logger.logVerificationEmailSent,
    subject: "The Pirate Party - Verify Your Email",
    text(member) {
      return `Hello,

      Thank you for your membership application to the Pirate Party.

      You're almost done! The last step is to verify your membership by clicking on the link below.

      ${config.app.publicUrl}/members/verify/${member.verificationHash}

      Best,

      The Pirate Party`
    }
  },
  renewal: {
    logger: logger.logMemberRenewalEmail,
    subject: "The Pirate Party - Renew Your Membership",
    text(member) {
      return `Hello,

      Your Pirate Party membership is due to expire 90 days. To renew it, please click on the following link:

      ${config.app.publicUrl}/members/renew/${member.renewalHash}

      Should you have any questions or concerns, do not hesitate to contact us at membership@pirateparty.org.au.

      Best,

      The Pirate Party`
    }
  }
}

function sendEmail(member, type) {
  if (!config.get("email.sendEmails")) {
    return Q.resolve(member)
  }

  const options = {
    to: member.email,
    subject: type.subject,
    body: type.text(member)
  }

  return emailUtil.sendHtmlEmail(options)
    .then((result) => {
      return {
        options,
        message: result
      }
    })
    .tap(type.logger)
    .catch(logAndRethrow("[verification-email-failed]"))
}

function sendVerificationEmail(member) {
  return sendEmail(member, emails.verification)
}

function sendWelcomeEmail(member) {
  return sendEmail(member, emails.welcome)
}

function sendRenewalEmail(member) {
  return sendEmail(member, emails.renewal)
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendRenewalEmail
}
