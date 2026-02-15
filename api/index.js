const { allowCors } = require('./_utils/cors');

async function handler(req, res) {
    res.status(200).json({ message: 'API Running', status: 'ok' });
}

module.exports = allowCors(handler);
