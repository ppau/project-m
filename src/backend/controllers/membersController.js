"use strict"

const memberService = require("../services/memberService"),
      invoiceService = require("../services/invoiceService"),
      memberValidator = require("../../lib/memberValidator"),
      messagingService = require("../services/messagingService"),
      stripeHandler = require("../lib/stripeHandler"),
      paypalHandler = require("../lib/paypalHandler"),
      logger = require("../lib/logger"),
      Q = require("q")

function isPostalAddressEmpty(postal) {
  return postal.address === "" &&
    postal.suburb === "" &&
    postal.postcode === ""
}

function residentialAddress(req) {
  return {
    address: req.body.residentialAddress.address,
    suburb: req.body.residentialAddress.suburb,
    postcode: req.body.residentialAddress.postcode,
    state: req.body.residentialAddress.state,
    country: req.body.residentialAddress.country
  }
}

function postalAddress(req) {
  if (isPostalAddressEmpty(req)) {
    return residentialAddress(req)
  }

  return {
    address: req.body.postalAddress.address,
    suburb: req.body.postalAddress.suburb,
    postcode: req.body.postalAddress.postcode,
    state: req.body.postalAddress.state,
    country: req.body.postalAddress.country
  }
}

function setupNewMember(req) {
  return {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    gender: req.body.gender,
    primaryPhoneNumber: req.body.primaryPhoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    dateOfBirth: req.body.dateOfBirth,
    residentialAddress: residentialAddress(req),
    postalAddress: postalAddress(req),
    membershipType: req.body.membershipType
  }
}

function sendVerificationEmailOffline(data) {
  messagingService.sendVerificationEmail(data.member)
  .catch(logger.logError)
}

function createEmptyInvoice(createdMember) {
  return invoiceService.createEmptyInvoice(createdMember.email, createdMember.membershipType)
  .then((emptyInvoice) => {
    return {
      invoice: emptyInvoice,
      member: createdMember
    }
  })
}

function sendResponseToUser(res) {
  return data => {
    const responseForUser = {
      invoiceId: data.invoice.id,
      newMember: {
        email: data.member.email
      }
    }

    res.status(200).json(responseForUser)
  }
}

function handleError(res) {
  return error => {
    logger.logError("membersController", error)
    res.sendStatus(500)
  }
}

function newMemberHandler(req, res) {
  const newMember = setupNewMember(req)
  const validationErrors = memberValidator.isValid(newMember)

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors })
  }

  return memberService.createMember(newMember)
    .then(createEmptyInvoice)
    .tap(sendResponseToUser(res))
    .tap(sendVerificationEmailOffline)
    .catch(handleError(res))
}

function updateMemberHandler(req, res) {
  const newMember = setupNewMember(req)
  const validationErrors = memberValidator.isValid(newMember)

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors })
  }

  return memberService.updateMember(newMember)
        .then((result) => {
          res.status(200).json({ newMember: result })
        })
        .catch(handleError(res))
}

function verify(req, res) {
  const hash = req.params.hash

  if (!memberValidator.isValidVerificationHash(hash)) {
    logger.logError("[member-verification-failed]", { error: "Invalid input params", hash })
    res.sendStatus(400)
    return Q.reject("Invalid Input")
  }

  return memberService.verify(hash)
  .then(() => {
    res.redirect("/verified")
  })
  .catch(() => {
    res.sendStatus(400)
  })
}

function renew(req, res) {
  const hash = req.params.hash

  if (!memberValidator.isValidVerificationHash(hash)) {
    logger.logError("[member-verification-failed]", { hash: hash })
    res.sendStatus(400)
    return Q.reject("Invalid Input")
  }

  return memberService.findMemberByRenewalHash(hash)
    .then((result) => {
      const u = {
        user: JSON.stringify(result)
      }
      const headers = Object.assign({}, u,
        stripeHandler.getStripeHeaders(),
        paypalHandler.getPaypalHeaders()
      )

      res.header(headers).render("renew")
    })
}

function renewMemberHandler(req, res) {
  const hash = req.body.renewalHash

  return memberService.renewMember(hash)
    .then(createEmptyInvoice)
    .tap(sendResponseToUser(res))
    .catch(handleError(res))
}

module.exports = {
  newMemberHandler,
  updateMemberHandler,
  verify,
  renew,
  renewMemberHandler
}
