"use strict"

const _ = require("lodash")

const paymentFieldsChecks = {
  totalAmount: isValidAmount,
  paymentType: isValidPaymentType,
  invoiceId: isValidId
}

const noContributeChecks = {
  totalAmount: isZero,
  paymentType: isValidPaymentType,
  invoiceId: isValidId
}

function isEmpty(data) {
  if (!data) {
    return true
  }

  return _.isEmpty(data.toString())
}

function isValidAmount(totalAmount) {
  return !isEmpty(totalAmount) && !isNaN(totalAmount) && totalAmount >= 1
}

function isValidPaymentType(paymentType) {
  return !isEmpty(paymentType)
}

function isValidId(id) {
  return !isEmpty(id) && !isNaN(id)
}

function isZero(number) {
  return number === 0
}

function isValidNoContribute(payment) {
  return _.reduce(noContributeChecks, (errors, checkFn, paymentFieldKey) => {
    if (!payment || !checkFn(payment[paymentFieldKey])){
      errors.push(paymentFieldKey)
    }
    return errors
  }, [])
}

function isValid(payment) {
  return _.reduce(paymentFieldsChecks, (errors, checkFn, paymentFieldKey) => {
    if (!payment || !checkFn(payment[paymentFieldKey])){
      errors.push(paymentFieldKey)
    }
    return errors
  }, [])
}

module.exports = {
  isValidAmount,
  isValidPaymentType,
  isValidId,
  isValid,
  isValidNoContribute
}
