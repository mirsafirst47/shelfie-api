// API base URL
const API_BASE = 'http://localhost:3000';

// Current view state
let currentView = 'products';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCustomers();
});

// Show purchase update notification
function showPurchaseUpdate() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">🎉 New Purchase Added!</div>
        <div style="font-size: 14px; opacity: 0.9;">Your recent checkout has been synced to ShelFie</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Show new customer notification
function showNewCustomerUpdate(customerId) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">🆕 New Customer Joined!</div>
        <div style="font-size: 14px; opacity: 0.9;">Customer ${customerId} now using ShelFie</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Update loadCustomerPurchases to show notification for new purchases
let lastPurchaseCount = 0;
let lastCustomerCount = 0;
let knownCustomers = new Set();

// Modify the displayPurchases function to track new purchases
const originalDisplayPurchases = displayPurchases;
displayPurchases = function(purchases) {
    const currentCount = purchases.length;
    
    if (lastPurchaseCount > 0 && currentCount > lastPurchaseCount) {
        showPurchaseUpdate();
    }
    
    lastPurchaseCount = currentCount;
    originalDisplayPurchases.call(this, purchases);
};

// Show different views
function showView(view) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Show selected view
    document.getElementById(`${view}-view`).classList.add('active');
    
    currentView = view;
    
    // Load data for the view
    if (view === 'products') {
        loadProducts();
    } else if (view === 'purchases') {
        loadCustomerPurchases();
    }
}

// Load products from API
async function loadProducts() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data);
        } else {
            showError('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to connect to API');
    }
    
    showLoading(false);
}

// Display products in the grid
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p>No products found. Make sure your API is running!</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const expiryDate = new Date(product.expiration_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let expiryClass = 'expiry-fresh';
        let expiryText = `${daysUntilExpiry} days left`;
        
        if (daysUntilExpiry < 0) {
            expiryClass = 'expiry-expired';
            expiryText = `Expired ${Math.abs(daysUntilExpiry)} days ago`;
        } else if (daysUntilExpiry <= 3) {
            expiryClass = 'expiry-soon';
            expiryText = daysUntilExpiry === 0 ? 'Expires today' : `${daysUntilExpiry} days left`;
        }
        
        return `
            <div class="product-card">
                <div class="product-header">
                    <span class="product-icon">${getProductIcon(product.product_name)}</span>
                    <span class="product-name">${product.product_name}</span>
                </div>
                <div class="product-details">
                    <div class="product-detail">
                        <strong>SKU:</strong>
                        <span>${product.sku}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Manufacturer:</strong>
                        <span>${product.manufacturer}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Batch:</strong>
                        <span>${product.batch_number}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Expires:</strong>
                        <span>${formatDate(product.expiration_date)}</span>
                    </div>
                </div>
                <div class="expiry-badge ${expiryClass}">
                    ${expiryText}
                </div>
            </div>
        `;
    }).join('');
}

// Load customer purchases
async function loadCustomerPurchases() {
    const customerId = document.getElementById('customer-select').value;
    showLoading(true);
    
    try {
        if (customerId === 'ALL') {
            // Show all customers and their purchase counts
            const customersResponse = await fetch(`${API_BASE}/api/customers`);
            const customersData = await customersResponse.json();
            
            if (customersData.success) {
                displayAllCustomers(customersData.data);
            } else {
                showError('Failed to load customers');
            }
        } else {
            // Show specific customer purchases
            const response = await fetch(`${API_BASE}/api/customers/${customerId}/purchases`);
            const data = await response.json();
            
            if (data.success) {
                displayPurchases(data.data);
            } else {
                showError('Failed to load purchases');
            }
        }
    } catch (error) {
        console.error('Error loading purchases:', error);
        showError('Failed to connect to API');
    }
    
    showLoading(false);
}

