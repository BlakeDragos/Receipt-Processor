# Receipt Processor

## Overview
This project is a simple receipt processor built with Node.js and Express. It allows users to submit receipts, calculates points based on specific rules, and provides a way to retrieve those points.

## Getting Started

### Prerequisites
- Node.js (version 22 or higher)
- Docker

### Running the Application

**Using Docker**
   ```
   docker build -t receipt-processor .
   docker run -p 3000:3000 receipt-processor
   ```

### API Endpoints

- **POST /receipts/process**: Submits a receipt for processing and returns a unique ID.
example body:
 ```
 {
    "retailer": "Walmart",
    "purchaseDate": "2022-02-15",
    "purchaseTime": "14:30",
    "items": [
        {
            "shortDescription": "Cereal",
            "price": "5.00"
        },
        {
            "shortDescription": "Milk",
            "price": "3.00"
        }
    ],
    "total": "8.00"
}
 ```
- **GET /receipts/{id}/points**: Returns the number of points awarded for the receipt.
example param
```
id: 96d8bc42-ade9-4d62-a363-31bb8f0691ee
```

### Testing
To run unit tests, use the following command:
```sh
npm test