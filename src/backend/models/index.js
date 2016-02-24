"use strict"

const fs = require("fs"),
      path = require("path"),
      Sequelize = require("sequelize"),
      basename = path.basename(module.filename)

const db = {}
const connection = require("../db/connection.js")

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js")
  })
  .forEach(file => {
    const model = connection.import(path.join(__dirname, file))

    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = connection
db.Sequelize = Sequelize

module.exports = db
