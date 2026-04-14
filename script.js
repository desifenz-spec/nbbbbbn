/* ================================================================
   NORTHBEST INTERNATIONAL — PREMIUM JS
   Includes: navbar, menu, scroll animation, sliders, calculator
================================================================ */

/* ========== PAGE SYSTEM ========== */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Reinit scroll animations on page show
  if (page === 'home') reinitScrollAnimations();
}

/* ========== NAVBAR SCROLL ========== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});
// init on load
if (window.scrollY > 50) navbar.classList.add('scrolled');

/* ========== MOBILE MENU ========== */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ========== SCROLL ANIMATION ========== */
function reinitScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => observer.observe(el));
}
reinitScrollAnimations();

/* ========== HORIZONTAL SLIDER ========== */
function scrollSlider(id, amount) {
  document.getElementById(id).scrollBy({ left: amount, behavior: 'smooth' });
}

/* ========== SERVICES AUTO-SCROLL ========== */
(function() {
  const slider = document.getElementById('services-slider');
  if (!slider) return;
  let autoPlay = true;
  setInterval(() => {
    if (!autoPlay) return;
    const isEnd = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 10;
    slider.scrollBy({ left: isEnd ? -slider.scrollWidth : 380, behavior: 'smooth' });
  }, 3800);
  slider.addEventListener('mouseenter', () => autoPlay = false);
  slider.addEventListener('mouseleave', () => autoPlay = true);
})();

/* ========== CONTACT FORM ========== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.btn-submit');
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Sending...';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = origHTML;
      contactForm.reset();
      showToast('Request Sent', "We'll get back to you within 24 hours.");
    }, 1000);
  });
}

/* ========== TOAST ========== */
function showToast(title, message) {
  let toast = document.getElementById('toast');
  toast.innerHTML = '<h4>' + title + '</h4><p>' + message + '</p>';
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  });
}

/* ================================================================
   PRICE CALCULATOR
================================================================ */

const calcState = {
  product: null,
  productPrice: 0,
  productLabel: '',
  fabric: null,
  fabricPrice: 0,
  fabricLabel: '',
  print: null,
  printPrice: 0,
  printLabel: '',
  branding: [],    // array of {value, price, label}
  quantity: 100,
};

/* Single-select option (product, fabric, print) */
function selectOption(btn) {
  const step = btn.dataset.step;
  const value = btn.dataset.value;
  const price = parseInt(btn.dataset.price) || 0;
  const label = btn.querySelector('.opt-label')
    ? btn.querySelector('.opt-label').textContent
    : btn.querySelector('.opt-row-name').textContent;

  // Deselect siblings
  btn.closest('.calc-grid-options, .calc-list-options').querySelectorAll('[data-step="' + step + '"]').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  calcState[step] = value;
  calcState[step + 'Price'] = price;
  calcState[step + 'Label'] = label;

  updateSummary();
}

/* Multi-select toggle (branding) */
function toggleOption(btn) {
  const value = btn.dataset.value;
  const price = parseInt(btn.dataset.price) || 0;
  const label = btn.querySelector('.opt-row-name').textContent;

  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    calcState.branding = calcState.branding.filter(b => b.value !== value);
  } else {
    btn.classList.add('active');
    calcState.branding.push({ value, price, label });
  }
  updateSummary();
}

/* Quantity presets */
function setQuantity(qty) {
  calcState.quantity = qty;
  document.getElementById('qty-input').value = qty;
  document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.qty-btn').forEach(b => {
    if (parseInt(b.textContent) === qty) b.classList.add('active');
  });
  updateSummary();
}
function updateQuantity(val) {
  const qty = Math.max(50, parseInt(val) || 50);
  calcState.quantity = qty;
  document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.qty-btn').forEach(b => {
    if (parseInt(b.textContent) === qty) b.classList.add('active');
  });
  updateSummary();
}

/* Bulk discount tiers */
function getBulkDiscount(qty) {
  if (qty >= 1000) return 0.12;
  if (qty >= 500) return 0.08;
  if (qty >= 250) return 0.05;
  if (qty >= 100) return 0.02;
  return 0;
}

/* Main update */
function updateSummary() {
  const productBlock = document.getElementById('summary-product-block');
  const breakdownBlock = document.getElementById('summary-breakdown');
  const perPriceEl = document.getElementById('per-piece-price');
  const qtyEl = document.getElementById('summary-qty');
  const totalEl = document.getElementById('grand-total-price');

  if (!calcState.product) {
    productBlock.innerHTML = '<p class="summary-empty-hint">Select a product type to begin →</p>';
    perPriceEl.textContent = '₹—';
    qtyEl.textContent = '— pcs';
    totalEl.textContent = '₹—';
    breakdownBlock.innerHTML = '';
    return;
  }

  // Product name
  productBlock.innerHTML = '<p class="summary-product-name">' + calcState.productLabel + '</p>';

  // Build breakdown rows
  let breakdown = '';
  let baseTotal = calcState.productPrice;
  breakdown += buildRow('Base garment (' + calcState.productLabel + ')', calcState.productPrice);

  if (calcState.fabric) {
    baseTotal += calcState.fabricPrice;
    if (calcState.fabricPrice > 0) {
      breakdown += buildRow(calcState.fabricLabel + ' fabric', calcState.fabricPrice, '+');
    } else {
      breakdown += buildRow(calcState.fabricLabel + ' fabric', 0, '');
    }
  }
  if (calcState.print) {
    baseTotal += calcState.printPrice;
    if (calcState.printPrice > 0) {
      breakdown += buildRow(calcState.printLabel, calcState.printPrice, '+');
    } else {
      breakdown += buildRow(calcState.printLabel, 0, '');
    }
  }

  let brandingTotal = 0;
  calcState.branding.forEach(b => {
    brandingTotal += b.price;
    breakdown += buildRow(b.label, b.price, '+');
  });
  baseTotal += brandingTotal;

  // Bulk discount
  const discount = getBulkDiscount(calcState.quantity);
  let perPiece = baseTotal;
  if (discount > 0) {
    const savings = Math.round(baseTotal * discount);
    perPiece = baseTotal - savings;
    breakdown += buildRow('Bulk discount (' + (discount * 100) + '% off)', -savings, '−');
  }

  breakdownBlock.innerHTML = breakdown;

  const grandTotal = perPiece * calcState.quantity;

  perPriceEl.textContent = '₹' + perPiece.toLocaleString('en-IN');
  qtyEl.textContent = calcState.quantity.toLocaleString('en-IN') + ' pcs';
  totalEl.textContent = '₹' + grandTotal.toLocaleString('en-IN');
}

function buildRow(label, price, prefix) {
  const displayPrice = prefix === '−'
    ? '−₹' + Math.abs(price).toLocaleString('en-IN')
    : price === 0
    ? 'Incl.'
    : (prefix || '') + '₹' + price.toLocaleString('en-IN');
  const color = prefix === '−' ? 'color:#22a05a;' : '';
  return `<div class="breakdown-row"><span>${label}</span><span class="brow-val" style="${color}">${displayPrice}</span></div>`;
}

// Init quantity display
document.addEventListener('DOMContentLoaded', () => {
  const qtyInput = document.getElementById('qty-input');
  if (qtyInput) {
    qtyInput.value = calcState.quantity;
  }
});