// Display purchases in the grid
function displayPurchases(purchases) {
    const grid = document.getElementById('purchases-grid');
    
    if (purchases.length === 0) {
        grid.innerHTML = '<p>No purchases found for this customer.</p>';
        return;
    }
    
    grid.innerHTML = purchases.map(purchase => {
        const expiryDate = new Date(purchase.expiration_date);
        const purchaseDate = new Date(purchase.purchase_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let expiryClass = 'expiry-fresh';
        let expiryText = `${daysUntilExpiry} days left`;
        
        if (daysUntilExpiry < 0) {
            expiryClass = 'expiry-expired';
            expiryText = `Expired ${Math.abs(daysUntilExpiry)} days ago`;
        } else if (daysUntilExpiry <= 3) {
            expiryClass = 'expiry-soon';
            expiryText = daysUntilExpiry === 0 ? 'Expires today' : `${daysUntilExpiry} days left`;
        }
        
        return `
            <div class="purchase-card">
                <div class="product-header">
                    <span class="product-icon">${getProductIcon(purchase.product_name)}</span>
                    <span class="product-name">${purchase.product_name}</span>
                </div>
                <div class="product-details">
                    <div class="product-detail">
                        <strong>Purchased:</strong>
                        <span>${formatDate(purchase.purchase_date)}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Store:</strong>
                        <span>${purchase.store_name}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Batch:</strong>
                        <span>${purchase.batch_number}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Quantity:</strong>
                        <span>${purchase.quantity}</span>
                    </div>
                </div>
                <div class="expiry-badge ${expiryClass}">
                    ${expiryText}
                </div>
            </div>
        `;
    }).join('');
}

// Display all customers overview
function displayAllCustomers(customers) {
    const grid = document.getElementById('purchases-grid');
    
    if (customers.length === 0) {
        grid.innerHTML = '<p>No customers found.</p>';
        return;
    }
    
    grid.innerHTML = customers.map(customer => {
        const isNewCustomer = customer.customer_id.startsWith('CUST-') && customer.customer_id.length > 8;
        const customerType = isNewCustomer ? '🆕 New Customer' : '👤 Existing Customer';
        
        return `
            <div class="purchase-card" onclick="selectCustomer('${customer.customer_id}')">
                <div class="product-header">
                    <span class="product-icon">${isNewCustomer ? '🆕' : '👤'}</span>
                    <span class="product-name">${customer.customer_id}</span>
                </div>
                <div class="product-details">
                    <div class="product-detail">
                        <strong>Type:</strong>
                        <span>${customerType}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Phone:</strong>
                        <span>${customer.phone_number || 'Not provided'}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Email:</strong>
                        <span>${customer.email || 'Not provided'}</span>
                    </div>
                    <div class="product-detail">
                        <strong>Purchases:</strong>
                        <span>${customer.purchase_count} items</span>
                    </div>
                    <div class="product-detail">
                        <strong>Created:</strong>
                        <span>${formatDate(customer.created_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Select specific customer from overview
function selectCustomer(customerId) {
    const select = document.getElementById('customer-select');
    
    // Check if customer exists in dropdown, if not add them
    let optionExists = false;
    for (let option of select.options) {
        if (option.value === customerId) {
            optionExists = true;
            break;
        }
    }
    
    if (!optionExists) {
        const option = document.createElement('option');
        option.value = customerId;
        option.textContent = customerId;
        select.appendChild(option);
    }
    
    select.value = customerId;
    loadCustomerPurchases();
}

// Test API endpoints
async function testEndpoint(endpoint) {
    const responseContent = document.getElementById('response-content');
    responseContent.textContent = 'Loading...';
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json();
        
        responseContent.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        responseContent.textContent = `Error: ${error.message}`;
    }
}

// Utility functions
function getProductIcon(productName) {
    const name = productName.toLowerCase();
    if (name.includes('milk')) return '🥛';
    if (name.includes('lettuce') || name.includes('salad')) return '🥬';
    if (name.includes('dressing')) return '🥗';
    if (name.includes('bread')) return '🍞';
    if (name.includes('yogurt')) return '🧀';
    if (name.includes('carrot')) return '🥕';
    if (name.includes('strawberr')) return '🍇';
    return '📦';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

function showError(message) {
    console.error(message);
    // You could add a proper error display here
}

// Auto-refresh purchases every 10 seconds when on purchases view
let refreshInterval;

function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        if (currentView === 'purchases') {
            loadCustomers(); // This will now refresh the dropdown
            loadCustomerPurchases();
        }
    }, 10000); // Refresh every 10 seconds
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

// Update the showView function to handle auto-refresh
const originalShowView = showView;
showView = function(view) {
    originalShowView.call(this, view);
    
    if (view === 'purchases') {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
};

// Start auto-refresh when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCustomers(); // Load initial customer list
    startAutoRefresh();
});

// Load customers for dropdown - NOW WITH NEW CUSTOMER DETECTION
async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE}/api/customers`);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('customer-select');
            const currentValue = select.value;
            
            // Track new customers for notifications
            const currentCustomers = new Set(data.data.map(c => c.customer_id));
            const newCustomers = [...currentCustomers].filter(id => !knownCustomers.has(id));
            
            // Show notifications for truly new customers (not initial load)
            if (knownCustomers.size > 0) {
                newCustomers.forEach(customerId => {
                    if (customerId.length > 8) { // Only show for dynamically created customers
                        showNewCustomerUpdate(customerId);
                    }
                });
            }
            
            // Update known customers set
            knownCustomers = currentCustomers;
            
            // Start with Show All at top and original customers
            select.innerHTML = `
                <option value="ALL">🔍 Show All Customers</option>
                <option value="CUST-001">Customer 001</option>
                <option value="CUST-002">Customer 002</option>
            `;
            
            // Sort customers to put new ones at the end
            const otherCustomers = data.data
                .filter(customer => !customer.customer_id.match(/^CUST-00[12]$/))
                .sort((a, b) => {
                    // Sort by creation date, newest at the end
                    return new Date(a.created_at) - new Date(b.created_at);
                });
            
            // Add other customers in chronological order (oldest first, newest last)
            otherCustomers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.customer_id;
                const isNew = customer.customer_id.length > 8;
                option.textContent = `${customer.customer_id}${isNew ? ' 🆕 (New)' : ''}`;
                select.appendChild(option);
            });
            
            // Restore selection if it still exists
            if (currentValue) {
                select.value = currentValue;
            }
            
            // Update customer count for tracking
            lastCustomerCount = data.data.length;
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}