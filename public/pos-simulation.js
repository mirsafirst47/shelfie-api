// POS Simulation State
let cart = [];
let currentCustomer = 'CUST-001';
let subtotal = 0;
let tax = 0;
let total = 0;

// Sample product database (matching your API data)
const products = {
    'SKU-789456123': {
        sku: 'SKU-789456123',
        name: 'Organic Whole Milk',
        manufacturer: 'Great Value',
        price: 3.98,
        batch: 'B2025028',
        expiry: '2025-08-25',
        status: 'fresh'
    },
    'SKU-998877665': {
        sku: 'SKU-998877665',
        name: 'Caesar Salad Dressing',
        manufacturer: 'Wish-Bone',
        price: 2.49,
        batch: 'B2025015',
        expiry: '2025-08-05',
        status: 'expiring'
    },
    'SKU-445789012': {
        sku: 'SKU-445789012',
        name: 'Dole Romaine Lettuce',
        manufacturer: 'Dole Fresh Vegetables',
        price: 2.99,
        batch: 'B2025034',
        expiry: '2025-07-25',
        status: 'recalled'
    },
    'SKU-987654321': {
        sku: 'SKU-987654321',
        name: 'Canned Tomatoes',
        manufacturer: 'Hunts',
        price: 1.89,
        batch: 'B2025051',
        expiry: '2026-02-15',
        status: 'fresh'
    }
};

// Initialize POS system
document.addEventListener('DOMContentLoaded', function() {
    updateCustomer();
    updateShelFieActions('POS System Ready - Scan products to begin checkout');
});

// Scan product function
function scanProduct(sku) {
    const product = products[sku];
    if (!product) {
        showAlert('error', 'Product Not Found', 'This product is not in the ShelFie database.');
        return;
    }

    // Add scanning animation
    animateScanning(product);

    // Add to cart after animation
    setTimeout(() => {
        addToCart(product);
        updateShelFieActions(`✅ Captured expiration data for ${product.name}`);
        
        // Show special alerts for problem products
        if (product.status === 'recalled') {
            showAlert('error', '🚨 RECALLED PRODUCT', `${product.name} is under FDA recall. Do not sell!`);
            updateShelFieActions(`🚨 RECALL ALERT: Product ${product.sku} flagged for removal`);
        } else if (product.status === 'expiring') {
            showAlert('warning', '⏰ Expiring Soon', `${product.name} expires in 3 days. Consider discount.`);
            updateShelFieActions(`⏰ Expiration alert sent to customer app`);
        } else {
            updateShelFieActions(`📱 Product data synced to customer's ShelFie app`);
        }
    }, 1500);
}

// Add scanning animation
function animateScanning(product) {
    const scannerArea = document.querySelector('.scanner-animation');
    const originalContent = scannerArea.innerHTML;
    
    scannerArea.innerHTML = `
        <div class="laser-line"></div>
        <div style="color: #10b981; font-family: 'Courier New', monospace;">
            <p>🔍 SCANNING...</p>
            <p style="font-size: 14px; margin-top: 10px;">${product.name}</p>
            <p style="font-size: 12px;">SKU: ${product.sku}</p>
        </div>
    `;
    
    // Play scanning sound effect (visual feedback)
    scannerArea.style.background = '#1a5f3f';
    
    setTimeout(() => {
        scannerArea.innerHTML = `
            <div class="laser-line"></div>
            <div style="color: #10b981; font-family: 'Courier New', monospace;">
                <p>✅ SCAN COMPLETE</p>
                <p style="font-size: 14px; margin-top: 10px;">${product.name}</p>
                <p style="font-size: 12px;">Added to cart • ShelFie data captured</p>
            </div>
        `;
        scannerArea.style.background = '#059669';
    }, 800);
    
    setTimeout(() => {
        scannerArea.innerHTML = originalContent;
        scannerArea.style.background = '#000';
    }, 2000);
}

