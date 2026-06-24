const isMobileClient = (req) => req.headers['x-client-type'] === 'mobile';

module.exports = { isMobileClient };
