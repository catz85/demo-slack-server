const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
    const Team = sequelize.define('team', {
		name: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true			
        },
    });
    return Team;
};