// Add product to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.sku === product.sku);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    updateCheckoutButton();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Cart is empty - scan products to add them</p>';
        updateTotals();
        return;
    }
    
    cartItems.innerHTML = cart.map(item => {
        const statusClass = item.status === 'expiring' ? 'expiring' : 
                           item.status === 'recalled' ? 'expired' : '';
        
        const statusIcon = item.status === 'recalled' ? '🚨' :
                          item.status === 'expiring' ? '⏰' : '✅';
        
        return `
            <div class="cart-item ${statusClass}">
                <div class="item-info">
                    <div class="item-name">${statusIcon} ${item.name}</div>
                    <div class="item-details">
                        ${item.manufacturer} • Batch: ${item.batch} • Qty: ${item.quantity}
                        <br>Expires: ${formatDate(item.expiry)}
                    </div>
                </div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    }).join('');
    
    updateTotals();
}

// Update totals
function updateTotals() {
    subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    tax = subtotal * 0.0825; // 8.25% tax
    total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Update checkout button state
function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const hasRecalledItems = cart.some(item => item.status === 'recalled');
    
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '💳 Process Payment & Complete Order';
    } else if (hasRecalledItems) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '🚨 Cannot Process - Remove Recalled Items';
        checkoutBtn.style.background = '#ef4444';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '💳 Process Payment & Complete Order';
        checkoutBtn.style.background = '#10b981';
    }
}

// Update customer selection
function updateCustomer() {
    const select = document.getElementById('customer-select');
    const status = document.getElementById('customer-status');
    currentCustomer = select.value;
    
    if (currentCustomer === 'CUST-NEW') {
        status.innerHTML = '<span style="color: #6b7280;">📱 No app detected - Manual receipt only</span>';
        updateShelFieActions('Customer has no ShelFie app - expiration data not captured');
    } else {
        status.innerHTML = '<span class="app-indicator">📱 ShelFie App Detected</span>';
        updateShelFieActions('Customer app connected - ready to sync expiration data');
    }
}

// Process checkout
async function processCheckout() {
    if (cart.length === 0) return;
    
    // Show processing animation
    const checkoutBtn = document.getElementById('checkout-btn');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '⏳ Processing Payment...';
    checkoutBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(async () => {
        try {
            // If customer has app, process real checkout
            if (currentCustomer !== 'CUST-NEW') {
                updateShelFieActions('💫 Processing checkout transaction...');
                
                // Prepare checkout data
                const checkoutData = {
                    customer_id: currentCustomer,
                    customer_info: newCustomerData, // Include new customer data if exists
                    store_name: 'Walmart Supercenter',
                    items: cart.map(item => ({
                        sku: item.sku,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total_amount: total
                };
                
                // Process checkout via API
                const API_BASE = window.location.origin;
                const response = await fetch(`${API_BASE}/api/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(checkoutData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    updateShelFieActions('✅ Checkout successful - All products synced to customer app!');
                    updateShelFieActions('📱 Customer can now view purchases in ShelFie app');
                } else {
                    throw new Error('Checkout API failed');
                }
            } else {
                updateShelFieActions('📄 Cash transaction completed - No app sync available');
            }
            
            // Show success modal
            showCheckoutSuccess();
            
        } catch (error) {
            console.error('Checkout error:', error);
            updateShelFieActions('❌ Checkout failed - Using offline mode');
            showCheckoutSuccess(); // Still show success for demo
        }
        
        // Reset button
        checkoutBtn.innerHTML = originalText;
        checkoutBtn.disabled = false;
    }, 2000);
}

