const API = '/api';
let products = [];
let cart = JSON.parse(localStorage.getItem('shopzone-cart') || '[]');

const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
const $ = id => document.getElementById(id);

async function fetchProducts(params = '') {
  $('products').innerHTML = '<div class="loading">Loading products...</div>';
  try {
    const res = await fetch(`${API}/products${params}`);
    if (!res.ok) throw new Error('Unable to load products');
    products = await res.json();
    renderProducts(products);
  } catch (err) {
    $('products').innerHTML = `<div class="loading">${err.message}. Start the backend server first.</div>`;
  }
}

function renderProducts(list) {
  if (!list.length) {
    $('products').innerHTML = '<div class="loading">No products found.</div>';
    return;
  }
  $('products').innerHTML = list.map(p => `
    <article class="product-card">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="product-body">
        <h3 title="${p.name}">${p.name}</h3>
        <div class="stars">★★★★★ <span class="reviews">(${p.reviews.toLocaleString('en-IN')})</span></div>
        <div class="price"><strong>${money(p.price)}</strong>${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ''}</div>
        <button class="add-btn" onclick="addToCart('${p._id}')">🛒 Add to Cart</button>
      </div>
    </article>`).join('');
}

function addToCart(id) {
  const p = products.find(x => x._id === id);
  if (!p) return;
  const existing = cart.find(x => x.productId === id);
  if (existing) existing.quantity += 1;
  else cart.push({ productId: p._id, name: p.name, price: p.price, image: p.image, quantity: 1 });
  saveCart();
  showToast(`${p.name} added to cart`);
}

function saveCart() {
  localStorage.setItem('shopzone-cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  $('cartCount').textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function renderCart() {
  const box = $('cartItems');
  if (!cart.length) {
    box.innerHTML = '<div class="empty">Your cart is empty.<br>Add some products to continue.</div>';
    $('cartTotal').textContent = money(0);
    return;
  }
  box.innerHTML = cart.map((item, index) => `
    <div class="cart-row">
      <img src="${item.image}" alt="${item.name}">
      <div><h4>${item.name}</h4><p>${money(item.price)}</p></div>
      <div class="qty"><button onclick="changeQty(${index},-1)">−</button><span>${item.quantity}</span><button onclick="changeQty(${index},1)">+</button><button onclick="removeCart(${index})">×</button></div>
    </div>`).join('');
  $('cartTotal').textContent = money(cart.reduce((sum, i) => sum + i.price * i.quantity, 0));
}

function changeQty(index, amount) {
  cart[index].quantity += amount;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
}
function removeCart(index) { cart.splice(index, 1); saveCart(); }
function toggleCart() { $('cartDrawer').classList.toggle('open'); $('overlay').classList.toggle('show'); renderCart(); }

function searchProducts() {
  const q = $('searchInput').value.trim();
  const cat = $('categorySelect').value;
  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (cat !== 'All Categories') params.set('category', cat);
  $('productsTitle').textContent = q || cat !== 'All Categories' ? 'Search Results' : 'Featured Products';
  fetchProducts(params.toString() ? `?${params}` : '?featured=true');
  scrollToShop();
}
function filterCategory(category) {
  $('categorySelect').value = category;
  $('productsTitle').textContent = category;
  fetchProducts(`?category=${encodeURIComponent(category)}`);
  scrollToShop();
}
function showAllProducts() { $('categorySelect').value = 'All Categories'; $('searchInput').value = ''; $('productsTitle').textContent = 'All Products'; fetchProducts(); scrollToShop(); }
function loadDeals() { $('productsTitle').textContent = 'Deals & Offers'; fetchProducts('?deal=true'); scrollToShop(); }
function scrollToShop() { document.getElementById('shop').scrollIntoView({ behavior: 'smooth', block: 'start' }); }

function openCheckout() {
  if (!cart.length) return showToast('Your cart is empty');
  $('checkoutModal').classList.add('show');
}
function closeCheckout() { $('checkoutModal').classList.remove('show'); }

$('checkoutForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = new FormData(e.target);
  const customer = Object.fromEntries(form.entries());
  try {
    const res = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, items: cart }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order failed');
    cart = [];
    saveCart();
    e.target.reset();
    $('orderMessage').textContent = `Order placed! Order ID: ${data.orderId}`;
    setTimeout(closeCheckout, 1800);
  } catch (err) {
    $('orderMessage').style.color = '#d33';
    $('orderMessage').textContent = err.message;
  }
});

$('searchBtn').addEventListener('click', searchProducts);
$('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') searchProducts(); });
$('categorySelect').addEventListener('change', searchProducts);
$('cartBtn').addEventListener('click', toggleCart);
$('newsletterForm').addEventListener('submit', e => { e.preventDefault(); showToast('Thanks for subscribing!'); e.target.reset(); });

function showToast(message) { const t = $('toast'); t.textContent = message; t.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => t.classList.remove('show'), 2200); }

updateCartCount();
renderCart();
fetchProducts('?featured=true');
