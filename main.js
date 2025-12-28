document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Elements Selection ---
    const authWrapper = document.getElementById('authWrapper');
    const cardList = document.querySelector('.card-list');
    const cartListHTML = document.querySelector('.cart-list');
    const cartTotalHTML = document.querySelector('.cart-total');
    const paymentModal = document.getElementById('paymentModal');
    const paymentForm = document.getElementById('paymentForm');
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const cartTab = document.querySelector('.cart-tab');
    const historyModal = document.getElementById('historyModal');
    const historyContent = document.getElementById('historyContent');
    
    const cartIcon = document.querySelector('.cart-icon');
    const closeCartBtn = document.querySelector('.close-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const closeModalBtn = document.getElementById('closeModal');
    const closeHistoryBtn = document.getElementById('closeHistory');

    let productList = [];
    let cart = JSON.parse(localStorage.getItem('foodCart')) || [];

    // --- 2. Guest User Reminder ---
    const checkGuestStatus = () => {
        const user = localStorage.getItem('pizzaUser');
        if (!user) {
            setTimeout(() => {
                if (!localStorage.getItem('pizzaUser')) {
                    alert("Hey! 🍕 Pizza Box join karein taake aap apne orders track kar sakein!");
                }
            }, 7000); 
        }
    };

    // --- 3. Order History Logic ---
    const showOrderHistory = () => {
        const user = JSON.parse(localStorage.getItem('pizzaUser'));
        if(!user || !historyModal) return;

        let history = JSON.parse(localStorage.getItem(`history_${user.email}`)) || [];
        historyContent.innerHTML = '';

        if (history.length === 0) {
            historyContent.innerHTML = '<p style="text-align:center; padding:20px; color:#777;">Koi purana order nahi mila! 🍕</p>';
        } else {
            history.forEach(order => {
                historyContent.innerHTML += `
                    <div style="border-bottom:1px solid #eee; padding:15px 0;">
                        <div style="display:flex; justify-content:space-between; font-weight:bold;">
                            <span>Order ${order.orderID}</span>
                            <span style="color:#f2bd12;">${order.total}</span>
                        </div>
                        <p style="font-size:12px; color:#888; margin-top:5px;">📅 ${order.date}</p>
                    </div>`;
            });
        }
        historyModal.style.display = 'flex';
    };

    // --- 4. Authentication UI ---
    const updateAuthUI = () => {
        if (!authWrapper) return;
        const user = JSON.parse(localStorage.getItem('pizzaUser'));
        
        if (user) {
            const firstLetter = user.name.charAt(0).toUpperCase();
            authWrapper.innerHTML = `
                <div class="user-profile" style="position:relative; cursor:pointer;" id="profileTrigger">
                    <div class="avatar-circle" style="background:#f2bd12; color:#212121; width:45px; height:45px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid #212121; font-size:1.2rem;">
                        ${firstLetter}
                    </div>
                    <div id="userMenu" style="display:none; position:absolute; right:0; top:55px; background:white; box-shadow:0 10px 25px rgba(0,0,0,0.2); padding:15px; border-radius:12px; min-width:180px; z-index:9999;">
                        <p style="margin-bottom:12px; color:#333; font-size:14px; border-bottom:1px solid #eee; padding-bottom:8px;">Hi, <b>${user.name}</b></p>
                        <button id="viewHistoryBtn" style="background:#212121; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; width:100%; font-weight:600; margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <i class="fa-solid fa-clock-rotate-left"></i> History
                        </button>
                        <button id="logoutBtn" style="background:#ff4757; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; width:100%; font-weight:600; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <i class="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    </div>
                </div>`;

            document.getElementById('profileTrigger').onclick = (e) => {
                const menu = document.getElementById('userMenu');
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                e.stopPropagation();
            };

            document.getElementById('viewHistoryBtn').onclick = () => showOrderHistory();

            document.getElementById('logoutBtn').onclick = () => {
                localStorage.removeItem('pizzaUser');
                location.reload();
            };
        } else {
            authWrapper.innerHTML = `<a href="javascript:void(0)" class="btn" id="openAuth">sign in &nbsp; <i class="fa-solid fa-user"></i></a>`;
            document.getElementById('openAuth').onclick = () => authModal.style.display = 'flex';
        }
    };

    // --- 5. Cart Logic ---
    const updateCartUI = () => {
        if (!cartListHTML) return;
        cartListHTML.innerHTML = '';
        let totalQty = 0, totalPrice = 0;

        cart.forEach(item => {
            let p = productList.find(x => x.id == item.product_id);
            if (p) {
                totalQty += item.quantity;
                totalPrice += parseFloat(p.price.replace('$', '')) * item.quantity;
                cartListHTML.innerHTML += `
                    <div class="item">
                        <div class="item-image"><img src="${p.image}"></div>
                        <div class="item-details"><h4>${p.name}</h4></div>
                        <div class="item-quantity flex">
                            <span class="minus quantity-btn" data-id="${p.id}">-</span>
                            <h4 style="margin:0 10px">${item.quantity}</h4>
                            <span class="plus quantity-btn" data-id="${p.id}">+</span>
                        </div>
                    </div>`;
            }
        });
        document.querySelector('.cart-icon span').innerText = totalQty;
        cartTotalHTML.innerText = `$${totalPrice.toFixed(2)}`;
        localStorage.setItem('foodCart', JSON.stringify(cart));
    };

    // --- 6. Form Submissions ---
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('pizzaUser'));
            const orderDetails = {
                orderID: "#ORD" + Math.floor(Math.random() * 100000),
                items: cart,
                total: cartTotalHTML.innerText,
                date: new Date().toLocaleString()
            };
            let history = JSON.parse(localStorage.getItem(`history_${user.email}`)) || [];
            history.unshift(orderDetails);
            localStorage.setItem(`history_${user.email}`, JSON.stringify(history));

            if (typeof confetti !== 'undefined') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            alert("Order Confirmed! 🍕");
            cart = [];
            localStorage.removeItem('foodCart');
            updateCartUI();
            paymentModal.style.display = 'none';
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            if (name && email) {
                localStorage.setItem('pizzaUser', JSON.stringify({ name, email }));
                authModal.style.display = 'none';
                updateAuthUI();
            }
        });
    }

    // --- 7. Event Delegation & Toggles ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('addCart')) {
            let id = e.target.parentElement.dataset.id;
            let pos = cart.findIndex(v => v.product_id == id);
            pos < 0 ? cart.push({product_id:id, quantity:1}) : cart[pos].quantity++;
            updateCartUI();
        }
        let qBtn = e.target.closest('.quantity-btn');
        if (qBtn) {
            let id = qBtn.dataset.id;
            let pos = cart.findIndex(v => v.product_id == id);
            qBtn.innerText === '+' ? cart[pos].quantity++ : (cart[pos].quantity > 1 ? cart[pos].quantity-- : cart.splice(pos, 1));
            updateCartUI();
        }
        // Close menu if click outside
        if (!e.target.closest('#profileTrigger')) {
            const menu = document.getElementById('userMenu');
            if(menu) menu.style.display = 'none';
        }
    });

    if(checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (!localStorage.getItem('pizzaUser')) {
                alert("Please login to checkout!");
                authModal.style.display = 'flex';
                cartTab.classList.remove('cart-tab-active');
            } else if (cart.length > 0) {
                document.getElementById('modalTotal').innerText = cartTotalHTML.innerText;
                paymentModal.style.display = 'flex';
                cartTab.classList.remove('cart-tab-active');
            } else { alert("Cart is empty!"); }
        };
    }

    if(cartIcon) cartIcon.onclick = () => cartTab.classList.add('cart-tab-active');
    if(closeCartBtn) closeCartBtn.onclick = () => cartTab.classList.remove('cart-tab-active');
    if(closeModalBtn) closeModalBtn.onclick = () => paymentModal.style.display = 'none';
    if(closeHistoryBtn) closeHistoryBtn.onclick = () => historyModal.style.display = 'none';

    // --- 8. Init App ---
    const initApp = () => {
        updateAuthUI();
        checkGuestStatus();
        fetch('product.json').then(res => res.json()).then(data => {
            productList = data;
            if (cardList) {
                cardList.innerHTML = '';
                data.forEach(product => {
                    let div = document.createElement('div');
                    div.className = 'order-card text-center';
                    div.dataset.id = product.id;
                    div.innerHTML = `<div class="card-image"><img src="${product.image}"></div><h4>${product.name}</h4><h4 class="price">${product.price}</h4><button class="btn addCart">ADD TO CART</button>`;
                    cardList.appendChild(div);
                });
            }
            updateCartUI();
            const pre = document.getElementById('preloader');
            if(pre) setTimeout(() => { pre.style.display = 'none'; if(window.AOS) AOS.init(); }, 1000);
        });
    };

    initApp();
});