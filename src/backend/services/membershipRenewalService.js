"use strict"

const memberService = require("./memberService")
const moment = require("moment")
const logger = require("../lib/logger")
const CronJob = require("cron").CronJob
const everyDayAt0730 = "00 30 7 * * *"

function membershipsExpiringSoon() {
  const in90Days = moment().add(90, "days").format("L")

  return memberService.findMembershipsExpiringOn(in90Days)
}

function remindMembersToRenew() {
  return membershipsExpiringSoon()
    .then(memberService.notifyExpiringMembers)
}

function start() {
  const job = new CronJob({
    cronTime: everyDayAt0730,

    onTick() {
      logger.logInfoEvent("[renewal-notification-job-started]")

      remindMembersToRenew()
      .then((result) => logger.logInfoEvent("[renewal-notification-job-finished]", `Notifications sent: ${result.length}`))
      .catch((error) => {
        logger.logError(error.toString(), "[renewal-notification-job-failed]")
      })
    },
    start: false
  })

  job.start()
}


module.exports = {
  start
}
