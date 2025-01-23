require('dotenv').config();
const { createClient } = require("redis");

const client = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on("connect", () => {
    console.log("Connected to Redis successfully.");
});

client.on("error", (err) => {
    console.error("Redis connection failed:", err);
});

(async () => {
    try {
        await client.connect();
        console.log("Redis client connected.");
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
})();

const deleteKey = async (key) => {
    try {
        const result = await client.del(key);
        if (result === 1) {
            console.log(`Key "${key}" has been deleted successfully.`);
        } else {
            console.log(`Key "${key}" not found or couldn't be deleted.`);
        }
    } catch (error) {
        console.error(`Error deleting key "${key}":`, error);
    }
};


const deleteMultipleKeys = async (keys) => {
    try {
        if (keys.length === 0) {
            console.log("No keys provided to delete.");
            return;
        }

        const result = await client.del(...keys);
        console.log(`${result} keys deleted successfully.`);
    } catch (error) {
        console.error("Error deleting multiple keys:", error);
    }
};

const deleteKeysByPattern = async (pattern) => {
    try {
        let cursor = '0';
        let totalKeys = 0;
        let iteration = 0;
        const keysToDelete = []; // Array untuk menyimpan kunci yang akan dihapus

        do {
            const response = await client.scan(cursor, 'COUNT', 100);
            cursor = response.cursor;
            const keys = response.keys;

            console.log(`Cursor: ${cursor}, Keys found: ${keys.length}`);
            console.log(`Pattern used: ${pattern}`); // Log pola yang digunakan

            // Tambahkan kunci yang sesuai dengan pola ke dalam array keysToDelete
            keys.forEach(key => {
                if (key.includes(pattern)) {
                    keysToDelete.push(key);
                }
            });

        } while (cursor !== '0' && iteration++ < 5);

        // Hapus kunci yang sesuai dengan pola
        if (keysToDelete.length > 0) {
            await client.del(...keysToDelete);
            totalKeys += keysToDelete.length;
            console.log(`Deleted keys: ${keysToDelete.join(', ')}`);
        } else {
            console.log('No keys to delete after filtering.');
        }

        console.log(`Total keys deleted: ${totalKeys}`);
        return true;
    } catch (error) {
        console.error('Error deleting keys by pattern:', error);
        return false;
    }
};


module.exports = {
    client,
    deleteKey,
    deleteMultipleKeys,
    deleteKeysByPattern
};
