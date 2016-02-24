"use strict"

const Q = require("q"),
      Stripe = require("stripe").Stripe

const env = process.env.NODE_ENV || "development"

let config

try {
  config = require("../../../config/paypal-config.json")[env]
} catch (e) {
  console.log("Could not find stripe config file")
}

function getSecretKey() {
  const envSecretKey = process.env.STRIPE_SECRET_KEY

  if (envSecretKey) {
    return envSecretKey
  }

  if (config) {
    return config.stripe_secret_key
  }
}

function getPublicKey() {
  const envPublicKey = process.env.STRIPE_PUBLIC_KEY

  if (envPublicKey) {
    return envPublicKey
  }

  if (config) {
    return config.stripe_public_key
  }
}

function getStripeHeaders() {
  return { "Stripe-Public-Key": getPublicKey() }
}

function chargeCard(stripeToken, totalAmount) {
  const stripe = Stripe(getSecretKey())

  return Q(stripe.charges.create({
    amount: parseFloat(totalAmount) * 100,
    currency: "aud",
    source: stripeToken.id,
    description: "Pirate party membership."
  }))
}

module.exports = {
  getPublicKey,
  getSecretKey,
  chargeCard,
  getStripeHeaders
}
