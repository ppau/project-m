"use strict"
const validator = require("validator")
const moment = require("moment")
const _ = require("lodash")

const memberFieldsChecks = {
  firstName: isValidName,
  lastName: isValidName,
  gender: isValidGender,
  email: isValidEmail,
  primaryPhoneNumber: isValidPhone,
  secondaryPhoneNumber: isValidOptionalPhone,
  dateOfBirth: isValidDate
}

const addressFieldChecks = {
  address: isValidLength,
  suburb: isValidLength,
  postcode: isValidPostcode,
  state: isValidLength,
  country: isValidCountry
}

function isValidVerificationHash(theHash) {
  return validator.isUUID(theHash, "4")
}

function containsSpecialCharacters(theString) {
  return /[\<\>\"\%\;\(\)\&\+]/.test(theString)
}

function isValidString(theString) {
  return !!theString &&
        !containsSpecialCharacters(theString) &&
        theString.length < 256
}

function isValidName(name) {
  return isValidString(name)
}

function isValidGender(gender) {
  return !gender || isValidString(gender)
}

function isValidEmail(email) {
  return validator.isEmail(email)
}

function isValidPhoneNumber(input) {
  return /[-+\s()\d]+/.test(input)
}

function isValidPhone(phone) {
  return (!!phone) && isValidPhoneNumber(phone)
}

function isValidOptionalPhone(phone) {
  return !phone || isValidPhone(phone)
}

function isValidDate(date) {
  const formattedDate = moment(date, "DD/MM/YYYY", true)
  const sixteenYearsAgo = moment().endOf("day").subtract(16, "years")

  return formattedDate.isValid() && formattedDate.isSameOrBefore(sixteenYearsAgo)
}

function isValidPostcode(postcode) {
  return !!postcode && /^\d{4}$/.test(postcode)
}

function isValidInternationalPostcode(postcode) {
  return !!postcode && postcode.toString().length <= 16
}

function setUpPostCodeChecks(addressObj) {
  // XXX: WHY DOES THIS HAVE SIDE EFFECTS?!!!
  // TODO: refactor to make a copy, not share a global state.
  if (addressObj && addressObj.country !== "Australia") {
    addressFieldChecks.postcode = isValidInternationalPostcode
  } else {
    addressFieldChecks.postcode = isValidPostcode
  }
}

function isValidAddress(addressObj) {
  setUpPostCodeChecks(addressObj)

  const addressErrors = _.reduce(addressFieldChecks, (errors, checkFn, memberFieldKey) => {
    if (!addressObj || !checkFn(addressObj[memberFieldKey])) {
      errors.push(memberFieldKey)
    }
    return errors
  }, [])

  if (addressErrors.length > 0){
    return _.map(addressErrors, error => {
      return `residential${_.capitalize(error)}`
    })
  }
  return []
}

function isValidPostalAddress(addressObj) {
  setUpPostCodeChecks(addressObj)
  const addressErrors = _.reduce(addressFieldChecks, (errors, checkFn, memberFieldKey) => {
    if (!addressObj || !checkFn(addressObj[memberFieldKey])) {
      errors.push(memberFieldKey)
    }
    return errors
  }, [])

  if (addressErrors.length > 0){
    return _.map(addressErrors, error => {
      return `postal${_.capitalize(error)}`
    })
  }
  return []
}

function isValidLength(object, minLength, maxLength) {
  const max = Math.min(maxLength, 255)
  const min = Math.max(minLength, 1)

  return object &&
    object.length <= max &&
    object.length >= min
}

function isValidCountry(country) {
  return isValidLength(country) && country !== "Select Country"
}

function isValidDetails(member) {
  return _.reduce(memberFieldsChecks, (errors, checkFn, memberFieldKey) => {
    if (!member || !checkFn(member[memberFieldKey])){
      errors.push(memberFieldKey)
    }
    return errors
  }, [])
}

function isValidMembershipType(type) {
  const validOptions = ["full", "permanentResident", "supporter", "internationalSupporter"]

  return validOptions.indexOf(type) !== -1
}

function isValid(member) {
  const errors = [
    isValidDetails(member),
    isValidAddress(member && member.residentialAddress),
    isValidPostalAddress(member && member.postalAddress)
  ]

  return _.flatten(errors)
}

module.exports = {
  isValidName,
  isValidGender,
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValid,
  isValidAddress,
  isValidMembershipType,
  isValidVerificationHash
}