// Show checkout success modal
function showCheckoutSuccess() {
    const modal = document.getElementById('success-modal');
    const summary = document.getElementById('checkout-summary');
    
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const expiringCount = cart.filter(item => item.status === 'expiring').length;
    const freshCount = cart.filter(item => item.status === 'fresh').length;
    
    summary.innerHTML = `
        <div style="text-align: left; background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-bottom: 15px; color: #1f2937;">Transaction Summary</h3>
            <div style="margin-bottom: 10px;"><strong>Items Purchased:</strong> ${itemCount}</div>
            <div style="margin-bottom: 10px;"><strong>Total Amount:</strong> $${total.toFixed(2)}</div>
            <div style="margin-bottom: 10px;"><strong>Customer:</strong> ${currentCustomer}</div>
            <div style="margin-bottom: 15px;"><strong>Store:</strong> Walmart Supercenter</div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <h4 style="color: #3b82f6; margin-bottom: 10px;">✨ ShelFie Magic Applied:</h4>
                <div style="font-size: 14px; color: #374151;">
                    ${currentCustomer !== 'CUST-NEW' ? `
                        ✅ ${itemCount} products automatically synced to customer app<br>
                        ${expiringCount > 0 ? `⏰ ${expiringCount} expiration alerts scheduled<br>` : ''}
                        📱 Customer will receive notifications before food expires<br>
                        🛡️ Precision recall alerts enabled for all purchased items
                    ` : `
                        📄 Printed receipt only - customer not using ShelFie app<br>
                        💡 Customer missing out on automatic expiration tracking
                    `}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Clear cart
function clearCart() {
    cart = [];
    updateCartDisplay();
    updateCheckoutButton();
    updateShelFieActions('Cart cleared - ready for next customer');
}

// Close modal
function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
    clearCart();
}

// View customer app (redirect to main demo)
function viewCustomerApp() {
    window.open('/?customer=' + currentCustomer, '_blank');
    closeModal();
}

// Update ShelFie actions display
function updateShelFieActions(message) {
    const actionsDiv = document.getElementById('shelfie-actions');
    const timestamp = new Date().toLocaleTimeString();
    
    const newAction = document.createElement('div');
    newAction.className = 'magic-item';
    newAction.innerHTML = `
        <span style="color: #3b82f6;">⚡</span>
        <span>${message}</span>
        <span style="margin-left: auto; font-size: 12px; color: #6b7280;">${timestamp}</span>
    `;
    
    // Add to top
    if (actionsDiv.querySelector('.magic-item')) {
        actionsDiv.insertBefore(newAction, actionsDiv.firstChild);
    } else {
        actionsDiv.innerHTML = '';
        actionsDiv.appendChild(newAction);
    }
    
    // Keep only last 4 actions
    const actions = actionsDiv.querySelectorAll('.magic-item');
    if (actions.length > 4) {
        actions[actions.length - 1].remove();
    }
}

// Show alert notification
function showAlert(type, title, message) {
    const alertArea = document.getElementById('alert-area');
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = `
        <h4>${title}</h4>
        <p>${message}</p>
    `;
    
    alertArea.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Expired ${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
        return 'Expires today';
    } else if (diffDays === 1) {
        return 'Expires tomorrow';
    } else {
        return `Expires in ${diffDays} days`;
    }
}

// Add some demo data loading animation on page load
window.addEventListener('load', function() {
    setTimeout(() => {
        updateShelFieActions('🔗 Connected to ShelFie API - Product database loaded');
    }, 500);
    
    setTimeout(() => {
        updateShelFieActions('📡 POS integration active - Ready to capture expiration data');
    }, 1000);
});

// New customer creation variables
let isCreatingNewCustomer = false;
let newCustomerData = null;

// Update customer selection function
function updateCustomer() {
    const select = document.getElementById('customer-select');
    const status = document.getElementById('customer-status');
    const newCustomerForm = document.getElementById('new-customer-form');
    currentCustomer = select.value;
    
    if (currentCustomer === 'CUST-NEW') {
        status.innerHTML = '<span style="color: #6b7280;">📱 No app detected - Manual receipt only</span>';
        updateShelFieActions('Customer has no ShelFie app - expiration data not captured');
        newCustomerForm.classList.add('hidden');
        isCreatingNewCustomer = false;
    } else if (currentCustomer === 'CREATE-NEW') {
        status.innerHTML = '<span style="color: #3b82f6;">🆕 Creating new ShelFie customer...</span>';
        updateShelFieActions('Ready to create new ShelFie customer account');
        newCustomerForm.classList.remove('hidden');
        isCreatingNewCustomer = true;
    } else {
        status.innerHTML = '<span class="app-indicator">📱 ShelFie App Detected</span>';
        updateShelFieActions('Customer app connected - ready to sync expiration data');
        newCustomerForm.classList.add('hidden');
        isCreatingNewCustomer = false;
    }
}

// Create new customer
function createNewCustomer() {
    const phone = document.getElementById('customer-phone').value;
    const email = document.getElementById('customer-email').value;
    
    // Generate new customer ID
    const timestamp = Date.now();
    const newCustomerId = `CUST-${timestamp.toString().slice(-6)}`;
    
    // Store new customer data
    newCustomerData = {
        customer_id: newCustomerId,
        phone_number: phone || null,
        email: email || null,
        is_new: true
    };
    
    currentCustomer = newCustomerId;
    
    // Update UI
    const status = document.getElementById('customer-status');
    status.innerHTML = '<span style="color: #10b981;">✅ New ShelFie customer created!</span>';
    
    // Hide form
    document.getElementById('new-customer-form').classList.add('hidden');
    
    // Reset dropdown to show the new customer
    const select = document.getElementById('customer-select');
    select.innerHTML += `<option value="${newCustomerId}" selected>🆕 ${newCustomerId} (New Customer)</option>`;
    select.value = newCustomerId;
    
    updateShelFieActions(`✅ Created new customer ${newCustomerId} with ShelFie app`);
    showAlert('success', '🎉 Customer Created!', `New ShelFie customer ${newCustomerId} ready for checkout`);
    
    isCreatingNewCustomer = false;
}

// Cancel new customer creation
function cancelNewCustomer() {
    document.getElementById('new-customer-form').classList.add('hidden');
    document.getElementById('customer-select').value = 'CUST-001';
    updateCustomer();
}