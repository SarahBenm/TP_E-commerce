from flask import Flask, request, jsonify, send_file
import sqlite3
import stripe
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from flask_cors import CORS
from io import BytesIO

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
stripe.api_key = "sk_test_51QwSL4Q5tI6bYGNGQszxXQLvEydfuBVQZF4NQCrSPL05NCp5qzZvYTuYWYN5g1jYJCu6vVTFfrR49D0dc0VPmCzl00gUwTvk6b"

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def add_sample_products():
    conn = get_db_connection()
    conn.execute('DELETE FROM products')
    conn.execute('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', 
                ('Product 1', 10.0, 100))
    conn.execute('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', 
                ('Product 2', 20.0, 50))
    conn.commit()
    conn.close()

@app.route('/products', methods=['GET'])
def list_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    return jsonify([dict(product) for product in products])

@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    data = request.json
    try:
        amount = int(float(data['amount']) * 100)
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='eur',
        )
        return jsonify({'clientSecret': payment_intent.client_secret})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-invoice', methods=['POST'])
def generate_invoice():
    try:
        data = request.json
        buffer = BytesIO()
        
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        c.setTitle("Facture")
        c.setAuthor("Votre Boutique")

        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, height - 50, "Facture")
        c.line(100, height - 55, 300, height - 55)

        c.setFont("Helvetica", 12)
        c.drawString(100, height - 100, f"Client: {data['client_name']}")
        c.drawString(100, height - 120, f"Date: {datetime.datetime.now().strftime('%Y-%m-%d')}")

        y_position = height - 160
        c.setFont("Helvetica-Bold", 12)
        c.drawString(100, y_position, "Article")
        c.drawString(300, y_position, "Quantité")
        c.drawString(400, y_position, "Prix Unitaire")
        c.drawString(500, y_position, "Total")

        y_position -= 30
        total = 0
        for item in data['items']:
            c.drawString(100, y_position, item['description'])
            c.drawString(300, y_position, str(item['quantity']))
            c.drawString(400, y_position, f"{item['price']:.2f} €")
            item_total = item['price'] * item['quantity']
            c.drawString(500, y_position, f"{item_total:.2f} €")
            total += item_total
            y_position -= 20

        c.setFont("Helvetica-Bold", 14)
        c.drawString(400, y_position - 40, "Total:")
        c.drawString(500, y_position - 40, f"{total:.2f} €")

        c.save()
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='facture.pdf'
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    add_sample_products()
    app.run(port=5000, debug=True)