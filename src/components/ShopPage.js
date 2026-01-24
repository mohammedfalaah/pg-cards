import React, { useState, useEffect } from 'react';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div 
          style={{
            ...styles.sidebar,
            ...(sidebarOpen ? styles.sidebarOpen : {})
          }}
          className="sidebar"
        >
          <button
            style={styles.sidebarCloseBtn}
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>

          <h3 style={styles.sidebarTitle}>FILTER BY</h3>
          
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
        </div>

        <div style={styles.productsSection}>
          <h2 style={styles.productsTitle}>
            ALL PRODUCTS (Showing {filteredProducts.length} Products of {products.length} Products)
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
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '20px 20px 0',
    maxWidth: '1400px',
    width: 'calc(100% - 40px)',
  },
  filterIcon: {
    fontSize: '18px',
  },
  sidebarOverlay: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
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
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
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
  viewDetailsButton: {
    width: '100%',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: 'auto',
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
    .main-content {
      flex-direction: column !important;
    }
    .sidebar {
      width: 100% !important;
      position: relative !important;
      top: 0 !important;
      border-right: none !important;
      border-bottom: 1px solid #e0e0e0 !important;
    }
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
    }
  }
  @media (max-width: 768px) {
    .breadcrumbs {
      padding: 12px 20px !important;
    }
    .main-content {
      padding: 20px 15px !important;
    }
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
      gap: 15px !important;
    }
    .product-image-container {
      height: 200px !important;
    }
  }
`;

document.head.appendChild(styleSheet);

export default ShopPage;