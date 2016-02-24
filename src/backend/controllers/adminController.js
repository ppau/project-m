"use strict"

const memberService = require("../services/memberService")
const invoiceService = require("../services/invoiceService")

function membersList(req, res) {
  function respondWithError(error) {
    res.status(500).json({ error })
  }

  function respondWithSuccess(payload) {
    res.status(200).json(payload)
  }

  function preparePayload(members) {
    return { members }
  }

  return memberService.list()
    .then(preparePayload)
    .then(respondWithSuccess)
    .catch(respondWithError)
}

function unconfirmedPaymentsMembersList(req, res) {
  function respondWithError(error) {
    res.status(500).json({ error })
  }

  function respondWithSuccess(payload) {
    res.status(200).json(payload)
  }

  function preparePayload(members) {
    return { members }
  }

  return invoiceService.unconfirmedPaymentList()
    .then(preparePayload)
    .then(respondWithSuccess)
    .catch(respondWithError)
}

module.exports = {
  membersList,
  unconfirmedPaymentsMembersList
}
