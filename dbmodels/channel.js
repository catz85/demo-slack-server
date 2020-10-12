const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
    const Channel = sequelize.define('channel', {
		name: {
			allowNull: false,
			type: DataTypes.STRING,
        },
        public: {
            defaultValue: true, 
            type: DataTypes.BOOLEAN
        }
    });
    return Channel;
};