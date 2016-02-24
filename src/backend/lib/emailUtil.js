"use strict"

const nodemailer = require("nodemailer"),
      sendmailTransport = require("nodemailer-sendmail-transport"),
      config = require("config").email

const emailConfig = {
  path: config.server,
  args: ["-t"]
}

function sendEmail(options) {
  const transport = nodemailer.createTransport(sendmailTransport(emailConfig))

  return new Promise((resolve, reject) => {
    options.from = options.from || `Pirate Party <${config.membershipEmail}>`

    transport.sendMail(options, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

function sendHtmlEmail(options) {
  if (!(options && options.to)) {
    throw new Error("Invalid email parameters")
  }

  const to = Array.isArray(options.to) ? options.to : [options.to]

  const emailOptions = {
    from: options.from,
    to: to,
    subject: options.subject,
    html: options.body
  }

  return sendEmail(emailOptions)
}


function sendPlainTextEmail(options) {
  if (!(options && options.to)) {
    throw new Error("Invalid email parameters")
  }

  const to = Array.isArray(options.to) ? options.to : [options.to]

  const emailOptions = {
    from: options.from,
    to: to,
    subject: options.subject,
    text: options.body
  }

  return sendEmail(emailOptions)
}

module.exports = {
  sendHtmlEmail,
  sendPlainTextEmail
}
