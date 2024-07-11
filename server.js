const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');  // Add this line
const app = express();
const port = 5000;

// Replace YOUR_MONGODB_CONNECTION_STRING with your MongoDB connection string
const mongoURI = 'mongodb+srv://siraj:2FJ63FMlPnQHHpcT@cluster0.xxdhvm1.mongodb.net/LOGIN_DB?retryWrites=true&w=majority';

// Connect to MongoDB
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to get user locations
app.get('/api/locations', async (req, res) => {
    try {
        await client.connect();
        const database = client.db("LOGIN_DB");
        const collection = database.collection("users");

        // Fetch all user documents with location
        const usersWithLocation = await collection.find({ location: { $exists: true } }).toArray();

        res.json(usersWithLocation);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

app.post('/api/deleteLocation', async (req, res) => {
    const { latitude, longitude } = req.body;

    try {
        await client.connect();
        const database = client.db("LOGIN_DB");
        const collection = database.collection("users");

        // Delete the document with the specified latitude and longitude
        const result = await collection.deleteOne({ location: `${latitude}, ${longitude}` });

        if (result.deletedCount > 0) {
            res.json({ message: 'Location deleted successfully' });
        } else {
            res.status(404).json({ error: 'Location not found' });
        }
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});


// Serve the HTML file
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
