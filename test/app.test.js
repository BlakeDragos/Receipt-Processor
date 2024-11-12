const request = require('supertest');
const app = require('../app');

describe('Receipt Processor API', () => {
	describe('POST /receipts/process', () => {
		it('should process a valid receipt and return an ID', async () => {
			const receipt = {
				retailer: 'Target',
				purchaseDate: '2022-01-01',
				purchaseTime: '13:01',
				items: [
					{ shortDescription: 'Mountain Dew 12PK', price: '6.49' },
					{ shortDescription: 'Emils Cheese Pizza', price: '12.25' },
				],
				total: '18.74',
			};

			const response = await request(app).post('/receipts/process').send(receipt);
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('id');
		});

		it('should return 400 for an invalid receipt', async () => {
			const invalidReceipt = {
				retailer: 'Invalid Retailer!',
				purchaseDate: '20220101',
				purchaseTime: '13:01',
				items: [],
				total: '18.74',
			};

			const response = await request(app).post('/receipts/process').send(invalidReceipt);
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('GET /receipts/:id/points', () => {
		it('should return points for a valid receipt ID', async () => {
			const receipt = {
				retailer: 'Target',
				purchaseDate: '2022-01-01',
				purchaseTime: '13:01',
				items: [
					{
						shortDescription: 'Mountain Dew 12PK',
						price: '6.49',
					},
					{
						shortDescription: 'Emils Cheese Pizza',
						price: '12.25',
					},
					{
						shortDescription: 'Knorr Creamy Chicken',
						price: '1.26',
					},
					{
						shortDescription: 'Doritos Nacho Cheese',
						price: '3.35',
					},
					{
						shortDescription: '   Klarbrunn 12-PK 12 FL OZ  ',
						price: '12.00',
					},
				],
				total: '35.35',
			};

			const processResponse = await request(app).post('/receipts/process').send(receipt);
			const id = processResponse.body.id;

			const response = await request(app).get(`/receipts/${id}/points`);
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('points');
			expect(response.body.points).toBe(28); // Validates calculated points for this example
		});

		it('should return 404 for a non-existent receipt ID', async () => {
			const response = await request(app).get('/receipts/nonexistent-id/points');
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('Points Calculation Scenarios', () => {
		it('should calculate points for a round total amount', async () => {
			const receipt = {
				retailer: 'Walmart',
				purchaseDate: '2022-02-15',
				purchaseTime: '14:30',
				items: [
					{ shortDescription: 'Cereal', price: '5.00' },
					{ shortDescription: 'Milk', price: '3.00' },
				],
				total: '8.00',
			};

			const processResponse = await request(app).post('/receipts/process').send(receipt);
			const id = processResponse.body.id;

			const response = await request(app).get(`/receipts/${id}/points`);
			expect(response.status).toBe(200);
			expect(response.body.points).toBe(104); // 50 for round total, 10 for time, 7 for retailer length
		});

		it('should calculate points for an odd purchase day', async () => {
			const receipt = {
				retailer: 'Costco',
				purchaseDate: '2022-01-15',
				purchaseTime: '13:00',
				items: [{ shortDescription: 'Chicken', price: '10.00' }],
				total: '10.00',
			};

			const processResponse = await request(app).post('/receipts/process').send(receipt);
			const id = processResponse.body.id;

			const response = await request(app).get(`/receipts/${id}/points`);
			expect(response.status).toBe(200);
			expect(response.body.points).toBe(87); // 6 for retailer length, 6 for odd day, 50 for round total
		});

		it('should calculate points for a total multiple of 0.25', async () => {
			const receipt = {
				retailer: 'Trader Joes',
				purchaseDate: '2022-04-10',
				purchaseTime: '15:45',
				items: [
					{ shortDescription: 'Bread', price: '1.25' },
					{ shortDescription: 'Butter', price: '2.50' },
				],
				total: '3.75',
			};

			const processResponse = await request(app).post('/receipts/process').send(receipt);
			const id = processResponse.body.id;

			const response = await request(app).get(`/receipts/${id}/points`);
			expect(response.status).toBe(200);
			expect(response.body.points).toBe(10 + 25 + 5 + 1 + 10); // 10 for retailer length, 25 for multiple of 0.25, 5 for amount of items, 1 for butter length, 10 for time of purchase
		});
	});
});
