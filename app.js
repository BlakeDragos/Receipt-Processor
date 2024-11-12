const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

// In-memory storage for receipts
const receipts = {};

app.post('/receipts/process', (req, res) => {
	try {
		const receipt = req.body;
		if (!receipt || Object.keys(receipt).length === 0) {
			return res.status(400).json({ error: 'Empty body' });
		  }
		validateReceipt(receipt);

		const id = uuidv4();
		const points = calculatePoints(receipt);
		receipts[id] = {
            receipt: receipt,
            points: points
        };

		res.status(200).json({ id });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

app.get('/receipts/:id/points', (req, res) => {
	const { id } = req.params;
	if (receipts[id] !== undefined) {
		res.status(200).json({ points: receipts[id].points });
	} else {
		res.status(404).json({ error: 'No receipt found for that id' });
	}
});

// Validate receipt structure
function validateReceipt(receipt) {
	const receiptSchema = {
	  retailer: /^[\w\s\-&]+$/,
	  purchaseDate: /^\d{4}-\d{2}-\d{2}$/,
	  purchaseTime: /^\d{2}:\d{2}$/,
	  total: /^\d+\.\d{2}$/
	};
  
	if (typeof receipt.retailer !== 'string' || !receiptSchema.retailer.test(receipt.retailer)) {
	  throw new Error('Invalid retailer format');
	}
	if (typeof receipt.purchaseDate !== 'string' || !receiptSchema.purchaseDate.test(receipt.purchaseDate)) {
	  throw new Error('Invalid purchase date format');
	}
	if (typeof receipt.purchaseTime !== 'string' || !receiptSchema.purchaseTime.test(receipt.purchaseTime)) {
	  throw new Error('Invalid purchase time format');
	}
	if (typeof receipt.total !== 'string' || !receiptSchema.total.test(receipt.total)) {
	  throw new Error('Invalid total format');
	}
	if (!Array.isArray(receipt.items) || receipt.items.length < 1) {
	  throw new Error('Items must be a non-empty array');
	}
  
	receipt.items.forEach(item => {
	  if (typeof item.shortDescription !== 'string' || !/^[\w\s\-]+$/.test(item.shortDescription)) {
		throw new Error('Invalid shortDescription format');
	  }
	  if (typeof item.price !== 'string' || !/^\d+\.\d{2}$/.test(item.price)) {
		throw new Error('Invalid price format');
	  }
	});
  }

function calculatePoints(receipt) {
	let points = 0;
	points += receipt.retailer.replace(/[^a-zA-Z0-9]/g, '').length;

	if (parseFloat(receipt.total) % 1 === 0) {
		points += 50;
	}

	if (parseFloat(receipt.total) % 0.25 === 0) {
		points += 25;
	}

	points += Math.floor(receipt.items.length / 2) * 5;

	receipt.items.forEach((item) => {
		if (item.shortDescription.trim().length % 3 === 0) {
			points += Math.ceil(parseFloat(item.price) * 0.2);
		}
	});

    const purchaseDate = new Date(receipt.purchaseDate);
    const day = purchaseDate.getUTCDate(); // Explicitly use UTC to avoid local timezone issues
    if (day % 2 !== 0) {
      points += 6;
    }

	const [hour, minute] = receipt.purchaseTime.split(':').map(Number);
    if (hour >= 14 && (hour < 16 || (hour === 16 && minute === 0))) {
        points += 10;
      }

	return points;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;
