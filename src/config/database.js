const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
dotenv.config();

const dnsServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
    : ['8.8.8.8', '1.1.1.1'];

dns.setServers(dnsServers);

async function connectToDB() {
    if (!process.env.MONGO_URI) {
        throw new Error('Missing MONGO_URI in environment variables');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

module.exports = connectToDB;
