class CartManager {
    constructor() {
        this.bindElements();
        this.initializeCart();
        this.setupEventListeners();
    }

    bindElements() {
        this.cartItemsContainer = document.getElementById('cartItems');
        this.emptyCartMessage = document.querySelector('.empty-cart-message');
        this.cartCount = document.getElementById('cartCount');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.subtotalAmount = document.getElementById('subtotal-amount');
        this.taxAmount = document.getElementById('tax-amount');
        this.totalAmount = document.getElementById('total-amount');
    }

    initializeCart() {
        this.updateCartDisplay();
        this.updateOrderSummary();
    }

    setupEventListeners() {
        this.checkoutBtn?.addEventListener('click', () => this.handleCheckout());
        
        // Profile dropdown
        const profileIcon = document.getElementById('profileIcon');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (profileIcon && profileDropdown) {
            profileIcon.addEventListener('click', () => {
                profileDropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!profileIcon.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                }
            });
        }
    }

    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    updateCartCount() {
        const cart = this.getCart();
        if (this.cartCount) {
            this.cartCount.textContent = cart.length;
        }
    }

    updateOrderSummary() {
        const cart = this.getCart();
        
        const subtotal = cart.reduce((total, item) => {
            return total + (item.price * (item.quantity || 1));
        }, 0);
        
        const tax = subtotal * 0.0675;
        const total = subtotal + tax;

        if (this.subtotalAmount) this.subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        if (this.taxAmount) this.taxAmount.textContent = `$${tax.toFixed(2)}`;
        if (this.totalAmount) this.totalAmount.textContent = `$${total.toFixed(2)}`;
        
        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = cart.length === 0;
        }
    }

    createCartItemElement(item, index) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.id;

        cartItem.innerHTML = `
            <img src="${item.imgUrl}" alt="${item.title}">
            <div class="item-details">
                <h3>${item.title}</h3>
                <p class="price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <input type="number" value="${item.quantity || 1}" min="1" max="10" data-index="${index}">
                <button class="quantity-btn plus" data-index="${index}">+</button>
            </div>
            <p class="item-total">$${((item.quantity || 1) * item.price).toFixed(2)}</p>
            <button class="remove-item" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;

        // Add event listeners
        cartItem.querySelector('.minus').addEventListener('click', () => this.updateQuantity(index, 'decrease'));
        cartItem.querySelector('.plus').addEventListener('click', () => this.updateQuantity(index, 'increase'));
        cartItem.querySelector('input').addEventListener('change', (e) => this.updateQuantity(index, 'input', e.target.value));
        cartItem.querySelector('.remove-item').addEventListener('click', () => this.removeFromCart(index));

        return cartItem;
    }

    updateCartDisplay() {
        const cart = this.getCart();

        if (cart.length === 0) {
            if (this.emptyCartMessage) this.emptyCartMessage.style.display = 'block';
            if (this.cartItemsContainer) this.cartItemsContainer.style.display = 'none';
            return;
        }

        if (this.emptyCartMessage) this.emptyCartMessage.style.display = 'none';
        if (this.cartItemsContainer) {
            this.cartItemsContainer.style.display = 'block';
            this.cartItemsContainer.innerHTML = '';
            cart.forEach((item, index) => {
                this.cartItemsContainer.appendChild(this.createCartItemElement(item, index));
            });
        }

        this.updateCartCount();
    }

    updateQuantity(index, action, value) {
        const cart = this.getCart();
        
        if (!cart[index]) return;

        if (action === 'increase' && cart[index].quantity < 10) {
            cart[index].quantity = (cart[index].quantity || 1) + 1;
        } else if (action === 'decrease' && cart[index].quantity > 1) {
            cart[index].quantity = (cart[index].quantity || 1) - 1;
        } else if (action === 'input') {
            const newValue = parseInt(value);
            if (newValue >= 1 && newValue <= 10) {
                cart[index].quantity = newValue;
            }
        }

        this.saveCart(cart);
        this.updateCartDisplay();
        this.updateOrderSummary();
    }
    clearCart() {
        localStorage.removeItem('cart');
    
        this.updateCartDisplay();
        this.updateOrderSummary();
    
        console.log('Cart has been emptied.');
    }
    
    removeFromCart(index) {
        const cart = this.getCart();
        cart.splice(index, 1);
        this.saveCart(cart);
        this.updateCartDisplay();
        this.updateOrderSummary();
    }

    handleCheckout() {
        const cart = this.getCart();
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
    
        alert('Proceeding to checkout...');
    
        this.clearCart();
    }
    
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CartManager();
});