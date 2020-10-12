const _ = require('lodash');
module.exports = {
    formatErrors : (error) => {
        console.log(error.constructor.name)
        console.log(error.name)
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return error.errors.map(x => _.pick(x, ['path', 'message']))
        }
        console.log(error)
        return [{ path: 'name', message: 'something went wrong'}]
    }
}