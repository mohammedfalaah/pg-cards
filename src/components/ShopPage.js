import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getUserId } from './Utils';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  useEffect(() => {
    const sliderWrappers = document.querySelectorAll('.slider-wrapper');
    sliderWrappers.forEach(wrapper => {
      const min = parseFloat(wrapper.getAttribute('data-min')) || 0;
      const max = parseFloat(wrapper.getAttribute('data-max')) || maxPrice;
      const range = parseFloat(wrapper.getAttribute('data-range')) || maxPrice;
      
      const leftPercent = (min / range) * 100;
      const rightPercent = 100 - (max / range) * 100;
      
      wrapper.style.setProperty('--slider-left', `${leftPercent}%`);
      wrapper.style.setProperty('--slider-right', `${rightPercent}%`);
    });
  }, [priceRange, maxPrice]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://pg-cards.vercel.app/card/getProducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setProducts(data.data);
        const calculatedMaxPrice = Math.max(...data.data.flatMap(p => p.variants.map(v => v.price || p.basePrice || 0)));
        const roundedMax = Math.max(100000, Math.ceil(calculatedMaxPrice / 10000) * 10000);
        setMaxPrice(roundedMax);
        setPriceRange([0, roundedMax]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, e) => {
    if (e) {
      e.stopPropagation();
    }

    const userId = getUserId();

    if (!userId) {
      toast.error('Please login to add items to cart');
      // You can add login modal here if needed
      return;
    }

    if (!product || !product.variants || product.variants.length === 0) {
      toast.error('Product variant not available');
      return;
    }

    // Use the first variant by default
    const defaultVariant = product.variants[0];

    try {
      const response = await axios.post(
        "https://pg-cards.vercel.app/cart/addToCart",
        {
          userId,
          productId: product._id,
          variantId: defaultVariant._id,
          quantity: 1
        }
      );

      if (response.status === 200 || response.data.code === 200) {
        toast.success("Added to cart successfully!");
        
        // Dispatch custom event to update cart count in header
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error(error.response?.data?.msg || "Failed to add to cart");
    }
  };

const handleProductClick = (product) => {
  // Store product ID in localStorage
  localStorage.setItem('selectedProductId', product._id);
  
  // Create URL-friendly product name
  const productSlug = product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  // Navigate to product detail page using pushState
  const newUrl = `/product/${productSlug}/${product._id}`;
  window.history.pushState({}, '', newUrl);
  // Trigger a custom event to notify App.js of the navigation
  window.dispatchEvent(new Event('popstate'));
};

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null;
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const getColorCode = (colorName) => {
    const color = colorName?.toLowerCase() || '';
    const colorMap = {
      'black': '#000000',
      'white': '#FFFFFF',
      'grey': '#808080',
      'gray': '#808080',
      'gold': '#FFD700',
      'purple': '#800080',
      'dark blue': '#00008B',
      'blue': '#0000FF',
      'silver': '#C0C0C0',
    };
    return colorMap[color] || '#999999';
  };

  const filteredProducts = products.filter(product => {
    if (productTypeFilter !== 'all' && product.category?.toLowerCase() !== productTypeFilter.toLowerCase()) {
      return false;
    }
    
    if (materialFilter !== 'all' && product.material?.toLowerCase() !== materialFilter.toLowerCase()) {
      return false;
    }
    
    const minPrice = Math.min(...product.variants.map(v => v.price || product.basePrice || 0));
    if (minPrice < priceRange[0] || minPrice > priceRange[1]) {
      return false;
    }
    
    return true;
  });

  const productTypes = ['all', 'NFC Business QR Card', 'NFC Review QR Card', 'Digital Interface Card', 'Table Talker'];
  const materials = ['all', ...new Set(products.map(p => p.material).filter(Boolean))];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading products...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.breadcrumbs}>
        <span style={styles.breadcrumbLink} onClick={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new Event('popstate'));
        }}>Home</span>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbActive}>All products</span>
      </div>

      <button 
        style={styles.filterToggleBtn}
        className="filter-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span style={styles.filterIcon}>☰</span>
        Filters
      </button>

      <div style={styles.mainContent} className="main-content">
        {sidebarOpen && (
          <div 
            style={styles.sidebarOverlay} 
            className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div 
          style={{
            ...styles.sidebar,
            ...(sidebarOpen ? styles.sidebarOpen : {})
          }}
          className={`sidebar ${sidebarOpen ? 'active' : ''}`}
        >
          <button
            style={styles.sidebarCloseBtn}
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>

          <div style={styles.filterHeader}>
            <h3 style={styles.sidebarTitle}>FILTER BY</h3>
            <button
              style={styles.filterCloseIcon}
              className="filter-close-icon"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div style={styles.filterGroup}>
            <h4 style={styles.filterLabel}>Product Type</h4>
            <div style={styles.radioGroup}>
              {productTypes.map(type => (
                <label key={type} style={styles.radioLabel} className="radio-label">
                  <input
                    type="radio"
                    name="productType"
                    value={type}
                    checked={productTypeFilter === type}
                    onChange={(e) => setProductTypeFilter(e.target.value)}
                    style={styles.radioInput}
                  />
                  <span style={styles.radioText}>
                    {type === 'all' ? 'All' : type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <h4 style={styles.filterLabel}>Material Type</h4>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              style={styles.select}
              className="select"
            >
              {materials.map(material => (
                <option key={material} value={material}>
                  {material === 'all' ? 'All' : material}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <h4 style={styles.filterLabel}>Price Range</h4>
            <div style={styles.priceRangeContainer}>
              <div style={styles.sliderContainer}>
                <div 
                  style={styles.sliderWrapper} 
                  className="slider-wrapper"
                  data-min={priceRange[0]}
                  data-max={priceRange[1]}
                  data-range={maxPrice}
                >
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      if (newMin <= priceRange[1]) {
                        setPriceRange([newMin, priceRange[1]]);
                      }
                    }}
                    style={styles.rangeSlider}
                    className="range-slider range-slider-min"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      if (newMax >= priceRange[0]) {
                        setPriceRange([priceRange[0], newMax]);
                      }
                    }}
                    style={styles.rangeSlider}
                    className="range-slider range-slider-max"
                  />
                </div>
              </div>
              
              <div style={styles.priceInputs}>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value) || 0;
                    if (newMin >= 0 && newMin <= priceRange[1]) {
                      setPriceRange([newMin, priceRange[1]]);
                    }
                  }}
                  style={styles.priceInput}
                  className="price-input"
                  min="0"
                  max={priceRange[1]}
                />
                <span style={styles.priceSeparator}>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value) || maxPrice;
                    if (newMax >= priceRange[0] && newMax <= maxPrice) {
                      setPriceRange([priceRange[0], newMax]);
                    }
                  }}
                  style={styles.priceInput}
                  className="price-input"
                  min={priceRange[0]}
                  max={maxPrice}
                />
              </div>
              
              <div style={styles.priceLabels}>
                <span style={styles.priceLabel}>AED {priceRange[0].toLocaleString()}</span>
                <span style={styles.priceLabel}>AED {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Apply Filters Button for Mobile */}
          <button
            style={styles.applyFiltersBtn}
            className="apply-filters-btn"
            onClick={() => setSidebarOpen(false)}
          >
            Apply Filters
          </button>
        </div>

        <div style={styles.productsSection}>
          <h2 style={styles.productsTitle}>
            ALL PRODUCTS 
          </h2>
          
          <div style={styles.productsGrid} className="products-grid">
            {filteredProducts.map((product) => {
              const firstVariant = product.variants[0];
              const currentPrice = firstVariant?.price || product.basePrice || 0;
              const originalPrice = firstVariant?.originalPrice || product.originalPrice;
              const discount = calculateDiscount(originalPrice, currentPrice);
              const allColors = product.variants.map(v => v.color).filter(Boolean);
              const uniqueColors = [...new Set(allColors)];

              return (
                <div 
                  key={product._id} 
                  style={styles.productCard} 
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div style={styles.productImageContainer} className="product-image-container">
                    <img
                      src={firstVariant?.frontImage || 'https://via.placeholder.com/400x250?text=Product+Image'}
                      alt={product.title}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x250?text=Product+Image';
                      }}
                    />
                  </div>
                  
                  <div style={styles.productContent}>
                    <h3 style={styles.productTitle}>{product.title}</h3>
                    <p style={styles.productDescription}>
                      {firstVariant?.color || 'Standard'} - {firstVariant?.finish || 'Standard'}
                    </p>
                    
                    {uniqueColors.length > 0 && (
                      <div style={styles.colorSwatches}>
                        {uniqueColors.map((color, idx) => (
                          <div
                            key={idx}
                            className="color-swatch"
                            style={{
                              ...styles.colorSwatch,
                              backgroundColor: getColorCode(color),
                              border: idx === 0 ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}

                    <div style={styles.priceSection}>
                      {originalPrice && discount ? (
                        <>
                          <div style={styles.priceRow}>
                            <span style={styles.originalPrice}>
                              {product.currency === 'AED' ? 'AED ' : 'AED '}{originalPrice}
                            </span>
                            <span style={styles.discountBadge}>({discount}% off)</span>
                          </div>
                          <span style={styles.currentPrice}>
                            {product.currency === 'AED' ? 'AED ' : 'AED '}{currentPrice}
                          </span>
                        </>
                      ) : (
                        <span style={styles.currentPrice}>
                          {product.currency === 'AED' ? 'AED ' : 'AED '}{currentPrice}
                        </span>
                      )}
                    </div>

                    <div style={styles.cardActions}>
                      <button
                        style={styles.addToCartButton}
                        className="add-to-cart-btn"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                         Add to Cart
                      </button>
                      <button
                        style={styles.viewDetailsButton}
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📦</div>
              <p style={styles.emptyText}>No products found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    color: '#000',
    paddingTop: '80px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '3px solid #ddd',
    borderTop: '3px solid #000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    color: '#666',
    fontSize: '16px',
  },
  breadcrumbs: {
    padding: '16px 40px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  breadcrumbLink: {
    color: '#666',
    cursor: 'pointer',
  },
  breadcrumbSeparator: {
    margin: '0 8px',
    color: '#999',
  },
  breadcrumbActive: {
    color: '#000',
    fontWeight: '500',
  },
  filterToggleBtn: {
    display: 'none',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    backgroundColor: '#000',
    color: '#fff',
    border: '2px solid #000',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    margin: '20px auto 0',
    maxWidth: '1400px',
    width: 'calc(100% - 40px)',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  filterIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  sidebarOverlay: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1001,
    backdropFilter: 'blur(2px)',
  },
  mainContent: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px 40px',
    gap: '30px',
  },
  sidebar: {
    width: '260px',
    flexShrink: 0,
    backgroundColor: '#ffffff',
    padding: '24px 20px',
    borderRadius: '0',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
    borderRight: '1px solid #e0e0e0',
    transition: 'transform 0.3s ease',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarCloseBtn: {
    display: 'none',
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    fontSize: '28px',
    lineHeight: '1',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  filterCloseIcon: {
    display: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    fontSize: '28px',
    lineHeight: '1',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    fontWeight: '300',
    flexShrink: 0,
  },
  applyFiltersBtn: {
    display: 'none',
    width: 'calc(100% - 8px)',
    padding: '16px 24px',
    backgroundColor: '#8B5CF6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '32px',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    position: 'sticky',
    bottom: '16px',
    zIndex: 10,
  },
  filterGroup: {
    marginBottom: '28px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f0f0f0',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#555',
    padding: '4px 0',
    transition: 'color 0.2s',
  },
  radioInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#8B5CF6',
  },
  radioText: {
    userSelect: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#333',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  priceRangeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sliderContainer: {
    position: 'relative',
    width: '100%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
  },
  sliderWrapper: {
    position: 'relative',
    width: '100%',
    height: '6px',
  },
  rangeSlider: {
    position: 'absolute',
    width: '100%',
    height: '6px',
    background: 'transparent',
    outline: 'none',
    pointerEvents: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
    zIndex: 2,
  },
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  priceInput: {
    flex: 1,
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    textAlign: 'center',
  },
  priceSeparator: {
    color: '#666',
  },
  priceLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  priceLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
  },
  productsSection: {
    flex: 1,
    minWidth: 0,
  },
  productsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#000',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: '240px',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '10px',
  },
  productContent: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  productTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#000',
    lineHeight: '1.4',
    minHeight: '44px',
  },
  productDescription: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '10px',
    lineHeight: '1.4',
  },
  colorSwatches: {
    display: 'flex',
    gap: '6px',
    marginBottom: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  colorSwatch: {
    width: '20px',
    height: '20px',
    borderRadius: '3px',
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  priceSection: {
    marginBottom: '14px',
    marginTop: 'auto',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: '13px',
    color: '#999',
    textDecoration: 'line-through',
  },
  discountBadge: {
    fontSize: '11px',
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: '#e8f5e9',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  currentPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#000',
    lineHeight: '1.2',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  addToCartButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#D4AF37',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  viewDetailsButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #ccc;
  }
  .add-to-cart-btn:hover {
    background-color: #E5C866 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
  }
  .add-to-cart-btn:active {
    transform: translateY(0);
  }
  .view-details-btn:hover {
    background-color: #333 !important;
    transform: translateY(-1px);
  }
  .view-details-btn:active {
    transform: translateY(0);
  }
  .color-swatch:hover {
    transform: scale(1.1);
  }
  .radio-label:hover {
    color: #000 !important;
  }
  .price-input:focus,
  .select:focus {
    border-color: #000 !important;
  }
  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #4A90E2;
    cursor: pointer;
    pointer-events: all;
    position: relative;
    z-index: 3;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .range-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #4A90E2;
    cursor: pointer;
    pointer-events: all;
    position: relative;
    z-index: 3;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .range-slider::-webkit-slider-runnable-track {
    height: 6px;
    background: #E0E0E0;
    border-radius: 3px;
  }
  .range-slider::-moz-range-track {
    height: 6px;
    background: #E0E0E0;
    border-radius: 3px;
  }
  .slider-wrapper::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 6px;
    background: #E0E0E0;
    border-radius: 3px;
    z-index: 1;
  }
  .slider-wrapper::after {
    content: '';
    position: absolute;
    left: var(--slider-left, 0%);
    right: var(--slider-right, 0%);
    height: 6px;
    background: #4A90E2;
    border-radius: 3px;
    z-index: 1;
    transition: left 0.1s, right 0.1s;
  }
  .range-slider-min {
    z-index: 2 !important;
  }
  .range-slider-max {
    z-index: 3 !important;
  }
  .range-slider::-webkit-slider-thumb {
    pointer-events: all;
  }
  .range-slider::-moz-range-thumb {
    pointer-events: all;
  }
  input[type="radio"]:checked {
    accent-color: #8B5CF6;
  }
  
  @media (max-width: 968px) {
    .filter-toggle-btn {
      display: flex !important;
    }
    
    .filter-close-icon {
      display: flex !important;
      background-color: #000 !important;
      color: #fff !important;
    }
    
    .filter-close-icon:hover {
      background-color: #333 !important;
      transform: scale(1.1) !important;
    }
    
    .filter-close-icon:active {
      transform: scale(0.95) !important;
      background-color: #555 !important;
    }
    
    .apply-filters-btn {
      display: block !important;
      position: sticky !important;
      bottom: 16px !important;
      background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) !important;
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.5) !important;
    }
    
    .apply-filters-btn:hover {
      background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6) !important;
    }
    
    .apply-filters-btn:active {
      transform: translateY(0) !important;
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4) !important;
    }
    
    .sidebar-overlay {
      display: block !important;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .sidebar-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .sidebar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 85% !important;
      max-width: 320px !important;
      height: 100vh !important;
      overflow-y: auto !important;
      z-index: 1002 !important;
      transform: translateX(-100%) !important;
      border-right: none !important;
      box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3) !important;
      padding-top: 24px !important;
      padding-bottom: 80px !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    .sidebar.active {
      transform: translateX(0) !important;
    }
    
    .sidebar-close-btn {
      display: none !important;
    }
    
    .main-content {
      flex-direction: column !important;
      padding-top: 10px !important;
    }
    
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
    }
  }
  
  @media (max-width: 768px) {
    .breadcrumbs {
      padding: 12px 20px !important;
      font-size: 13px !important;
    }
    
    .filter-toggle-btn {
      margin: 15px auto 0 !important;
      padding: 12px 24px !important;
      font-size: 14px !important;
    }
    
    .sidebar {
      width: 90% !important;
      max-width: 300px !important;
    }
    
    .main-content {
      padding: 15px 15px 30px !important;
    }
    
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
      gap: 15px !important;
    }
    
    .product-image-container {
      height: 200px !important;
    }
    
    .product-title {
      font-size: 14px !important;
    }
    
    .product-price {
      font-size: 16px !important;
    }
    
    .add-to-cart-btn,
    .view-details-btn {
      padding: 8px 12px !important;
      font-size: 11px !important;
    }
  }
  
  @media (max-width: 480px) {
    .filter-toggle-btn {
      margin: 12px auto 0 !important;
      padding: 10px 20px !important;
      font-size: 13px !important;
      width: calc(100% - 24px) !important;
    }
    
    .sidebar {
      width: 100% !important;
      max-width: 100% !important;
      padding: 60px 20px 20px !important;
    }
    
    .sidebar-close-btn {
      top: 15px !important;
      right: 15px !important;
      width: 36px !important;
      height: 36px !important;
      font-size: 24px !important;
    }
    
    .breadcrumbs {
      padding: 10px 15px !important;
      font-size: 12px !important;
    }
    
    .main-content {
      padding: 10px 12px 20px !important;
    }
    
    .products-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
      max-width: 100% !important;
    }
    
    .product-card {
      max-width: 100% !important;
    }
    
    .product-image-container {
      height: 240px !important;
    }
    
    .product-title {
      font-size: 15px !important;
      padding: 12px !important;
    }
    
    .product-price {
      font-size: 18px !important;
    }
    
    .add-to-cart-btn,
    .view-details-btn {
      padding: 12px 16px !important;
      font-size: 12px !important;
      flex: 1 !important;
    }
    
    .add-to-cart-btn {
      min-width: 0 !important;
    }
    
    .view-details-btn {
      min-width: 0 !important;
    }
  }
  
  @media (max-width: 390px) {
    .products-grid {
      padding: 0 8px !important;
    }
    
    .product-card {
      margin: 0 !important;
    }
    
    .add-to-cart-btn,
    .view-details-btn {
      padding: 10px 12px !important;
      font-size: 11px !important;
    }
  }
`;

document.head.appendChild(styleSheet);

export default ShopPage;