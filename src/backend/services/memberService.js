"use strict"

const Q = require("q"),
      models = require("../models"),
      logger = require("../lib/logger"),
      moment = require("moment"),
      Address = models.Address,
      Member = models.Member,
      uuid = require("node-uuid"),
      messagingService = require("./messagingService")

function createHash() {
  return uuid.v4()
}

function save(member) {
  return Member.create.bind(Member)(member)
}

function handleError(message) {
  return (error) => {
    logger.logError(error, message)
    return models.Sequelize.Promise.reject(message)
  }
}

function setupMember(newMember) {
  return (residentialAddress, postalAddress) => {
    return {
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      email: newMember.email,
      gender: newMember.gender,
      dateOfBirth: moment(newMember.dateOfBirth, "DD/MM/YYYY").toDate(),
      primaryPhoneNumber: newMember.primaryPhoneNumber,
      secondaryPhoneNumber: newMember.secondaryPhoneNumber,
      residentialAddressId: residentialAddress[0].dataValues.id,
      postalAddressId: postalAddress[0].dataValues.id,
      membershipType: newMember.membershipType,
      verificationHash: createHash(),
      memberSince: moment().format("L"),
      lastRenewal: moment().format("L")
    }
  }
}

function logEvent(saveResult) {
  logger.logMemberSignUpEvent(saveResult.dataValues)
}

function getMemberAddresses(newMember) {
  return [
    Q(Address.findOrCreate({ where: newMember.residentialAddress, defaults: newMember.residentialAddress })),
    Q(Address.findOrCreate({ where: newMember.postalAddress, defaults: newMember.postalAddress }))
  ]
}

function createMember(newMember) {
  return Q.all(getMemberAddresses(newMember))
    .spread(setupMember(newMember))
    .then(save)
    .tap(logEvent)
    .then((savedMember) => {
      return savedMember.dataValues
    })
    .catch(handleError("Create Member failed"))
}

function updateMember(member) {
  return Q.all([
    Q(Member.find({ where: { email: member.email } })),
    Q(Address.findOrCreate({ where: member.residentialAddress, defaults: member.residentialAddress })),
    Q(Address.findOrCreate({ where: member.postalAddress, defaults: member.postalAddress }))
  ])
  .spread((user, residentialAddress, postalAddress) => {
    if (!user){
      return Q.reject("Error: User email does not exist")
    }
    return {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      gender: member.gender,
      dateOfBirth: moment(member.dateOfBirth, "DD/MM/YYYY").toDate(),
      primaryPhoneNumber: member.primaryPhoneNumber,
      secondaryPhoneNumber: member.secondaryPhoneNumber,
      residentialAddress: residentialAddress[0].dataValues.id,
      postalAddress: postalAddress[0].dataValues.id,
      membershipType: member.membershipType
    }
  })
  .then(updatedMember => {
    return Member.update(updatedMember, { where: { email: member.email } })
  })
  .tap(a => {
    logger.logMemberUpdateDetailsEvent(a)
  })
  .catch(error => {
    return Q.reject(error)
  })
}

function renewMember(hash) {
  const query = { where: { renewalHash: hash } }

  return Member.findOne(query)
    .then((result) => {
      const member = result.dataValues

      member.lastRenewal = moment().format("L")
      return Member.update(member, { where: { renewalHash: hash } })
        .then(() => member)
        .tap(a => {
          logger.logMemberRenewalEvent(a)
        })
        .catch(error => {
          return Q.reject(error)
        })
    })
}

function transformMember(member) {
  const newMemberRoot = member.dataValues
  const newResidentialAddressRoot = member.dataValues.residentialAddress.dataValues

  return Object.assign({}, newMemberRoot, { residentialAddress: newResidentialAddressRoot })
}

function transformMembers(adapter) {
  return (memberQueryResult) => {
    return memberQueryResult.map(adapter)
  }
}

function list() {
  const query = {
    include: [{
      model: Address,
      as: "residentialAddress",
      attributes: ["postcode", "state", "country"]
    }],
    attributes: [
      "id",
      "firstName",
      "lastName",
      "membershipType",
      "verified"
    ]
  }

  return Member.findAll(query)
        .then(transformMembers(transformMember))
        .catch(handleError("An error has occurred while fetching members"))
}

function findForVerification(hash) {
  const query = {
    where: { verificationHash: hash },
    attributes: ["id", "email", "verified"]
  }

  return Member.findOne(query)
    .then((result) => {
      if (!result) {
        throw new Error(`Match not found for hash: ${hash}`)
      }
      return result
    })
}

function markAsVerified(member) {
  if (!member.dataValues.verified) {
    return member.update({ verified: moment().format() })
    .then((result) => {
      return result.dataValues
    })
  }

  return member.dataValues
}

function sendWelcomeEmailOffline(data) {
  logger.logInfoEvent("[sending welcome email]", data)
  messagingService.sendWelcomeEmail(data)
    .catch(logger.logError)

  return data
}

function verify(hash) {
  return findForVerification(hash)
    .then(markAsVerified)
    .then(sendWelcomeEmailOffline)
    .tap((verifiedMember) => logger.logInfoEvent("[member-verification-event]", verifiedMember))
    .catch((error) => {
      logger.logError(error, "[member-verification-failed]")
      throw new Error("Account could not be verified")
    })
}

function transformMembershipToRenew(member) {
  return Object.assign({}, member.dataValues)
}

function findMembershipsExpiringOn(date) {
  if (!date) {
    return Q.resolve([])
  }

  const lastRenewal = moment(date, "L").subtract(1, "year").toDate()
  const query = {
    where: { lastRenewal },
    attributes: ["id", "email"]
  }

  return Member.findAll(query)
    .then(transformMembers(transformMembershipToRenew))
    .catch(handleError("[find-members-expiring-on-failed]"))
}

function findMemberByRenewalHash(hash) {
  const query = {
    where: { renewalHash: hash }
  }

  return Q(Member.findOne(query))
    .then((result) => {
      if (!result) {
        throw new Error("No user found with that renewal hash")
      }

      const member = result.dataValues

      return Q.all([
        Address.findOne({ where: { id: member.residentialAddressId } }),
        Address.findOne({ where: { id: member.postalAddressId } })
      ])
      .spread((residentialAddress, postalAddress) => {
        member.residentialAddress = residentialAddress.dataValues
        member.postalAddress = postalAddress.dataValues
        member.dateOfBirth = moment(member.dateOfBirth).format("DD/MM/YYYY")
        return member
      })
    })
}

function notifyMember(member) {
  const renewalHash = createHash()

  return Member.update({ renewalHash }, { where: { id: member.id } })
    .then(() => {
      member.renewalHash = renewalHash
      return messagingService.sendRenewalEmail(member)
    })
}


function notifyExpiringMembers(membersToNotify) {
  const promises = membersToNotify.map(member => notifyMember(member))

  return Q.all(promises)
}

module.exports = {
  createMember,
  updateMember,
  renewMember,
  list,
  verify,
  notifyExpiringMembers,
  findMembershipsExpiringOn,
  findMemberByRenewalHash
}
