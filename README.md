# E-Commerce Store with Stripe Payments

![E-Commerce Demo](https://img.shields.io/badge/Demo-Available-green) ![License](https://img.shields.io/badge/License-MIT-blue)

A complete e-commerce solution with Stripe payment integration and automated PDF invoice generation.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Features
- 🛍️ Product catalog management
- 🛒 Shopping cart functionality
- 💳 Secure Stripe payment processing
- 📄 Automated PDF invoice generation
- 💾 SQLite database storage

## Technologies
- **Backend**: Python (Flask), SQLite
- **Frontend**: Node.js, Vanilla JavaScript
- **Payment**: Stripe API
- **PDF Generation**: ReportLab

## Setup

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm
- Stripe account (test mode)

### Installation
1. Clone the repository:

git clone git@github.com:SarahBenm/TP_E-commerce.git

2. Set up backend:

- cd backend
- pip install -r requirements.txt

4. set up frontend
   
- cd ../frontend
- npm install

## Configuration

1. start backend server
   
- cd ../backend
- python app.py

3. start frontend server

- cd ../frontend
- node server.js


## Usage:

- Add products to cart

- Click "Payer" button

- Use test card: 4242 4242 4242 4242

- Any future date/CVC

- PDF invoice will download automatically

## projet structure

ecommerce-store/

├── backend/

│   ├── app.py    # Flask server

│   ├── requirements.txt   # Python dependencies

│   └── database.db        # SQLite database

└── frontend/

│   ├── server.js          # Node.js server
    
│   ├── package.json       # Frontend dependencies

│   └── public/
    
│       ├── app.js         # Client-side logic
        
│       └── views/
        
│           └── index.html # Store interface

## Troubleshooting

1. Payment failures:

- Verify Stripe API keys

- Check Flask server logs

- Test in Stripe Dashboard

2. PDF not opening:

- Check browser downloads folder

- Ensure ReportLab is installed

3. 404 Errors:

- Confirm both servers are running

- Check network requests in browser devtools
