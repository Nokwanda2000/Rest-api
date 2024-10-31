const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'shopping-list-data');
const filePath = path.join(dataDir, 'shopping-list.json');

// Create directory and file if they don't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    fs.writeFileSync(filePath, JSON.stringify([])); // Initialize with an empty array
}

// Function to read and parse the JSON file
const readData = () => {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
};

// Function to update the JSON file with new data
const writeData = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
};


const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'GET' && req.url === '/shopping-list') {
        const shoppingList = readData();
        res.writeHead(200);
        res.end(JSON.stringify(shoppingList));
        
    } else if (req.method === 'POST' && req.url === '/shopping-list') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const newItem = JSON.parse(body);
            if (!newItem.name || newItem.quantity <= 0) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid item data' }));
            }
            const shoppingList = readData();
            shoppingList.push(newItem);
            writeData(shoppingList);
            res.writeHead(201);
            res.end(JSON.stringify(newItem));
        });
        
    } else if (req.method === 'PUT' && req.url.startsWith('/shopping-list/')) {
        const id = req.url.split('/')[2];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const updatedItem = JSON.parse(body);
            const shoppingList = readData();
            if (!updatedItem.name || updatedItem.quantity <= 0) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid item data' }));
            }
            const index = shoppingList.findIndex(item => item.id === id);
            if (index !== -1) {
                shoppingList[index] = { ...shoppingList[index], ...updatedItem };
                writeData(shoppingList);
                res.writeHead(200);
                res.end(JSON.stringify(shoppingList[index]));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Item not found' }));
            }
        });
        
    } else if (req.method === 'DELETE' && req.url.startsWith('/shopping-list/')) {
        const id = req.url.split('/')[2];
        const shoppingList = readData();
        const newShoppingList = shoppingList.filter(item => item.id !== id);
        writeData(newShoppingList);
        res.writeHead(204);
        res.end();
        
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
