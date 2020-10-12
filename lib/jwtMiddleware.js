const sequelize = require('../dbmodels');
const config = require('../config');
const jwt = require('jsonwebtoken');
const { refreshTokens } = require("../lib/auth");

const jwtMiddleware = async (req, res, next) => {
    const token = req.headers['x-token'];
    console.log("Tokens to verify", token)
    if (token) {
        try {
            const { user } = jwt.verify(token, jswebtokensecret);
            req.user = user;
        } catch (err) {
            const refreshToken = req.headers['x-refresh-token'];
            const newTokens = await refreshTokens(token, refreshToken, sequelize, config.jwt.secretOne, config.jwt.secretTwo)
            if (newTokens.token && newTokens.refreshToken) {
                res.set('x-token', newTokens.token);
                res.set('x-refresh-token', newTokens.refreshToken)
            }
            req.user = newTokens.user;
        }
    }
    next();
}

module.exports = {
    jwtMiddleware
}