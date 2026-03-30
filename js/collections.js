// ========== GESTION DES COLLECTIONS ==========

/**
 * Initialise une collection spécifique (homme, femme, jeune)
 * @param {string} collectionType - Le type de collection
 */
function initializeCollection(collectionType) {
  const storageKey = `nantaade_${collectionType}_products`;
  
  // Charger les produits existants depuis localStorage
  loadProducts(storageKey);
  
  // Attacher les événements du formulaire
  const form = document.getElementById('add-product-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      addProduct(collectionType, storageKey);
    });
  }
  
  // Attacher les événements de recherche et filtrage
  const searchInput = document.getElementById('search-products');
  const filterSelect = document.getElementById('filter-category');
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterProducts(storageKey);
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', function() {
      filterProducts(storageKey);
    });
  }
}

/**
 * Ajoute un nouveau produit
 * @param {string} collectionType - Type de collection
 * @param {string} storageKey - Clé de stockage
 */
function addProduct(collectionType, storageKey) {
  const name = document.getElementById('product-name');
  const category = document.getElementById('product-category');
  const price = document.getElementById('product-price');
  const icon = document.getElementById('product-icon');
  const badge = document.getElementById('product-badge');
  const description = document.getElementById('product-description');
  
  // Validation
  if (!name.value.trim() || !category.value || !price.value.trim()) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  // Créer l'objet produit
  const product = {
    id: Date.now(),
    name: name.value.trim(),
    category: category.value,
    price: price.value.trim(),
    icon: icon.value.trim() || '📦',
    badge: badge.value.trim() || '',
    description: description.value.trim() || '',
    gender: collectionType
  };
  
  // Charger les produits existants
  let products = JSON.parse(localStorage.getItem(storageKey)) || [];
  
  // Ajouter le nouveau produit
  products.push(product);
  
  // Sauvegarder dans localStorage
  localStorage.setItem(storageKey, JSON.stringify(products));
  
  // Réinitialiser le formulaire
  document.getElementById('add-product-form').reset();
  
  // Recharger l'affichage
  loadProducts(storageKey);
  
  // Message de succès
  showFeedback('✓ Produit ajouté avec succès', 'success');
  
  // Scroll vers les produits
  setTimeout(() => {
    document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth' });
  }, 300);
}

/**
 * Charge et affiche les produits
 * @param {string} storageKey - Clé de stockage
 */
function loadProducts(storageKey) {
  const products = JSON.parse(localStorage.getItem(storageKey)) || [];
  const grid = document.getElementById('products-grid');
  
  if (!grid) return;
  
  // Vider la grille
  grid.innerHTML = '';
  
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>Aucun produit dans cette collection pour le moment.</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Utilisez le formulaire ci-dessus pour ajouter vos premiers produits.</p>
      </div>
    `;
    return;
  }
  
  // Afficher chaque produit
  products.forEach(product => {
    const card = createProductCard(product, storageKey);
    grid.appendChild(card);
  });
}

/**
 * Crée une carte produit
 * @param {object} product - Objet produit
 * @param {string} storageKey - Clé de stockage
 * @returns {HTMLElement}
 */
function createProductCard(product, storageKey) {
  const card = document.createElement('div');
  card.className = 'collection-product-card';
  card.setAttribute('data-product-id', product.id);
  card.setAttribute('data-category', product.category);
  card.setAttribute('data-search', product.name.toLowerCase());
  
  const badgeHtml = product.badge ? `<div class="collection-product-badge">${product.badge}</div>` : '';
  const descriptionHtml = product.description ? `<p class="collection-product-description">${product.description}</p>` : '';
  
  card.innerHTML = `
    <div class="collection-product-img">
      ${product.icon}
      ${badgeHtml}
    </div>
    <div class="collection-product-info">
      <div class="collection-product-category">${product.category}</div>
      <div class="collection-product-name">${product.name}</div>
      ${descriptionHtml}
      <div class="collection-product-price">
        <span class="collection-price-main">${product.price}</span>
      </div>
      <div class="collection-product-actions">
        <button class="btn-add" onclick="addToCart('${product.name}', '${product.price}')">Ajouter au panier</button>
        <button class="btn-delete" onclick="deleteProduct('${product.id}', '${storageKey}')">Supprimer</button>
      </div>
    </div>
  `;
  
  return card;
}

/**
 * Filtre les produits basé sur la recherche et la catégorie
 * @param {string} storageKey - Clé de stockage
 */
function filterProducts(storageKey) {
  const searchValue = document.getElementById('search-products')?.value.toLowerCase() || '';
  const categoryValue = document.getElementById('filter-category')?.value || '';
  
  const cards = document.querySelectorAll('.collection-product-card');
  let visibleCount = 0;
  
  cards.forEach(card => {
    const searchText = card.getAttribute('data-search');
    const category = card.getAttribute('data-category');
    
    const matchesSearch = searchText.includes(searchValue);
    const matchesCategory = !categoryValue || category === categoryValue;
    
    const isVisible = matchesSearch && matchesCategory;
    
    if (isVisible) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Afficher un message si aucun produit
  if (visibleCount === 0) {
    const grid = document.getElementById('products-grid');
    let emptyMsg = grid?.querySelector('.empty-state');
    
    if (!emptyMsg && grid) {
      emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state';
      emptyMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px;';
      emptyMsg.innerHTML = '<p>Aucun produit ne correspond à votre recherche.</p>';
      grid.appendChild(emptyMsg);
    }
  } else {
    const emptyMsg = document.getElementById('products-grid')?.querySelector('.empty-state');
    if (emptyMsg) emptyMsg.remove();
  }
}

/**
 * Supprime un produit
 * @param {string} productId - ID du produit
 * @param {string} storageKey - Clé de stockage
 */
function deleteProduct(productId, storageKey) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    let products = JSON.parse(localStorage.getItem(storageKey)) || [];
    products = products.filter(p => p.id != productId);
    localStorage.setItem(storageKey, JSON.stringify(products));
    
    // Recharger
    loadProducts(storageKey);
    showFeedback('✓ Produit supprimé', 'success');
  }
}

/**
 * Ajoute un produit au panier
 * @param {string} productName - Nom du produit
 * @param {string} productPrice - Prix du produit
 */
function addToCart(productName, productPrice) {
  const cart = JSON.parse(localStorage.getItem('cartNantaade')) || [];
  
  cart.push({
    name: productName,
    price: productPrice,
    id: Date.now(),
    addedAt: new Date().toISOString()
  });
  
  localStorage.setItem('cartNantaade', JSON.stringify(cart));
  updateCartCount();
  showFeedback(`✓ ${productName} ajouté au panier`, 'success');
}

/**
 * Met à jour le compteur du panier
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cartNantaade')) || [];
  const cartBtn = document.querySelector('.nav-cart span');
  if (cartBtn) {
    cartBtn.textContent = `Panier (${cart.length})`;
  }
}

/**
 * Affiche un message de feedback
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message (success, error, info)
 */
function showFeedback(message, type = 'info') {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--or)'};
    color: var(--blanc);
    padding: 14px 24px;
    border-radius: 4px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-family: var(--font-ui);
    font-size: 0.9rem;
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 3000);
}

// ========== INITIALISATION AU CHARGEMENT ==========
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  
  // Gérer le lien actif dans la nav
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active-link');
    }
  });
});

// ========== SCROLL NAV ==========
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
});
