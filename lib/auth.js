const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const toexport = {};

toexport.createTokens = async (user, secret, secret2) => {
        const createToken = jwt.sign(
          {
            user: _.pick(user, ['id', 'username']),
          },
          secret,
          {
            expiresIn: '1d',
          },
        );
      
        const createRefreshToken = jwt.sign(
          {
            user: _.pick(user, ['id', 'username']),
          },
          secret2,
          {
            expiresIn: '7d',
          },
        );
      
        return [createToken, createRefreshToken];
      }
toexport.refreshTokens = async (token, refreshToken, models, SECRET, SECRET2) => {
        let userId = -1;
        try {
          const { user: { id } } = jwt.decode(refreshToken);
          userId = id;
        } catch (err) {
          return {};
        }
      
        if (!userId) {
          return {};
        }
      
        const user = await models.models.user.findOne({ where: { id: userId }, raw: true });
      
        if (!user) {
          return {};
        }
        const refreshSecret = user.password + SECRET2;
        try {
          jwt.verify(refreshToken, refreshSecret);
        } catch (err) {
          return {};
        }
      
        const [newToken, newRefreshToken] = await toexport.createTokens(user, SECRET, refreshSecret);
        return {
          token: newToken,
          refreshToken: newRefreshToken,
          user,
        };
      }
toexport.tryLogin = async (email, password, models, SECRET, SECRET2) => {
        const user = await models.user.findOne({ where: { email }, raw: true });
        if (!user) {
          //bad user
          return {
            ok: false,
            errors: [{path: 'login', message: 'Invalid login'}]
          }
        }
      
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          // bad password
          return {
            ok: false,
            errors: [{path: 'login', message: 'Invalid login'}]
          }
        }
        
        const refreshTokenSecret = user.password + SECRET2;
        const [token, refreshToken] = await toexport.createTokens(user, SECRET, refreshTokenSecret);
        return {
          ok: true,
          token,
          refreshToken,
        };
      }
module.exports = toexport;
