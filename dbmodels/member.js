const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
    const Member = sequelize.define('member', {
		admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    return Member;
};