document.addEventListener('DOMContentLoaded', async () => {
    const productsDiv = document.getElementById('products');
    const cartDiv = document.getElementById('cart');
    const checkoutButton = document.getElementById('checkout');
    const cardErrors = document.getElementById('card-errors');

    let cart = [];
    const stripe = Stripe('pk_test_51QwSL4Q5tI6bYGNG8aTMPZcJIfz4VaL93JOOR9aWWSG1YegZTQnXU87gVRztKuSp4J8tf3VJFP42kNWUYDkSILOU00ZThCWZDp');
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    // Load products
    let products = [];
    try {
        const response = await fetch('/products');
        if (!response.ok) throw new Error('Failed to load products');
        products = await response.json();
    } catch (error) {
        showError(error.message);
        return;
    }

    // Display products
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
            <p>${product.name} - ${product.price.toFixed(2)} €</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsDiv.appendChild(productDiv);
    });

    // Cart functions
    window.addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);
        existingItem ? existingItem.quantity++ : cart.push({...product, quantity: 1});
        updateCartDisplay();
    };

    function updateCartDisplay() {
        cartDiv.innerHTML = `
            <h3>Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
            ${cart.map(item => `
                <div class="cart-item">
                    <p>${item.name} - ${item.quantity} x ${item.price.toFixed(2)} €</p>
                </div>
            `).join('')}
            <p><strong>Total: ${calculateTotal().toFixed(2)} €</strong></p>
        `;
    }

    function calculateTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Payment handler
    checkoutButton.addEventListener('click', async () => {
        try {
            cardErrors.textContent = '';
            const totalAmount = calculateTotal();
            
            const paymentResponse = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ amount: totalAmount })
            });

            if (!paymentResponse.ok) throw new Error('Payment initialization failed');
            const { clientSecret } = await paymentResponse.json();

            const { error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement }
            });
            if (error) throw error;

            const invoiceResponse = await fetch('/generate-invoice', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_name: "Client Name",
                    items: cart.map(item => ({
                        description: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                })
            });
            if (!invoiceResponse.ok) throw new Error('Invoice generation failed');

            const pdfBlob = await invoiceResponse.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'invoice.pdf';
            link.click();

            cart = [];
            updateCartDisplay();
            alert('Payment successful! Invoice downloaded.');

        } catch (error) {
            cardErrors.textContent = error.message;
            console.error('Error:', error);
        }
    });

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
});