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
  const [allImages, setAllImages] = useState([]); // Store all images for carousel

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const urlProductId = productId || window.location.pathname.split('/').pop();
    fetchProductDetails(urlProductId);
  }, [productId]);

  const handleLoginSuccess = ({ user, token }) => {
    localStorage.setItem('userId', user._id || user.id);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setShowLogin(false);
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
          const firstVariant = foundProduct.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedImage(firstVariant?.frontImage);
          
          // Collect all images from the selected variant
          collectAllImages(firstVariant);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Collect all images from a variant for the image gallery
  const collectAllImages = (variant) => {
    const images = [];
    if (variant?.frontImage) images.push({ src: variant.frontImage, alt: 'Front View' });
    if (variant?.backImage) images.push({ src: variant.backImage, alt: 'Back View' });
    if (variant?.leftSideView) images.push({ src: variant.leftSideView, alt: 'Left Side View' });
    if (variant?.rightSideView) images.push({ src: variant.rightSideView, alt: 'Right Side View' });
    if (variant?.additionalImages?.length > 0) {
      variant.additionalImages.forEach((img, idx) => {
        images.push({ src: img, alt: `Additional View ${idx + 1}` });
      });
    }
    setAllImages(images);
  };

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleAddToCart = async () => {
    const userId = getUserId();

    if (!userId) {
      setShowLogin(true);
      return;
    }

    if (!product || !selectedVariant) {
      toast.error('Please select a product variant');
      return;
    }

    try {
      const response = await axios.post(
        "https://pg-cards.vercel.app/cart/addToCart",
        {
          userId,
          productId: product._id,
          variantId: selectedVariant._id, // Include variant ID if needed
          quantity
        }
      );

      if (response.status === 200 || response.data.code === 200) {
        toast.success("Added to cart successfully!");
        
        // Dispatch custom event to update cart count in header
        window.dispatchEvent(new Event('cartUpdated'));
        console.log('Cart update event dispatched');
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error(error.response?.data?.msg || "Something went wrong");
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

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(variant?.frontImage);
    collectAllImages(variant); // Update images when variant changes
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null;
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const getColorCode = (colorName) => {
    if (!colorName) return '#999999';
    
    const color = colorName.toLowerCase();
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
      'red': '#FF0000',
      'green': '#008000',
      'yellow': '#FFFF00',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'brown': '#A52A2A',
      'navy': '#000080',
      'teal': '#008080',
      'maroon': '#800000',
    };
    
    // Try to extract hex code if present in the color name
    const hexMatch = colorName.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
    if (hexMatch) return hexMatch[0];
    
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
      <div className="breadcrumbs">
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
            
            {/* Image Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button 
                  className="imageNavButton prevButton"
                  onClick={() => {
                    const currentIndex = allImages.findIndex(img => img.src === selectedImage);
                    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    setSelectedImage(allImages[prevIndex].src);
                  }}
                >
                  ‹
                </button>
                <button 
                  className="imageNavButton nextButton"
                  onClick={() => {
                    const currentIndex = allImages.findIndex(img => img.src === selectedImage);
                    const nextIndex = (currentIndex + 1) % allImages.length;
                    setSelectedImage(allImages[nextIndex].src);
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
          
          {/* Image Gallery Thumbnails */}
          <div className="thumbnailGallery">
            {allImages.map((img, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImage === img.src ? 'thumbnailActive' : ''}`}
                onClick={() => setSelectedImage(img.src)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="thumbnailImage"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=Image';
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Image Counter */}
          {allImages.length > 0 && (
            <div className="imageCounter">
              {allImages.findIndex(img => img.src === selectedImage) + 1} / {allImages.length}
            </div>
          )}
        </div>

        <div className="infoSection">
          <h1 className="productTitle">{product.title}</h1>
          
          {/* Category and Material Badges */}
          <div className="productBadges">
            <span className="badge categoryBadge">{product.category}</span>
            {product.material && (
              <span className="badge materialBadge">{product.material}</span>
            )}
          </div>

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

          {/* Product Details */}
          <div className="detailsGrid">
            <div className="detailItem">
              <span className="detailLabel">Category</span>
              <span className="detailValue">{product.category}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">Material</span>
              <span className="detailValue">{product.material}</span>
            </div>
            {selectedVariant?.finish && (
              <div className="detailItem">
                <span className="detailLabel">Finish</span>
                <span className="detailValue">{selectedVariant.finish}</span>
              </div>
            )}
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 1 && (
            <div className="variantSection">
              <h3 className="variantTitle">Select Variant</h3>
              <div className="variantsGrid">
                {product.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleVariantChange(variant)}
                    className={`variantCard ${selectedVariant === variant ? 'variantCardActive' : ''}`}
                  >
                    <div className="variantColorSection">
                      <div
                        className="colorCircle"
                        style={{ backgroundColor: getColorCode(variant.color) }}
                        title={variant.color}
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
          )}

          {/* Quantity Selector */}
          <div className="quantitySection">
            <span className="quantityLabel">Quantity</span>
            <div className="quantityControls">
              <button
                className="quantityButton"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
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
            <div className="totalPrice">
              Total: AED {(currentPrice * quantity).toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="actionButtons">
            <button
              className="addToCartBtn"
              onClick={handleAddToCart}
              disabled={!selectedVariant}
            >
              <span>Add to Cart</span>
            </button>
            <button
              className="buyNowBtn"
              onClick={handleBuyNow}
              disabled={!selectedVariant}
            >
              Buy Now
            </button>
          </div>

          {/* Features List */}
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

          {/* Info Boxes */}
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
          --bg-light: #ffffff;
          --bg-card: #f8f9fa;
          --text-dark: #1a1a1a;
          --text-gray: #666666;
          --border-color: #e0e0e0;
        }

        /* Loading State */
        .loadingContainer {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
        }

        .loader {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(212, 175, 55, 0.2);
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
          background: #f5f5f5;
        }

        .errorTitle {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--text-dark);
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
          color: #ffffff;
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
            rgba(212, 175, 55, 0.05) 20px,
            rgba(212, 175, 55, 0.05) 40px
          );
          pointer-events: none;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          padding: 20px 40px;
          background: #f8f9fa;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
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
          color: rgba(212, 175, 55, 0.5);
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
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          position: relative;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.1),
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
          background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .mainImageContainer:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(212, 175, 55, 0.2) inset;
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
          background: rgba(45, 36, 22, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid rgba(212, 175, 55, 0.2);
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
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .thumbnail:hover {
          border-color: rgba(212, 175, 55, 0.5);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.2);
        }

        .thumbnail:hover::before {
          opacity: 1;
        }

        .thumbnailActive {
          border-color: var(--gold);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
          background: rgba(45, 36, 22, 0.8);
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
          line-height: 1.2;
          letter-spacing: -1px;
          margin-bottom: 0;
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
          line-height: 1.8;
          font-weight: 400;
        }

        /* Details Grid */
        .detailsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 24px;
          background: #f8f9fa;
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid var(--border-color);
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
          letter-spacing: 0.5px;
        }

        .variantsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .variantCard {
          padding: 20px;
          background: #f8f9fa;
          backdrop-filter: blur(10px);
          border: 2px solid var(--border-color);
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
          border-color: rgba(212, 175, 55, 0.6);
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
        }

        .variantCardActive {
          border-color: var(--gold);
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
          color: var(--text-dark);
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
          background: #f8f9fa;
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .featuresTitle {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-dark);
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
          color: var(--text-dark);
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
          background: #f8f9fa;
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .quantityLabel {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.5px;
        }

        .quantityControls {
          display: flex;
          align-items: center;
          gap: 0;
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
        }

        .quantityButton {
          width: 48px;
          height: 48px;
          background: #ffffff;
          border: none;
          font-size: 24px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--gold);
        }

        .quantityButton:hover {
          background: rgba(212, 175, 55, 0.1);
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
          color: var(--text-dark);
          background: #ffffff;
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

        /* Product Badges */
        .productBadges {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        .badge {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .categoryBadge {
          background: rgba(212, 175, 55, 0.15);
          color: var(--gold);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .materialBadge {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-gray);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Image Navigation Buttons */
        .imageNavButton {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: rgba(212, 175, 55, 0.9);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 50%;
          color: var(--bg-dark);
          font-size: 28px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
        }

        .imageNavButton:hover {
          background: var(--gold-light);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.6);
        }

        .prevButton {
          left: 20px;
        }

        .nextButton {
          right: 20px;
        }

        /* Image Counter */
        .imageCounter {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 16px;
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          color: var(--gold);
          border: 1px solid rgba(212, 175, 55, 0.3);
          z-index: 10;
        }

        /* Total Price in Quantity Section */
        .totalPrice {
          margin-left: auto;
          font-size: 20px;
          font-weight: 800;
          color: var(--gold);
          letter-spacing: 0.5px;
        }

  

        /* Responsive Design */
        @media (max-width: 1200px) {
          .productContainer {
            gap: 60px;
            padding: 50px 30px;
          }
        }

        @media (max-width: 968px) {
          .productContainer {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 40px 20px;
          }
          
          .productTitle {
            font-size: 36px;
          }
          
          .currentPrice {
            font-size: 42px;
          }
          
          .infoBoxes {
            grid-template-columns: 1fr;
          }
          
          .detailsGrid {
            grid-template-columns: 1fr;
          }
          
          .variantsGrid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
          
          .quantitySection {
            flex-wrap: wrap;
          }
          
          .totalPrice {
            width: 100%;
            text-align: center;
            margin-left: 0;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(212, 175, 55, 0.2);
          }
        }

        @media (max-width: 768px) {
          .breadcrumbs {
            padding: 16px 20px;
            font-size: 13px;
          }
          
          .breadcrumbSeparator {
            margin: 0 8px;
          }
          
          .productContainer {
            padding: 30px 16px;
            gap: 30px;
          }
          
          .productTitle {
            font-size: 28px;
          }
          
          .currentPrice {
            font-size: 36px;
          }
          
          .originalPrice {
            font-size: 24px;
          }
          
          .discountBadge {
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .description {
            font-size: 15px;
            line-height: 1.6;
          }
          
          .actionButtons {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .addToCartBtn,
          .buyNowBtn {
            padding: 16px 32px;
            font-size: 15px;
          }
          
          .variantsGrid {
            grid-template-columns: 1fr;
          }
          
          .thumbnailGallery {
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 8px;
          }
          
          .thumbnail {
            flex-shrink: 0;
          }
          
          .mainImageContainer {
            border-radius: 16px;
          }
          
          .imageNavButton {
            width: 40px;
            height: 40px;
            font-size: 24px;
          }
          
          .prevButton {
            left: 12px;
          }
          
          .nextButton {
            right: 12px;
          }
          
          .imageCounter {
            bottom: 12px;
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .detailsGrid {
            gap: 16px;
            padding: 20px;
          }
          
          .detailLabel {
            font-size: 11px;
          }
          
          .detailValue {
            font-size: 16px;
          }
          
          .variantTitle,
          .featuresTitle {
            font-size: 18px;
          }
          
          .quantitySection {
            padding: 20px;
            gap: 16px;
          }
          
          .quantityLabel {
            font-size: 15px;
          }
          
          .quantityButton {
            width: 44px;
            height: 44px;
            font-size: 20px;
          }
          
          .quantityValue {
            width: 60px;
            height: 44px;
            font-size: 16px;
          }
          
          .featuresSection {
            padding: 20px;
          }
          
          .featureItem {
            font-size: 15px;
          }
          
          .infoBox {
            padding: 16px;
            gap: 12px;
          }
          
          .infoBoxIcon {
            font-size: 24px;
          }
          
          .infoBoxTitle {
            font-size: 14px;
          }
          
          .infoBoxText {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .breadcrumbs {
            padding: 12px 16px;
            font-size: 12px;
          }
          
          .breadcrumbLink,
          .breadcrumbActive {
            display: inline-block;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;
          }
          
          .productContainer {
            padding: 24px 12px;
            gap: 24px;
          }
          
          .productTitle {
            font-size: 24px;
            letter-spacing: -0.5px;
          }
          
          .productBadges {
            gap: 8px;
          }
          
          .badge {
            padding: 6px 12px;
            font-size: 11px;
          }
          
          .priceSection {
            gap: 12px;
            padding-bottom: 20px;
          }
          
          .currentPrice {
            font-size: 32px;
          }
          
          .originalPrice {
            font-size: 20px;
          }
          
          .discountBadge {
            padding: 6px 10px;
            font-size: 11px;
          }
          
          .description {
            font-size: 14px;
            line-height: 1.6;
          }
          
          .mainImageContainer {
            border-radius: 12px;
          }
          
          .mainImage {
            padding: 20px;
          }
          
          .thumbnail {
            width: 80px;
            height: 80px;
            border-radius: 8px;
          }
          
          .thumbnailGallery {
            gap: 12px;
          }
          
          .imageNavButton {
            width: 36px;
            height: 36px;
            font-size: 20px;
          }
          
          .prevButton {
            left: 8px;
          }
          
          .nextButton {
            right: 8px;
          }
          
          .imageCounter {
            bottom: 8px;
            padding: 4px 10px;
            font-size: 11px;
          }
          
          .detailsGrid {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 16px;
          }
          
          .detailLabel {
            font-size: 10px;
          }
          
          .detailValue {
            font-size: 15px;
          }
          
          .variantSection {
            padding-top: 20px;
          }
          
          .variantTitle {
            font-size: 16px;
            margin-bottom: 16px;
          }
          
          .variantCard {
            padding: 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .variantPrice {
            font-size: 16px;
            align-self: flex-end;
          }
          
          .colorCircle {
            width: 28px;
            height: 28px;
          }
          
          .variantColorName {
            font-size: 14px;
          }
          
          .variantFinish {
            font-size: 11px;
          }
          
          .quantitySection {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            gap: 12px;
          }
          
          .quantityLabel {
            font-size: 14px;
            text-align: center;
          }
          
          .quantityControls {
            align-self: center;
          }
          
          .quantityButton {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
          
          .quantityValue {
            width: 50px;
            height: 40px;
            font-size: 15px;
          }
          
          .totalPrice {
            font-size: 18px;
            text-align: center;
            margin-top: 8px;
            padding-top: 8px;
          }
          
          .actionButtons {
            gap: 10px;
          }
          
          .addToCartBtn,
          .buyNowBtn {
            padding: 14px 24px;
            font-size: 14px;
            border-radius: 10px;
          }
          
          .featuresSection {
            padding: 16px;
          }
          
          .featuresTitle {
            font-size: 16px;
            margin-bottom: 16px;
          }
          
          .featuresList {
            gap: 12px;
          }
          
          .featureItem {
            font-size: 14px;
            gap: 10px;
          }
          
          .checkIcon {
            font-size: 18px;
          }
          
          .infoBoxes {
            gap: 12px;
            padding-top: 20px;
          }
          
          .infoBox {
            padding: 14px;
            gap: 10px;
          }
          
          .infoBoxIcon {
            font-size: 22px;
          }
          
          .infoBoxTitle {
            font-size: 13px;
          }
          
          .infoBoxText {
            font-size: 11px;
          }
          
          .modal {
            padding: 30px 20px;
            max-width: 90%;
            border-radius: 16px;
          }
          
          .modalTitle {
            font-size: 24px;
          }
          
          .closeButton {
            width: 36px;
            height: 36px;
            font-size: 20px;
            top: 16px;
            right: 16px;
          }
        }
        
        @media (max-width: 360px) {
          .productTitle {
            font-size: 22px;
          }
          
          .currentPrice {
            font-size: 28px;
          }
          
          .originalPrice {
            font-size: 18px;
          }
          
          .thumbnail {
            width: 70px;
            height: 70px;
          }
          
          .actionButtons {
            gap: 8px;
          }
          
          .addToCartBtn,
          .buyNowBtn {
            padding: 12px 20px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage