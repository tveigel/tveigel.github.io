// Pizza order management with robust localStorage
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pizzaForm');
    const ordersTable = document.getElementById('ordersTable');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrders = document.getElementById('noOrders');
    const refreshButton = document.getElementById('refreshOrders');
    const summaryButton = document.getElementById('showSummary');
    const orderCount = document.getElementById('orderCount');
    const summaryModal = document.getElementById('summaryModal');
    const closeSummaryBtn = document.getElementById('closeSummaryBtn');
    const closeSummary = document.getElementById('closeSummary');
    const summaryContent = document.getElementById('summaryContent');
    
    const STORAGE_KEY = 'pizzaOrders_party_2025';
    
    let editingOrderId = null;
    
    // Load orders from localStorage with error handling
    function loadOrders() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading orders:', e);
            return [];
        }
    }
    
    // Save orders to localStorage with error handling
    function saveOrders(orders) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
            return true;
        } catch (e) {
            console.error('Error saving orders:', e);
            alert('Warnung: Bestellung konnte nicht gespeichert werden. Versuche es erneut.');
            return false;
        }
    }
    
    let orders = loadOrders();
    
    // Display existing orders on load
    displayOrders();
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const gericht = document.getElementById('gericht').value.trim();
        const groesse = document.getElementById('groesse').value;
        const extrawunsch = document.getElementById('extrawunsch').value.trim();
        
        if (name && gericht) {
            const order = {
                id: Date.now(),
                name: name,
                gericht: gericht,
                groesse: groesse,
                extrawunsch: extrawunsch,
                timestamp: new Date().toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            orders.push(order);
            
            if (saveOrders(orders)) {
                // Clear form
                form.reset();
                
                // Update display
                displayOrders();
                
                // Show success message
                showNotification('✅ Bestellung erfolgreich hinzugefügt!');
                
                // Scroll to orders list on mobile
                document.querySelector('.orders-section').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }
    });
    
    // Handle refresh button
    refreshButton.addEventListener('click', function() {
        orders = loadOrders();
        displayOrders();
        showNotification('🔄 Bestellungen aktualisiert!');
    });
    
    // Handle summary button
    summaryButton.addEventListener('click', function() {
        showSummary();
    });
    
    // Close summary modal
    closeSummaryBtn.addEventListener('click', function() {
        summaryModal.classList.remove('show');
    });
    
    closeSummary.addEventListener('click', function() {
        summaryModal.classList.remove('show');
    });
    
    // Close modal when clicking outside
    summaryModal.addEventListener('click', function(e) {
        if (e.target === summaryModal) {
            summaryModal.classList.remove('show');
        }
    });
    
    // Display all orders
    function displayOrders() {
        orderCount.textContent = orders.length;
        
        if (orders.length === 0) {
            ordersTable.style.display = 'none';
            noOrders.style.display = 'block';
            summaryButton.style.display = 'none';
        } else {
            // Sort by timestamp, newest first
            const sortedOrders = [...orders].reverse();
            
            ordersTableBody.innerHTML = sortedOrders.map(order => {
                if (editingOrderId === order.id) {
                    return createEditRow(order);
                } else {
                    return createDisplayRow(order);
                }
            }).join('');
            
            ordersTable.style.display = 'table';
            noOrders.style.display = 'none';
            summaryButton.style.display = 'inline-block';
            
            // Attach event listeners to action buttons
            attachActionListeners();
        }
    }
    
    // Create display row
    function createDisplayRow(order) {
        return `
            <tr data-order-id="${order.id}">
                <td>${escapeHtml(order.name)}</td>
                <td>${escapeHtml(order.gericht || order.pizza || '-')}</td>
                <td class="${!order.groesse ? 'empty-cell' : ''}">${escapeHtml(order.groesse || '-')}</td>
                <td class="${!order.extrawunsch ? 'empty-cell' : ''}">${escapeHtml(order.extrawunsch || '-')}</td>
                <td>
                    <button class="action-btn edit" data-action="edit" data-id="${order.id}">✏️ Bearbeiten</button>
                    <button class="action-btn delete" data-action="delete" data-id="${order.id}">🗑️ Löschen</button>
                </td>
            </tr>
        `;
    }
    
    // Create edit row
    function createEditRow(order) {
        return `
            <tr data-order-id="${order.id}" class="editing">
                <td><input type="text" class="edit-input" id="edit-name-${order.id}" value="${escapeHtml(order.name)}"></td>
                <td><input type="text" class="edit-input" id="edit-gericht-${order.id}" value="${escapeHtml(order.gericht || order.pizza || '')}"></td>
                <td>
                    <select class="edit-select" id="edit-groesse-${order.id}">
                        <option value="">-</option>
                        <option value="Klein" ${order.groesse === 'Klein' ? 'selected' : ''}>Klein</option>
                        <option value="Standard" ${order.groesse === 'Standard' ? 'selected' : ''}>Standard</option>
                        <option value="Groß" ${order.groesse === 'Groß' ? 'selected' : ''}>Groß</option>
                    </select>
                </td>
                <td><input type="text" class="edit-input" id="edit-extrawunsch-${order.id}" value="${escapeHtml(order.extrawunsch || '')}"></td>
                <td>
                    <button class="action-btn save" data-action="save" data-id="${order.id}">💾 Speichern</button>
                    <button class="action-btn cancel" data-action="cancel" data-id="${order.id}">❌ Abbrechen</button>
                </td>
            </tr>
        `;
    }
    
    // Attach action listeners
    function attachActionListeners() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                const orderId = parseInt(this.dataset.id);
                
                switch(action) {
                    case 'edit':
                        editOrder(orderId);
                        break;
                    case 'delete':
                        deleteOrder(orderId);
                        break;
                    case 'save':
                        saveEditedOrder(orderId);
                        break;
                    case 'cancel':
                        cancelEdit();
                        break;
                }
            });
        });
    }
    
    // Edit order
    function editOrder(orderId) {
        editingOrderId = orderId;
        displayOrders();
    }
    
    // Delete order
    function deleteOrder(orderId) {
        if (confirm('Möchtest du diese Bestellung wirklich löschen?')) {
            orders = orders.filter(order => order.id !== orderId);
            saveOrders(orders);
            displayOrders();
            showNotification('🗑️ Bestellung gelöscht!');
        }
    }
    
    // Save edited order
    function saveEditedOrder(orderId) {
        const name = document.getElementById(`edit-name-${orderId}`).value.trim();
        const gericht = document.getElementById(`edit-gericht-${orderId}`).value.trim();
        const groesse = document.getElementById(`edit-groesse-${orderId}`).value;
        const extrawunsch = document.getElementById(`edit-extrawunsch-${orderId}`).value.trim();
        
        if (!name || !gericht) {
            alert('Name und Gericht müssen ausgefüllt sein!');
            return;
        }
        
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex] = {
                ...orders[orderIndex],
                name: name,
                gericht: gericht,
                groesse: groesse,
                extrawunsch: extrawunsch
            };
            
            if (saveOrders(orders)) {
                editingOrderId = null;
                displayOrders();
                showNotification('💾 Bestellung aktualisiert!');
            }
        }
    }
    
    // Cancel edit
    function cancelEdit() {
        editingOrderId = null;
        displayOrders();
    }
    
    // Show summary
    function showSummary() {
        // Group orders by gericht + groesse + extrawunsch
        const groupedOrders = {};
        
        orders.forEach(order => {
            // Normalize the fields
            const gericht = (order.gericht || order.pizza || '').trim();
            const groesse = (order.groesse || '').trim();
            const extrawunsch = (order.extrawunsch || '').trim();
            
            // Create a unique key for grouping
            const key = `${gericht}|||${groesse}|||${extrawunsch}`;
            
            if (!groupedOrders[key]) {
                groupedOrders[key] = {
                    gericht: gericht,
                    groesse: groesse,
                    extrawunsch: extrawunsch,
                    count: 0,
                    names: []
                };
            }
            
            groupedOrders[key].count++;
            groupedOrders[key].names.push(order.name);
        });
        
        // Convert to array and sort by count (descending)
        const summary = Object.values(groupedOrders).sort((a, b) => b.count - a.count);
        
        // Generate summary HTML
        let summaryHTML = `
            <div class="summary-total">
                Gesamt: ${orders.length} Bestellung${orders.length !== 1 ? 'en' : ''}
            </div>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Anzahl</th>
                        <th>Gericht</th>
                        <th>Größe</th>
                        <th>Extrawunsch</th>
                        <th>Bestellt von</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        summary.forEach(item => {
            summaryHTML += `
                <tr>
                    <td><span class="summary-count">${item.count}x</span></td>
                    <td><strong>${escapeHtml(item.gericht)}</strong></td>
                    <td>${item.groesse ? escapeHtml(item.groesse) : '<em style="color: #999;">-</em>'}</td>
                    <td>${item.extrawunsch ? escapeHtml(item.extrawunsch) : '<em style="color: #999;">-</em>'}</td>
                    <td>
                        <div class="summary-names">${item.names.map(name => escapeHtml(name)).join(', ')}</div>
                    </td>
                </tr>
            `;
        });
        
        summaryHTML += `
                </tbody>
            </table>
        `;
        
        summaryContent.innerHTML = summaryHTML;
        summaryModal.classList.add('show');
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideDown 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Add animation styles
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-100px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-100px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto-refresh every 30 seconds to catch new orders from other devices
    setInterval(function() {
        const currentOrders = loadOrders();
        if (currentOrders.length !== orders.length) {
            orders = currentOrders;
            displayOrders();
        }
    }, 30000);
});
