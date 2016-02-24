"use strict"

const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      membersController = require("../controllers/membersController"),
      adminController = require("../controllers/adminController"),
      invoicesController = require("../controllers/invoicesController"),
      stripeHandler = require("../lib/stripeHandler"),
      paypalHandler = require("../lib/paypalHandler")

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    require("../lib/logger").logInfoEvent("Attempted unauth access", req.url)
    req.session.messages = "You need to login to view this page"
    res.redirect("/login")
    return
  }
  next()
}

router.get("/", (req, res) => {
  const headers = Object.assign({}, stripeHandler.getStripeHeaders(), paypalHandler.getPaypalHeaders())

  res.header(headers).render("index", { title: "Pirate Party Membership" })
})

router.get("/members/new", (req, res) => {
  res.render("members/new", { title: "New Member" })
})

router.post("/members", membersController.newMemberHandler)


router.get("/members/verify/:hash", membersController.verify)
router.get("/members/renew/:hash", membersController.renew)
router.get("/members", requireAuth, adminController.membersList)

router.post("/members/update", membersController.updateMemberHandler)
router.get("/verified", (req, res) => {
  res.render("account-verified", { title: "Pirate Party Membership" })
})

router.post("/renew", membersController.renewMemberHandler)

router.post("/payments/paypal", paypalHandler.handleIpn)
router.post("/invoices/update", invoicesController.updateInvoiceHandler)
router.post("/invoices/unaccepted/:reference", requireAuth, invoicesController.acceptPayment)
router.get("/invoices/unaccepted", requireAuth, adminController.unconfirmedPaymentsMembersList)

router.post("/login",
    passport.authenticate("local"), (req, res) => {
      req.session.save(() => {
        res.redirect("/admin")
      })
    })

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" })
})

router.get("/logout", requireAuth, (req, res) => {
  req.logout()
  res.redirect("/login")
})

router.get("/admin", requireAuth, (req, res) => {
  res.render("admin", { title: "Pirate Party Admin" })
})

module.exports = router
