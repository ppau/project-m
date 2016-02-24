"use strict"

const invoiceService = require("../services/invoiceService"),
      paypalIpn = require("paypal-ipn"),
      logger = require("./logger")

const env = process.env.NODE_ENV || "development"

let config

try {
  config = require("../../../config/paypal-config.json")[env]
} catch (e) {
  console.error("Could not find paypal config file")
}

function getServerUrl() {
  if (config) {
    return config.paypal_server_url
  }
}

function getReturnUrl() {
  if (config) {
    return config.paypal_return_url
  }
}

function getPaypalEmail() {
  if (config) {
    return config.paypal_email
  }
}

function getPaypalHeaders() {
  return {
    "Paypal-Server-Url": getServerUrl(),
    "Paypal-Return-Url": getReturnUrl(),
    "Paypal-Email": getPaypalEmail()
  }
}

function handleIpn(req, res) {
  if (!getServerUrl()) {
    res.sendStatus(400)
    return
  }

  const isSandbox = getServerUrl().indexOf(".sandbox.") !== -1

  paypalIpn.verify(req.body, { allow_sandbox: isSandbox }, (err, mes) => { // eslint-disable-line
    if (err) {
      logger.paypalVerifyFailed(err)
      res.sendStatus(400)
    } else if (req.body.payment_status === "Completed" && req.body.receiver_email === getPaypalEmail()) {
      invoiceService.paypalChargeSuccess(req.body.custom, req.body.txn_id)
      .then(() => {
        res.sendStatus(200)
      }).catch(() => {
        res.sendStatus(400)
      })
    } else {
      logger.invalidPaypalIpnRequest(req.body.custom, req.body.txn_id, req.body.payment_status, req.body.receiver_email)
      res.sendStatus(400)
    }
  })
}

module.exports = {
  handleIpn,
  getServerUrl,
  getReturnUrl,
  getPaypalEmail,
  getPaypalHeaders
}
