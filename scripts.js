// Utility functions for cookies
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${(value || '')}${expires}; path=/`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999;`;
}

// Save data to cookies
function saveDataToCookies() {
    setCookie('cart', JSON.stringify(cart), 7); // Save cart for 7 days
    setCookie('totalSold', totalSold, 7); // Save totalSold for 7 days
    setCookie('productSales', JSON.stringify(productSales), 7); // Save productSales for 7 days
}

// Load data from cookies
function loadDataFromCookies() {
    cart = JSON.parse(getCookie('cart')) || [];
    totalSold = parseInt(getCookie('totalSold')) || 0;
    productSales = JSON.parse(getCookie('productSales')) || {};
    updateCart();
}

// Add/Remove Product Functions
function addToCart(product, price) {
    console.log(`Adding to cart: ${product} at $${price}`);
    const cartItem = cart.find(item => item.product === product);
    if (cartItem) {
        console.log(`Updating existing item: ${product}`);
        cartItem.quantity += 1;
        cartItem.totalPrice += price;
    } else {
        console.log(`Adding new item: ${product}`);
        cart.push({ product, price, quantity: 1, totalPrice: price });
    }
    totalSold++;
    if (!productSales[product]) {
        productSales[product] = { product, quantity: 0, price: price };
    }
    productSales[product].quantity++;
    console.log('Cart:', cart);
    console.log('Product Sales:', productSales);
    updateCart();
    saveDataToCookies(); // Save to cookies
}

function addCustomToCart() {
    const grams = parseInt(document.getElementById('custom-grams').value);
    if (isNaN(grams) || grams <= 0) {
        alert('Please enter a valid number of grams');
        return;
    }
    const price = (grams / 100) * 80;
    const product = 'Candy';

    const cartItem = cart.find(item => item.product === product);
    if (cartItem) {
        cartItem.grams += grams;
        cartItem.totalPrice += price;
    } else {
        cart.push({ product, price, grams, quantity: 1, totalPrice: price });
    }

    totalSold++;
    if (!productSales[product]) {
        productSales[product] = { product, quantity: 0, grams: 0, price: price };
    }
    productSales[product].quantity += grams;
    updateCart();
    saveDataToCookies(); // Save to cookies

    document.getElementById('custom-grams').value = '';
}

function removeFromCart(productName) {
    const cartIndex = cart.findIndex(item => item.product === productName);
    if (cartIndex > -1) {
        const item = cart[cartIndex];
        if (item.quantity > 1) {
            item.quantity--;
            item.totalPrice -= item.price;
        } else {
            cart.splice(cartIndex, 1);
        }
        totalSold--;

        if (item.product === 'Candy') {
            productSales[item.product].quantity -= item.grams;
        } else {
            productSales[item.product].quantity--;
        }

        if (productSales[item.product].quantity <= 0) {
            delete productSales[item.product];
        }

        updateCart();
        saveDataToCookies(); // Save to cookies
    } else {
        console.warn(`Item "${productName}" not found in cart.`);
    }
}

function addManualProduct() {
    const productName = document.getElementById('manual-product-name').value;
    const productPrice = parseFloat(document.getElementById('manual-product-price').value);

    if (!productName || isNaN(productPrice) || productPrice <= 0) {
        alert('Please enter a valid product name and price');
        return;
    }

    const cartItem = cart.find(item => item.product === productName);
    if (cartItem) {
        cartItem.quantity += 1;
        cartItem.totalPrice += productPrice;
    } else {
        cart.push({ product: productName, price: productPrice, quantity: 1, totalPrice: productPrice });
    }

    totalSold++;
    if (!productSales[productName]) {
        productSales[productName] = { product: productName, quantity: 0, price: productPrice };
    }
    productSales[productName].quantity++;
    updateCart();
    saveDataToCookies(); // Save to cookies

    document.getElementById('manual-product-name').value = '';
    document.getElementById('manual-product-price').value = '';
}

function updateCart() {
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';
    let totalPrice = 0;
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-product', item.product);
        const displayPrice = item.product === 'Candy' ? `$${item.totalPrice.toFixed(2)} (${item.grams}g)` : `$${item.totalPrice.toFixed(2)}`;
        cartItem.innerHTML = `
            <span>${item.product} (${item.quantity})</span>
            <span>${displayPrice}</span>
            <button onclick="removeFromCart('${item.product}')">Remove</button>
        `;
        cartList.appendChild(cartItem);
        totalPrice += item.totalPrice;
    });
    document.getElementById('total-price').innerText = `$${totalPrice.toFixed(2)}`;
    document.getElementById('total-products-sold').innerText = totalSold;
    updateProductSales();
}

function updateProductSales() {
    const soldPerProduct = document.getElementById('sold-per-product');
    soldPerProduct.innerHTML = '';
    Object.keys(productSales).forEach(product => {
        const productSale = document.createElement('div');
        productSale.className = 'product-sale';
        const displayQuantity = product === 'Candy' ? `${productSales[product].quantity}g` : productSales[product].quantity;
        productSale.innerHTML = `<span>${product}:</span><span>${displayQuantity}</span>`;
        soldPerProduct.appendChild(productSale);
    });
}

function checkout() {
    cart = [];
    totalSold = 0;
    updateCart();
    saveDataToCookies(); // Save to cookies
}

function resetData() {
    const enteredPassword = prompt('Enter password to reset data:');
    const correctPassword = 'tuckshop';

    if (enteredPassword === correctPassword) {
        eraseCookie('cart');
        eraseCookie('totalSold');
        eraseCookie('productSales');

        cart = [];
        totalSold = 0;
        productSales = {};
        updateCart();
        alert('Data has been reset successfully!');
        location.reload();
    } else {
        alert('Incorrect password. Data reset failed.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadDataFromCookies(); // Load data from cookies
});
function exportSalesData() {
    const userName = document.getElementById('user-name').value;
    const date = document.getElementById('date').value;
    if (!userName || !date) {
        alert('Please enter your name and the date');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws_data = [["User Name", "Date", "Product", "Quantity", "Unit Price", "Total Price"]];
    let totalWater = 0;
    let totalCandy = 0;
    let totalOtherProducts = 0;
    let totalPrice = 0;

    Object.keys(productSales).forEach(product => {
        const quantity = productSales[product].quantity;
        const unitPrice = product === 'Candy' ? 0.8 : productSales[product].price; // Fixed unit price for Candy
        const totalProductPrice = product === 'Candy' ? quantity * 0.8 : quantity * unitPrice; // Total price for Candy using fixed unit price

        ws_data.push([userName, date, product, product === 'Candy' ? `${quantity}g` : quantity, unitPrice.toFixed(2), totalProductPrice.toFixed(2)]);

        if (product === 'Water') {
            totalWater += totalProductPrice;
        } else if (product === 'Candy') {
            totalCandy += totalProductPrice;
        } else {
            totalOtherProducts += totalProductPrice;
        }

        totalPrice += totalProductPrice;
    });

    ws_data.push([]);
    ws_data.push(["", "", "Total Water Sales", "", "", totalWater.toFixed(2)]);
    ws_data.push(["", "", "Total Candy Sales", "", "", totalCandy.toFixed(2)]);
    ws_data.push(["", "", "Total Other Product Sales", "", "", totalOtherProducts.toFixed(2)]);
    ws_data.push(["", "", "Total Sales", "", "", totalPrice.toFixed(2)]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Sales Data");

    XLSX.writeFile(wb, "sales_data.xlsx");
}
