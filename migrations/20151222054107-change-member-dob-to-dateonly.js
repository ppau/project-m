'use strict';

module.exports = {
    up: function (queryInterface, Sequelize, done) {
        queryInterface.changeColumn("Members", "dateOfBirth", {
            type: Sequelize.DATEONLY
        }).nodeify(done);
    },

    down: function (queryInterface, Sequelize, done) {
        queryInterface.changeColumn("Members", "dateOfBirth", {
            type: Sequelize.DATE
        }).nodefiy(done);
    }
};
