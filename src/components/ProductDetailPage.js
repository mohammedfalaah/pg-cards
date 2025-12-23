import React, { useState, useEffect } from 'react';
import { getUserId } from './Utils';
import axios from 'axios';
import Login from './Login';
import toast from 'react-hot-toast';

const ProductDetailPage = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    const urlProductId = productId || window.location.pathname.split('/').pop();
    fetchProductDetails(urlProductId);
  }, [productId]);

  const handleLoginSuccess = ({ user, token }) => {
  // Store user data and token
  localStorage.setItem('userId', user._id || user.id);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Close the login modal
  setShowLogin(false);
  
  // Show success message
  toast.success('Login successful!');
};

  const fetchProductDetails = async (id) => {
    try {
      const response = await fetch('https://pg-cards.vercel.app/card/getProducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        const foundProduct = data.data.find(p => p._id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedVariant(foundProduct.variants[0]);
          setSelectedImage(foundProduct.variants[0]?.frontImage);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

// ✅ CORRECTED handleAddToCart function
const handleAddToCart = async () => {
  const userId = getUserId();

  if (!userId) {
    setShowLogin(true);
    return;
  }

  // Get product ID from localStorage or use the current product's ID
  const productIdToAdd = localStorage.getItem('selectedProductId') || product._id;

  try {
    const response = await axios.post(
      "https://pg-cards.vercel.app/cart/addToCart",
      {
        userId,
        productId: productIdToAdd
      }
    );

    if (response.status === 200) {
      toast.success("Added to cart successfully!");
    }
  } catch (error) {
    console.error("Cart error:", error);
    toast.error("Something went wrong");
  }
};

  const handleBuyNow = async () => {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    setShowLogin(true);
    return;
  }

  await handleAddToCart();
  navigateTo('/checkout');
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

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loader"></div>
        <p className="loadingText">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="errorContainer">
        <h2 className="errorTitle">Product Not Found</h2>
        <p className="errorText">The product you're looking for doesn't exist.</p>
        <button className="backButton" onClick={() => navigateTo('/shop')}>
          Back to Shop
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.basePrice || 0;
  const originalPrice = selectedVariant?.originalPrice || product.originalPrice;
  const discount = calculateDiscount(originalPrice, currentPrice);

  return (
    <div className="container">
      <div style={{marginBottom:'10px'}} className="breadcrumbs">
        <span className="breadcrumbLink" onClick={() => navigateTo('/')}>Home</span>
        <span className="breadcrumbSeparator">/</span>
        <span className="breadcrumbLink" onClick={() => navigateTo('/shop')}>Shop</span>
        <span className="breadcrumbSeparator">/</span>
        <span className="breadcrumbActive">{product.title}</span>
      </div>

      <div className="productContainer">
        <div className="imageSection">
          <div className="mainImageContainer">
            <img
              src={selectedImage || selectedVariant?.frontImage || 'https://via.placeholder.com/600x400'}
              alt={product.title}
              className="mainImage"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
              }}
            />
          </div>
          
          <div className="thumbnailGallery">
            {selectedVariant?.frontImage && (
              <div
                className={`thumbnail ${selectedImage === selectedVariant?.frontImage ? 'thumbnailActive' : ''}`}
                onClick={() => setSelectedImage(selectedVariant?.frontImage)}
              >
                <img
                  src={selectedVariant.frontImage}
                  alt="Front view"
                  className="thumbnailImage"
                />
              </div>
            )}
            {selectedVariant?.backImage && (
              <div
                className={`thumbnail ${selectedImage === selectedVariant?.backImage ? 'thumbnailActive' : ''}`}
                onClick={() => setSelectedImage(selectedVariant?.backImage)}
              >
                <img
                  src={selectedVariant.backImage}
                  alt="Back view"
                  className="thumbnailImage"
                />
              </div>
            )}
          </div>
        </div>

        <div className="infoSection">
          <h1 className="productTitle">{product.title}</h1>

          <div className="priceSection">
            {originalPrice && discount ? (
              <>
                <span className="currentPrice">
                  AED {currentPrice.toLocaleString()}
                </span>
                <span className="originalPrice">
                  AED {originalPrice.toLocaleString()}
                </span>
                <span className="discountBadge">{discount}% OFF</span>
              </>
            ) : (
              <span className="currentPrice">
                AED {currentPrice.toLocaleString()}
              </span>
            )}
          </div>

          <p className="description">{product.description}</p>

          <div className="detailsGrid">
            <div className="detailItem">
              <span className="detailLabel">Category</span>
              <span className="detailValue">{product.category}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">Material</span>
              <span className="detailValue">{product.material}</span>
            </div>
          </div>

          <div className="variantSection">
            <h3 className="variantTitle">Select Variant</h3>
            <div className="variantsGrid">
              {product.variants.map((variant, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedImage(variant.frontImage);
                  }}
                  className={`variantCard ${selectedVariant === variant ? 'variantCardActive' : ''}`}
                >
                  <div className="variantColorSection">
                    <div
                      className="colorCircle"
                      style={{ backgroundColor: getColorCode(variant.color) }}
                    />
                    <div>
                      <div className="variantColorName">{variant.color}</div>
                      <div className="variantFinish">{variant.finish}</div>
                    </div>
                  </div>
                  <div className="variantPrice">
                    AED {variant.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="quantitySection">
            <span className="quantityLabel">Quantity</span>
            <div className="quantityControls">
              <button
                className="quantityButton"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="quantityValue">{quantity}</span>
              <button
                className="quantityButton"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="actionButtons">
            <button
              className="addToCartBtn"
              onClick={handleAddToCart}
            >
              <span>Add to Cart</span>
            </button>
            <button
              className="buyNowBtn"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="featuresSection">
              <h3 className="featuresTitle">Key Features</h3>
              <ul className="featuresList">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="featureItem">
                    <span className="checkIcon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="infoBoxes">
            <div className="infoBox">
              <div className="infoBoxIcon">🚚</div>
              <div>
                <div className="infoBoxTitle">Free Delivery</div>
                <div className="infoBoxText">On orders above AED 500</div>
              </div>
            </div>
            <div className="infoBox">
              <div className="infoBoxIcon">↩️</div>
              <div>
                <div className="infoBoxTitle">Easy Returns</div>
                <div className="infoBoxText">7 days return policy</div>
              </div>
            </div>
            <div className="infoBox">
              <div className="infoBoxIcon">✓</div>
              <div>
                <div className="infoBoxTitle">Quality Assured</div>
                <div className="infoBoxText">100% authentic products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

  {showLogin && (
  <Login 
    onClose={() => setShowLogin(false)} 
    onLogin={handleLoginSuccess}
  />
)}

      <style>{`
        /* CSS Variables */
        :root {
          --gold: #d4af37;
          --gold-light: #f0d97a;
          --bg-dark: #0a0a0a;
          --text-white: #ffffff;
          --text-gray: #a0a0a0;
          --bg-card: #1a1a1a;
        }

        /* Loading State */
        .loadingContainer {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .loader {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(212, 175, 55, 0.1);
          border-top: 3px solid var(--gold);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        .loadingText {
          margin-top: 24px;
          color: var(--text-gray);
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Error State */
        .errorContainer {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .errorTitle {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--text-white);
        }

        .errorText {
          font-size: 16px;
          color: var(--text-gray);
          margin-bottom: 32px;
        }

        .backButton {
          padding: 14px 40px;
          font-size: 15px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--bg-dark);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
          transition: all 0.3s ease;
        }

        .backButton:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(212, 175, 55, 0.6);
        }

        /* Main Container */
        .container {
        
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          
          position: relative;
          overflow: hidden;
        }

        .container::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(212, 175, 55, 0.02) 20px,
            rgba(212, 175, 55, 0.02) 40px
          );
          pointer-events: none;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          padding: 20px 40px;
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          font-size: 14px;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .breadcrumbLink {
          color: var(--text-gray);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .breadcrumbLink::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--gold);
          transition: width 0.3s ease;
        }

        .breadcrumbLink:hover {
          color: var(--gold);
        }

        .breadcrumbLink:hover::after {
          width: 100%;
        }

        .breadcrumbSeparator {
          margin: 0 12px;
          color: rgba(212, 175, 55, 0.3);
        }

        .breadcrumbActive {
          color: var(--gold);
          font-weight: 600;
        }

        /* Product Container */
        .productContainer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          position: relative;
          z-index: 1;
        }

        /* Image Section */
        .imageSection {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mainImageContainer {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 175, 55, 0.2);
          position: relative;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(212, 175, 55, 0.1) inset;
          transition: all 0.5s ease;
        }

        .mainImageContainer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .mainImageContainer:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(212, 175, 55, 0.3) inset;
        }

        .mainImage {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 40px;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
          transition: transform 0.5s ease;
        }

        .mainImageContainer:hover .mainImage {
          transform: scale(1.05);
        }

        /* Thumbnails */
        .thumbnailGallery {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .thumbnail {
          width: 120px;
          height: 120px;
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid rgba(212, 175, 55, 0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .thumbnail::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .thumbnail:hover {
          border-color: rgba(212, 175, 55, 0.4);
          transform: translateY(-3px);
        }

        .thumbnail:hover::before {
          opacity: 1;
        }

        .thumbnailActive {
          border-color: var(--gold);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .thumbnailImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Info Section */
        .infoSection {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .productTitle {
          font-size: 42px;
          font-weight: 900;
          color: var(--text-white);
          line-height: 1.2;
          letter-spacing: -1px;
          margin-bottom: 0;
          background: linear-gradient(135deg, #ffffff 0%, var(--gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Price Section */
        .priceSection {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }

        .currentPrice {
          font-size: 48px;
          font-weight: 800;
          color: var(--gold);
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .originalPrice {
          font-size: 28px;
          color: var(--text-gray);
          text-decoration: line-through;
          opacity: 0.6;
        }

        .discountBadge {
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--bg-dark);
          font-size: 14px;
          font-weight: 700;
          border-radius: 8px;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.6);
          }
        }

        .description {
          font-size: 17px;
          color: var(--text-gray);
          line-height: 1.8;
          font-weight: 400;
        }

        /* Details Grid */
        .detailsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 24px;
          background: rgba(26, 26, 26, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .detailItem {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detailLabel {
          font-size: 12px;
          color: var(--text-gray);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
        }

        .detailValue {
          font-size: 18px;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 0.5px;
        }

        /* Variant Section */
        .variantSection {
          padding-top: 24px;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }

        .variantTitle {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-white);
          letter-spacing: 0.5px;
        }

        .variantsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .variantCard {
          padding: 20px;
          background: rgba(26, 26, 26, 0.5);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .variantCard::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .variantCard:hover::before {
          left: 100%;
        }

        .variantCard:hover {
          border-color: rgba(212, 175, 55, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
        }

        .variantCardActive {
          border-color: var(--gold);
          background: rgba(212, 175, 55, 0.1);
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3);
        }

        .variantColorSection {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .colorCircle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(212, 175, 55, 0.3);
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .variantColorName {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-white);
        }

        .variantFinish {
          font-size: 12px;
          color: var(--text-gray);
          font-weight: 500;
        }

        .variantPrice {
          font-size: 18px;
          font-weight: 800;
          color: var(--gold);
        }

        /* Features */
        .featuresSection {
          padding: 24px;
          background: rgba(26, 26, 26, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .featuresTitle {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-white);
          letter-spacing: 0.5px;
        }

        .featuresList {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .featureItem {
          font-size: 16px;
          color: var(--text-gray);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding-left: 8px;
          transition: all 0.3s ease;
        }

        .featureItem:hover {
          color: var(--text-white);
          transform: translateX(5px);
        }

        .checkIcon {
          color: var(--gold);
          font-weight: bold;
          font-size: 20px;
          flex-shrink: 0;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }

        /* Quantity */
        .quantitySection {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: rgba(26, 26, 26, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .quantityLabel {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-white);
          letter-spacing: 0.5px;
        }

        .quantityControls {
          display: flex;
          align-items: center;
          gap: 0;
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(10, 10, 10, 0.5);
        }

        .quantityButton {
          width: 48px;
          height: 48px;
          background: rgba(26, 26, 26, 0.8);
          border: none;
          font-size: 24px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--gold);
        }

        .quantityButton:hover {
          background: rgba(212, 175, 55, 0.2);
          color: var(--gold-light);
        }

        .quantityValue {
          width: 70px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          border-left: 2px solid rgba(212, 175, 55, 0.3);
          border-right: 2px solid rgba(212, 175, 55, 0.3);
          color: var(--text-white);
          background: rgba(10, 10, 10, 0.5);
        }

        /* Action Buttons */
        .actionButtons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 8px;
        }

        .addToCartBtn {
          padding: 18px 40px;
          font-size: 16px;
          font-weight: 700;
          background: transparent;
          color: var(--gold);
          border: 2px solid var(--gold);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }

        .addToCartBtn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: var(--gold);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
          z-index: 0;
        }

        .addToCartBtn:hover::before {
          width: 300%;
          height: 300%;
        }

        .addToCartBtn:hover {
          color: var(--bg-dark);
          border-color: var(--gold);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        }

        .addToCartBtn span {
          position: relative;
          z-index: 1;
        }

        .buyNowBtn {
          padding: 18px 40px;
          font-size: 16px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--bg-dark);
          border: 2px solid var(--gold);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
        }

        .buyNowBtn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(212, 175, 55, 0.6);
          background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%);
        }

        /* Info Boxes */
        .infoBoxes {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 8px;
          padding-top: 24px;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }

        .infoBox {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: rgba(26, 26, 26, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
          transition: all 0.3s ease;
        }

        .infoBox:hover {
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.2);
        }

        .infoBoxIcon {
          font-size: 28px;
          filter: grayscale(0.3);
        }

        .infoBoxTitle {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-white);
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }

        .infoBoxText {
          font-size: 13px;
          color: var(--text-gray);
          font-weight: 400;
        }

        /* Modal */
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 50px;
          max-width: 450px;
          width: 90%;
          position: relative;
          text-align: center;
          border: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .closeButton {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
          border: 1px solid rgba(212, 175, 55, 0.3);
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .closeButton:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: rotate(90deg);
        }

        .modalTitle {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--text-white);
          letter-spacing: -0.5px;
        }

  

        /* Responsive Design */
        @media (max-width: 968px) {
          .productContainer {
            grid-template-columns: 1fr;
            gap: 50px;
            padding: 40px 20px;
          }
          
          .productTitle {
            font-size: 36px;
          }
          
          .infoBoxes {
            grid-template-columns: 1fr;
          }
          
          .detailsGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .productTitle {
            font-size: 32px;
          }
          
          .currentPrice {
            font-size: 40px;
          }
          
          .actionButtons {
            grid-template-columns: 1fr;
          }
          
          .variantsGrid {
            grid-template-columns: 1fr;
          }
          
          .thumbnailGallery {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .breadcrumbs {
            padding: 16px 20px;
            font-size: 12px;
          }
          
          .productContainer {
            padding: 30px 16px;
          }
          
          .productTitle {
            font-size: 28px;
          }
          
          .currentPrice {
            font-size: 36px;
          }
          
          .originalPrice {
            font-size: 22px;
          }
          
          .mainImageContainer {
            border-radius: 16px;
          }
          
          .thumbnail {
            width: 100px;
            height: 100px;
          }
          
          .modal {
            padding: 40px 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage