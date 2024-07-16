let cart = JSON.parse(localStorage.getItem('cart')) || [];
let totalSold = parseInt(localStorage.getItem('totalSold')) || 0;
let productSales = JSON.parse(localStorage.getItem('productSales')) || {};

function addToCart(product, price) {
    cart.push({ product, price });
    totalSold++;
    if (!productSales[product]) {
        productSales[product] = { quantity: 0, price: price };
    }
    productSales[product].quantity++;
    updateCart();
    saveDataToLocalStorage();
}

function addCustomToCart() {
    const grams = parseInt(document.getElementById('custom-grams').value);
    if (isNaN(grams) || grams <= 0) {
        alert('Please enter a valid number of grams');
        return;
    }
    const price = (grams / 100) * 80;
    const product = 'Candy';
    cart.push({ product, price, grams });
    totalSold++;
    if (!productSales[product]) {
        productSales[product] = { quantity: 0, grams: 0, price: price };
    }
    productSales[product].quantity += grams;
    updateCart();
    saveDataToLocalStorage();

    document.getElementById('custom-grams').value = '';
}

function removeFromCart(productName) {
    const cartIndex = cart.findIndex(item => item.product === productName);
    if (cartIndex > -1) {
        const item = cart[cartIndex];
        cart.splice(cartIndex, 1);
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
        saveDataToLocalStorage();
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
    
    cart.push({ product: productName, price: productPrice });
    totalSold++;
    if (!productSales[productName]) {
        productSales[productName] = { quantity: 0, price: productPrice };
    }
    productSales[productName].quantity++;
    updateCart();
    saveDataToLocalStorage();

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
        const displayPrice = item.product === 'Candy' ? `$${item.price.toFixed(2)} (${item.grams}g)` : `$${item.price.toFixed(2)}`;
        cartItem.innerHTML = `
            <span>${item.product}</span>
            <span>${displayPrice}</span>
            <button onclick="removeFromCart('${item.product}')">Remove</button>
        `;
        cartList.appendChild(cartItem);
        totalPrice += item.price;
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
    saveDataToLocalStorage();
}

function resetData() {
    const enteredPassword = prompt('Enter password to reset data:');
    const correctPassword = 'tuckshop';

    if (enteredPassword === correctPassword) {
        try {
            localStorage.removeItem('cart');
            localStorage.removeItem('totalSold');
            localStorage.removeItem('productSales');
            localStorage.removeItem('userData');
            alert('Data has been reset successfully.');
            location.reload();
        } catch (error) {
            console.error('Error resetting data:', error);
            alert('An error occurred while resetting data.');
        }
    } else {
        alert('Incorrect password. Reset action aborted.');
    }
}

function saveDataToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('totalSold', totalSold.toString());
    localStorage.setItem('productSales', JSON.stringify(productSales));
}

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

// Initial render
updateCart();
