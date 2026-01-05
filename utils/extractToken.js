const jwt = require('jsonwebtoken');
const AppError = require('./appError')
const { promisify } = require('util');


const extractToken = async (req) => {
    // get the token and check if exists
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1]; // "Bearer <token>"
    }
    // verify the token
    if (!token) throw new AppError('You are not logged in! Please log in to get access', 401);
    const verifyPromise = promisify(jwt.verify); // node util func, allowes us to use callback func in Async await way.
    const decoded = await verifyPromise(token, process.env.JWT_SECRET); // returns {id , iat, exp} (id beacuse it's how we built it)
    return decoded
}

module.exports = extractToken