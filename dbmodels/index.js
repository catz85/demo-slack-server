const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./extra-setup');
const { db } = require("../config")

//connection to postgres

const sequelize = new Sequelize(db.name, db.user, db.password, {
    dialect: 'postgres',
    define: {
        underscored: true
    }
});

//describe postgres models

const modelDefiners = [
    require('./user'),
    require('./message'),
    require('./team'),
    require('./channel'),
    require('./member'),
    require('./direct')
];

for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

applyExtraSetup(sequelize);
// We export the sequelize connection instance to be used around our app.

module.exports = sequelize;