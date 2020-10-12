const { DataTypes } = require('sequelize');
const bcrypt=require('bcrypt');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
    const User = sequelize.define('user', {
		username: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true,
			validate: {
				is: {
					args: /^\w{3,20}$/,
					msg: "We require usernames to have length of at least 3 to 20, and only use letters, numbers and underscores."
				}
			}
        },
        email: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true,
			validate: {
				isEmail: {
					args: true,
					msg: "Please provide correct email"
				}
			}
        },
        password: {
			allowNull: false,
			type: DataTypes.STRING, 
			validate: {
				len: {
					args: [5,],
					msg: "Password must to be at least 5 charracter long"
				}
			}
		},
	});
	User.beforeCreate(async (user, options) => {
		const hashedPass = await bcrypt.hash(user.password, 11);
		user.password = hashedPass;
	  });
    return User;
};