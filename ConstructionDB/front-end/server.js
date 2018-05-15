const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();

const api = require('./server/routes/api');

// Add the JSON parser
app.use(bodyParser.json()); // TODO: This might need a limit later.

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Set up the API routes
app.use('/api', api);

// Return all other routes to the index file.
app.get('*', (req,res) => {
   res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Set the port to an environment variable set as PORT or 3000
// if there isn't a variable
const port = process.env.PORT || '3000';
app.set('port', port);

// Create the server
const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));