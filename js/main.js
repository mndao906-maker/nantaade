// ========== PANIER (LocalStorage) ==========
let cart = JSON.parse(localStorage.getItem('cartNantaade')) || [];

function updateCartCount() {
  const cartBtn = document.querySelector('.nav-cart span');
  if (cartBtn) cartBtn.textContent = `Panier (${cart.length})`;
}
updateCartCount();

// ========== NAV SCROLL ==========
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ========== FILTRAGE PRODUITS ==========
let currentGenderFilter = null;
let currentCategoryFilter = 'tout';

function setTab(btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  currentCategoryFilter = btn.getAttribute('data-category') || btn.textContent.trim().toLowerCase();
  applyFilters();
}

function filterByGender(gender) {
  currentGenderFilter = gender;
  applyFilters();
}

function applyFilters() {
  const products = document.querySelectorAll('.product-card');
  const totalProducts = products.length;
  let visibleCount = 0;
  
  products.forEach(product => {
    let show = true;
    
    // Filtrer par catégorie
    if (currentCategoryFilter !== 'tout') {
      const category = product.getAttribute('data-category');
      show = category === currentCategoryFilter;
    }
    
    // Filtrer par genre
    if (show && currentGenderFilter) {
      const gender = product.getAttribute('data-gender');
      show = gender === currentGenderFilter;
    }
    
    if (show) {
      product.classList.remove('hidden');
      visibleCount++;
    } else {
      product.classList.add('hidden');
    }
  });
  
  // Afficher un message si pas de produits
  const grid = document.getElementById('products-grid');
  let emptyMsg = grid.querySelector('.empty-message');
  if (visibleCount === 0 && !emptyMsg) {
    emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-message';
    emptyMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gris-chaud); font-size: 1rem;';
    emptyMsg.textContent = 'Aucun produit ne correspond à vos critères';
    grid.appendChild(emptyMsg);
  } else if (visibleCount > 0 && emptyMsg) {
    emptyMsg.remove();
  }
}

// ========== APERÇU RAPIDE & PANIER ==========
document.addEventListener('DOMContentLoaded', function() {
  // Ajouter au panier via aperçu rapide
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    const quickBtn = card.querySelector('.product-quick');
    if (quickBtn) {
      quickBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const productName = card.querySelector('.product-name').textContent;
        const productPrice = card.querySelector('.price-main').textContent;
        
        // Ajouter au panier
        cart.push({ name: productName, price: productPrice, id: card.id });
        localStorage.setItem('cartNantaade', JSON.stringify(cart));
        updateCartCount();
        
        // Feedback visuel
        const feedback = document.createElement('div');
        feedback.style.cssText = 'position: fixed; top: 80px; right: 20px; background: var(--or); color: var(--noir); padding: 12px 24px; border-radius: 4px; font-weight: bold; z-index: 10000; animation: slideIn 0.3s ease;';
        feedback.textContent = '✓ Ajouté au panier';
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
      });
    }
  });

  // Gestion du panier
  const cartBtn = document.querySelector('.nav-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (cart.length === 0) {
        alert('Votre panier est vide');
      } else {
        alert(`Panier (${cart.length} articles):\n\n` + cart.map(item => `${item.name} - ${item.price}`).join('\n'));
      }
    });
  }

  // ========== GESTION DES LIENS ==========
  const allLinks = document.querySelectorAll('a[href^="#"]');
  allLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const target = this.getAttribute('data-filter');
      
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const sectionId = href.substring(1);
        const section = document.getElementById(sectionId);
        
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
          
          // Appliquer filtre de genre si c'est une catégorie
          if (target && sectionId === 'collection') {
            filterByGender(target);
          }
        }
      }
    });
  });

  // ========== NEWSLETTER ==========
  const newsletterBtn = document.querySelector('.newsletter-btn');
  if (newsletterBtn) {
    newsletterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const input = document.querySelector('.newsletter-input');
      const email = input?.value;
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
        if (!subscribers.includes(email)) {
          subscribers.push(email);
          localStorage.setItem('subscribers', JSON.stringify(subscribers));
        }
        alert('Merci pour votre inscription à notre newsletter ! 📧');
        if (input) input.value = '';
      } else {
        alert('Veuillez entrer une adresse email valide');
      }
    });     
  }

  // ========== NAV LINKS ACTIVE STATE ==========
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active-link');
    } else {
      link.classList.remove('active-link');
    }
  });

  // ========== RECHERCHE NAVBAR ==========
  const navSearchInput = document.querySelector('.nav-search-input');
  if (navSearchInput) {
    navSearchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim().toLowerCase();
        if (!query) return;
        if (query.includes('homme')) {
          window.location.href = 'collections-homme.html';
        } else if (query.includes('femme')) {
          window.location.href = 'collections-femme.html';
        } else if (query.includes('jeune')) {
          window.location.href = 'collections-jeune.html';
        } else if (query.includes('lookbook')) {
          window.location.href = 'lookbook.html';
        } else if (query.includes('découvrir') || query.includes('collection')) {
          window.location.href = 'decouvrir-collection.html';
        } else {
          alert('Recherche non trouvée. Essayez "homme", "femme", "jeune", "lookbook" ou "collection".');
        }
      }
    });
  }

  // ========== PRODUCT ICON PREVIEW ==========
  productCards.forEach(card => {
    const icon = card.querySelector('.product-icon');
    if (icon) {
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', function() {
        const name = card.querySelector('.product-name').textContent;
        const cat = card.querySelector('.product-cat').textContent;
        const price = card.querySelector('.price-main').textContent;
        alert(`${name}\n${cat}\n${price}\n\nCliquez sur le bouton gris pour ajouter au panier`);
      });
    }
  });
});

// ========== ANIMATION FOOTER LINKS ==========
const footerLinks = document.querySelectorAll('.footer-links a, .cat-link');
footerLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.getAttribute('href') === '#') {
      e.preventDefault();
      const text = this.textContent.trim();
      console.log('Navigation vers:', text);
    }
  });
});
