'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');
var membersController = require('../controllers/membersController');
var adminController = require('../controllers/adminController');
var invoicesController = require('../controllers/invoicesController');
var stripeHandler = require('../lib/stripeHandler');
var paypalHandler = require('../lib/paypalHandler');

function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        require('../lib/logger').logInfoEvent('Attempted unauth access', req.url);
        req.session.messages = 'You need to login to view this page';
        res.redirect('/login');
        return;
    }
    next();
}

router.get('/', function (req, res) {
    let headers = Object.assign({}, stripeHandler.getStripeHeaders(), paypalHandler.getPaypalHeaders());
    res.header(headers).render('index', {title: 'Pirate Party Membership'});
});

router.post('/members', membersController.newMemberHandler);

router.get('/members/verify/:hash', membersController.verify);
router.get('/members/renew/:hash', membersController.renew);
router.get('/members', requireAuth, adminController.membersList);

router.post('/members/update', membersController.updateMemberHandler);
router.get('/verified', function (req, res) {
    res.render('account-verified', {title: 'Pirate Party Membership'});
});

router.post('/renew', membersController.renewMemberHandler);

router.post('/payments/paypal', paypalHandler.handleIpn);
router.post('/invoices/update', invoicesController.updateInvoiceHandler);
router.post('/invoices/unaccepted/:reference', requireAuth, invoicesController.acceptPayment);
router.get('/invoices/unaccepted', requireAuth, adminController.unconfirmedPaymentsMembersList);

router.post('/login',
    passport.authenticate('local'), function (req, res) {
        req.session.save(function () {
            res.redirect('/admin');
        });
    });

router.get('/login', function (req, res) {
    res.render('login', {title: 'Login'});
});

router.get('/logout', requireAuth, function (req, res) {
    req.logout();
    res.redirect('/login');
});

router.get('/admin', requireAuth, function (req, res) {
    res.render('admin', {title: 'Pirate Party Admin'});
});

module.exports = router;
