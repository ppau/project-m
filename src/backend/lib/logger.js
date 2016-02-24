"use strict"
const winston = require("winston"),
      moment = require("moment")

const winstonLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => {
        return `[${moment().format()}]`
      },
      formatter: (options) => {
        const meta = options.meta ? `\n\t${JSON.stringify(options.meta, null, 2)}` : ""

        return `${options.timestamp()} ${options.level.toUpperCase()} ${options.message || ""} ${meta}`
      }
    })
  ]
})


function logError(error, message) {
  winstonLogger.error(message || "", { error })
}

function logInfoEvent(eventId, eventData) {
  winstonLogger.info(eventId || "unnamed-event", eventData || {})
}

function logMemberSignUpEvent(member) {
  logInfoEvent("[member-sign-up-event]", { member })
}

function logNewInvoiceEvent(invoice) {
  logInfoEvent("[new-invoice-event]", { invoice })
}

function logUpdateInvoiceEvent(invoiceId, updatedFields) {
  logInfoEvent("[update-invoice-event]", { invoiceId, updatedFields })
}

function logCreateEmptyInvoiceEvent(invoice) {
  logInfoEvent("[create-emtpy-invoice-event]", { invoice: invoice.dataValues })
}

function logNewChargeEvent(stripeToken) {
  logInfoEvent("[new-charge-event]", { stripeToken })
}

function logNewFailedCharge(stripeToken, error) {
  logInfoEvent("[new-charge-event-failed]", { stripeToken, error })
}

function logVerificationEmailSent(email) {
  logInfoEvent("[verification-email-sent]", { email })
}

function logWelcomeEmailSent(email) {
  logInfoEvent("[welcome-email-sent]", { email })
}

function logNewPaypalUpdate(invoiceId, paypalId) {
  logInfoEvent("[new-paypal-update]", { invoiceId, paypalId })
}

function logNewFailedPaypalUpdate(invoiceId, paypalId) {
  logInfoEvent("[paypal-update-failed]", { invoiceId, paypalId })
}

function invalidPaypalIpnRequest(invoiceId, txnId, paymentStatus, receiverEmail) {
  logInfoEvent("[paypal-invalid-ipn-request]", { invoiceId, txnId, paymentStatus, receiverEmail })
}

function paypalVerifyFailed(error) {
  logInfoEvent("[paypal-verify-failed]", { error })
}

function logMemberRenewalEvent(member) {
  logInfoEvent("[membership-renewed]", { member })
}

function logMemberRenewalEmail(email) {
  logInfoEvent("[renewal-notification-email-sent]", { email })
}

function logMemberUpdateDetailsEvent(member) {
  logInfoEvent("[member-details-updated]", { member })
}

module.exports = {
  logMemberSignUpEvent,
  logNewInvoiceEvent,
  logUpdateInvoiceEvent,
  logNewChargeEvent,
  logNewFailedCharge,
  logCreateEmptyInvoiceEvent,
  logError,
  logVerificationEmailSent,
  logWelcomeEmailSent,
  logNewPaypalUpdate,
  logNewFailedPaypalUpdate,
  invalidPaypalIpnRequest,
  paypalVerifyFailed,
  logInfoEvent,
  logMemberRenewalEvent,
  logMemberRenewalEmail,
  logMemberUpdateDetailsEvent
}
