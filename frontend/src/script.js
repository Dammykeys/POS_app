/**
 * OmniPOS - Main Frontend Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const appContainer = document.querySelector('.app-container');

    // Check Auth Status
    const token = localStorage.getItem('omnipos_token');
    if (token) {
        showApp();
    }

    // Login Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('omnipos_token', data.access_token);
                localStorage.setItem('omnipos_user', JSON.stringify(data.user));
                showApp();
            } else {
                loginError.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'Connection failed. Please check backend.';
            loginError.style.display = 'block';
        }
    });

    function showApp() {
        loginOverlay.style.display = 'none';
        appContainer.style.display = 'grid';
        const user = JSON.parse(localStorage.getItem('omnipos_user') || '{}');
        currentUserSpan.textContent = user.username || 'Administrator';
        renderDashboard();
    }

    // Logout Handler
    document.querySelector('.user-profile .nav-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('omnipos_token');
        localStorage.removeItem('omnipos_user');
        window.location.reload();
    });

    // View Renderers
    async function renderDashboard() {
        viewContainer.innerHTML = `
            <div class="stats-grid">
                <div class="card">
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Daily Sales</p>
                    <h2 id="total-sales-amount" style="margin: var(--spacing-sm) 0;">$0.00</h2>
                    <span style="color: var(--success); font-size: 0.875rem;"><i class='bx bx-trending-up'></i> Today</span>
                </div>
                <div class="card">
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Total Orders</p>
                    <h2 id="total-orders-count" style="margin: var(--spacing-sm) 0;">0</h2>
                    <span style="color: var(--success); font-size: 0.875rem;"><i class='bx bx-trending-up'></i> Total</span>
                </div>
                <div class="card">
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Active Users</p>
                    <h2 style="margin: var(--spacing-sm) 0;">Admin</h2>
                    <span style="color: var(--text-muted); font-size: 0.875rem;">Logged In</span>
                </div>
            </div>
            <div class="table-container">
                <div style="padding: var(--spacing-lg); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-weight: 600;">Recent Transactions</h3>
                    <button class="btn-primary">View All</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="transaction-list">
                        <tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">Loading transactions...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        try {
            const response = await fetch('/api/sales/transactions', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}` }
            });
            const transactions = await response.json();
            const list = document.getElementById('transaction-list');

            if (transactions.length === 0) {
                list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">No transactions yet.</td></tr>';
                return;
            }

            let total = 0;
            list.innerHTML = transactions.map(t => {
                total += parseFloat(t.total_amount);
                return `
                    <tr>
                        <td>#${t.id.slice(0, 8).toUpperCase()}</td>
                        <td>${t.customer}</td>
                        <td>${t.created_at}</td>
                        <td>$${parseFloat(t.total_amount).toFixed(2)}</td>
                        <td><span style="color: var(--success);">${t.status}</span></td>
                    </tr>
                `;
            }).join('');

            document.getElementById('total-sales-amount').textContent = `$${total.toFixed(2)}`;
            document.getElementById('total-orders-count').textContent = transactions.length;

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            document.getElementById('transaction-list').innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Failed to load transactions.</td></tr>';
        }
    }

    async function renderInventory() {
        viewContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h2>Inventory Management</h2>
                <button class="btn-primary" id="add-product-btn">Add New Product</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="inventory-list">
                        <tr><td colspan="6" style="text-align: center; padding: var(--spacing-xl);">Loading products...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        try {
            const response = await fetch('/api/inventory/products');
            const products = await response.json();
            const list = document.getElementById('inventory-list');

            if (products.length === 0) {
                list.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-xl);">No products found.</td></tr>';
                return;
            }

            list.innerHTML = products.map(p => `
                <tr>
                    <td>${p.sku || 'N/A'}</td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td>${p.stock_quantity}</td>
                    <td>$${parseFloat(p.price).toFixed(2)}</td>
                    <td>
                        <button class="btn-icon"><i class='bx bx-edit'></i></button>
                        <button class="btn-icon danger"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error fetching products:', error);
            document.getElementById('inventory-list').innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: var(--spacing-xl);">Failed to load products.</td></tr>';
        }
    }

    async function renderSales() {
        viewContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 350px; gap: var(--spacing-lg);">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                        <h2>New Sale</h2>
                        <div class="search-box" style="width: 300px;">
                            <i class='bx bx-search'></i>
                            <input type="text" id="product-search" placeholder="Search products...">
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="sale-product-list">
                                <tr><td colspan="4" style="text-align: center; padding: var(--spacing-xl);">Loading products...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card" style="display: flex; flex-direction: column; height: max-content;">
                    <h3 style="margin-bottom: var(--spacing-lg); border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">Current Cart</h3>
                    <div id="cart-items" style="flex-grow: 1; margin-bottom: var(--spacing-lg);">
                        <p style="text-align: center; color: var(--text-muted);">Cart is empty</p>
                    </div>
                    <div style="border-top: 1px solid var(--border); padding-top: var(--spacing-md);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                            <span>Total</span>
                            <span id="cart-total" style="font-weight: 700; font-size: 1.25rem;">$0.00</span>
                        </div>
                        <button id="checkout-btn" class="btn-primary" style="width: 100%; padding: var(--spacing-md);" disabled>Complete Checkout</button>
                    </div>
                </div>
            </div>
        `;

        let cart = [];
        const productsResponse = await fetch('/api/inventory/products');
        const products = await productsResponse.json();
        const productList = document.getElementById('sale-product-list');

        function updateCart() {
            const cartItemsEl = document.getElementById('cart-items');
            if (cart.length === 0) {
                cartItemsEl.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Cart is empty</p>';
                document.getElementById('checkout-btn').disabled = true;
                document.getElementById('cart-total').textContent = '$0.00';
                return;
            }

            cartItemsEl.innerHTML = cart.map((item, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                    <div>
                        <p style="font-weight: 500;">${item.name}</p>
                        <p style="font-size: 0.75rem; color: var(--text-muted);">$${item.price} x ${item.quantity}</p>
                    </div>
                    <button class="btn-icon danger" onclick="window.removeFromCart(${index})"><i class='bx bx-x'></i></button>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
            document.getElementById('checkout-btn').disabled = false;
        }

        window.addToCart = (productId) => {
            const product = products.find(p => p.id === productId);
            const existing = cart.find(item => item.product_id === productId);
            if (existing) {
                existing.quantity++;
            } else {
                cart.push({ product_id: product.id, name: product.name, price: product.price, quantity: 1 });
            }
            updateCart();
        };

        window.removeFromCart = (index) => {
            cart.splice(index, 1);
            updateCart();
        };

        productList.innerHTML = products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>$${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.stock_quantity}</td>
                <td><button class="btn-primary" onclick="window.addToCart('${p.id}')">Add</button></td>
            </tr>
        `).join('');

        document.getElementById('checkout-btn').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/sales/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}`
                    },
                    body: JSON.stringify({ items: cart })
                });

                if (response.ok) {
                    alert('Checkout successful!');
                    renderSales(); // Refresh view
                } else {
                    const err = await response.json();
                    alert('Error: ' + err.message);
                }
            } catch (error) {
                console.error('Checkout error:', error);
            }
        });
    }

    async function renderPurchases() {
        viewContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h2>Supplier & Purchase Management</h2>
                <button class="btn-primary" id="add-supplier-btn">Add New Supplier</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 350px; gap: var(--spacing-lg);">
                <div class="table-container">
                    <div style="padding: var(--spacing-md); border-bottom: 1px solid var(--border);">
                        <h3 style="font-size: 1rem;">Recent Purchase Orders</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody id="purchase-list">
                            <tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">Loading orders...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="card">
                    <h3>Record New Purchase</h3>
                    <form id="purchase-form" style="margin-top: var(--spacing-md);">
                        <div class="form-group">
                            <label>Supplier</label>
                            <select id="p-supplier" class="btn-primary" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm);" required>
                                <option value="">Select Supplier</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Product</label>
                            <select id="p-product" class="btn-primary" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm);" required>
                                <option value="">Select Product</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Quantity</label>
                            <input type="number" id="p-qty" placeholder="0" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm); border-radius: 0.5rem;">
                        </div>
                        <div class="form-group">
                            <label>Total Cost</label>
                            <input type="number" id="p-cost" placeholder="0.00" step="0.01" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm); border-radius: 0.5rem;">
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; margin-top: var(--spacing-md);">Record & Restock</button>
                    </form>
                </div>
            </div>
        `;

        try {
            // Load Suppliers
            const supResponse = await fetch('/api/purchases/suppliers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}` }
            });
            const suppliers = await supResponse.json();
            document.getElementById('p-supplier').innerHTML += suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

            // Load Products
            const prodResponse = await fetch('/api/inventory/products');
            const products = await prodResponse.json();
            document.getElementById('p-product').innerHTML += products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

            // Load Purchases
            const purResponse = await fetch('/api/purchases/orders', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}` }
            });
            const purchases = await purResponse.json();
            const purchaseList = document.getElementById('purchase-list');

            if (purchases.length === 0) {
                purchaseList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">No purchase orders found.</td></tr>';
            } else {
                purchaseList.innerHTML = purchases.map(p => `
                    <tr>
                        <td>${p.date}</td>
                        <td>${p.supplier}</td>
                        <td>${p.product}</td>
                        <td>${p.quantity}</td>
                        <td>$${parseFloat(p.total_cost).toFixed(2)}</td>
                    </tr>
                `).join('');
            }

        } catch (error) {
            console.error('Purchase data load error:', error);
        }

        document.getElementById('purchase-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                supplier_id: document.getElementById('p-supplier').value,
                product_id: document.getElementById('p-product').value,
                quantity: document.getElementById('p-qty').value,
                total_cost: document.getElementById('p-cost').value
            };

            const response = await fetch('/api/purchases/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Purchase recorded!');
                renderPurchases();
            }
        });
    }

    async function renderFinance() {
        viewContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
                <div class="card">
                    <h3>Accounts Summary</h3>
                    <div id="accounts-list" style="margin-top: var(--spacing-md);">
                        <p style="text-align: center; color: var(--text-muted);">Loading accounts...</p>
                    </div>
                </div>
                <div class="card">
                    <h3>Record Transaction</h3>
                    <form id="transaction-form" style="margin-top: var(--spacing-md);">
                        <div class="form-group">
                            <label>Account</label>
                            <select id="t-account" class="btn-primary" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm);" required>
                                <option value="">Select Account</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Type</label>
                            <select id="t-type" class="btn-primary" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm);" required>
                                <option value="debit">Debit (Expense)</option>
                                <option value="credit">Credit (Income)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount</label>
                            <input type="number" id="t-amount" placeholder="0.00" step="0.01" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm); border-radius: 0.5rem;">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input type="text" id="t-desc" placeholder="Enter details" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border); color: var(--text-main); padding: var(--spacing-sm); border-radius: 0.5rem;">
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; margin-top: var(--spacing-md);">Add Transaction</button>
                    </form>
                </div>
            </div>
            <div class="table-container">
                <div style="padding: var(--spacing-lg);">
                    <h3 style="font-weight: 600;">Transaction Ledger</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody id="finance-transaction-list">
                        <tr><td colspan="4" style="text-align: center; padding: var(--spacing-xl);">Loading ledger...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Fetch Accounts for Summary and Select
        try {
            const accResponse = await fetch('/api/finance/accounts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}` }
            });
            const accounts = await accResponse.json();
            const accountsSummary = document.getElementById('accounts-list');
            const accountSelect = document.getElementById('t-account');

            if (accounts.length === 0) {
                accountsSummary.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No accounts found.</p>';
            } else {
                accountsSummary.innerHTML = accounts.map(a => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm); padding: var(--spacing-sm); background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
                        <span>${a.name}</span>
                        <span style="font-weight: 600;">$${parseFloat(a.balance).toFixed(2)}</span>
                    </div>
                `).join('');

                accountSelect.innerHTML += accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
            }

            // Fetch Ledger
            const transResponse = await fetch('/api/finance/transactions', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}` }
            });
            const transactions = await transResponse.json();
            const ledgerList = document.getElementById('finance-transaction-list');

            if (transactions.length === 0) {
                ledgerList.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: var(--spacing-xl);">No transactions recorded.</td></tr>';
            } else {
                ledgerList.innerHTML = transactions.map(t => `
                    <tr>
                        <td>${t.date}</td>
                        <td>${t.description}</td>
                        <td style="color: ${t.type === 'credit' ? 'var(--success)' : 'var(--danger)'}">${t.type.toUpperCase()}</td>
                        <td>$${parseFloat(t.amount).toFixed(2)}</td>
                    </tr>
                `).join('');
            }

        } catch (error) {
            console.error('Error loading finance data:', error);
        }

        // Transaction form handler
        document.getElementById('transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                account_id: document.getElementById('t-account').value,
                type: document.getElementById('t-type').value,
                amount: document.getElementById('t-amount').value,
                description: document.getElementById('t-desc').value
            };

            try {
                const response = await fetch('/api/finance/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}`
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Transaction recorded!');
                    renderFinance();
                } else {
                    alert('Error recording transaction');
                }
            } catch (error) {
                console.error('Record error:', error);
            }
        });
    }

    async function renderHRM() {
        viewContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h2>Human Resource Management</h2>
                <button class="btn-primary" id="add-employee-btn">Add New Employee</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 300px; gap: var(--spacing-lg);">
                <div class="table-container">
                    <div style="padding: var(--spacing-md); border-bottom: 1px solid var(--border);">
                        <h3 style="font-size: 1rem;">Employee Directory</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Salary</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="employee-list">
                            <tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">Loading employees...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="card">
                    <h3>Payroll Quick View</h3>
                    <div id="payroll-summary" style="margin-top: var(--spacing-md);">
                        <p style="text-align: center; color: var(--text-muted);">Loading payroll...</p>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: var(--spacing-lg); background: transparent; border: 1px solid var(--primary); color: var(--primary);">Generate Payroll</button>
                </div>
            </div>
        `;

        try {
            const empResponse = await fetch('/api/hr/employees', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}` }
            });
            const employees = await empResponse.json();
            const employeeList = document.getElementById('employee-list');

            if (employees.length === 0) {
                employeeList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">No employees found.</td></tr>';
            } else {
                employeeList.innerHTML = employees.map(e => `
                    <tr>
                        <td>
                            <p style="font-weight: 500;">${e.first_name} ${e.last_name}</p>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">${e.email}</p>
                        </td>
                        <td>${e.position}</td>
                        <td>$${parseFloat(e.salary).toFixed(2)}</td>
                        <td><span style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 2px 8px; border-radius: 999px; font-size: 0.75rem;">Active</span></td>
                        <td>
                            <button class="btn-icon"><i class='bx bx-show'></i></button>
                            <button class="btn-icon"><i class='bx bx-edit'></i></button>
                        </td>
                    </tr>
                `).join('');
            }

            const payResponse = await fetch('/api/hr/payroll', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('omnipos_token')}` }
            });
            const payroll = await payResponse.json();
            const payrollSummary = document.getElementById('payroll-summary');

            if (payroll.length === 0) {
                payrollSummary.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">No recent payroll records.</p>';
            } else {
                payrollSummary.innerHTML = payroll.map(p => `
                    <div style="padding: var(--spacing-sm); background: rgba(255,255,255,0.03); border-radius: 0.5rem; margin-bottom: var(--spacing-sm);">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 500; font-size: 0.875rem;">${p.employee_name}</span>
                            <span style="font-weight: 600;">$${parseFloat(p.net_pay).toFixed(2)}</span>
                        </div>
                        <p style="font-size: 0.75rem; color: var(--text-muted);">${p.period_end}</p>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error('HR data load error:', error);
        }
    }

    // Initial Render
    renderDashboard();
});
