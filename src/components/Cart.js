import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'https://pg-cards.vercel.app/cart/getUserCart',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.code === 200) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.post(
        'https://pg-cards.vercel.app/cart/updateQuantity',
        { userId, productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.post(
        'https://pg-cards.vercel.app/cart/removeItem',
        { userId, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    window.history.pushState({}, '', '/checkout');
    window.dispatchEvent(new Event('navigate'));
  };

  const handleContinueShopping = () => {
    window.history.pushState({}, '', '/shop');
    window.dispatchEvent(new Event('navigate'));
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="cart-loader"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h2>Please login to view your cart</h2>
          <button className="shop-btn" onClick={() => window.history.pushState({}, '', '/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items yet</p>
          <button className="shop-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
        <p>{cart.items.length} item(s) in your cart</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.productId?.variants?.[0]?.frontImage || 'https://via.placeholder.com/100'} 
                  alt={item.productId?.title} 
                />
              </div>
              
              <div className="item-details">
                <h3 className="item-title">{item.productId?.title}</h3>
                <p className="item-category">{item.productId?.category} • {item.productId?.material}</p>
                <p className="item-price">{item.productId?.currency || 'AED'} {item.price}</p>
              </div>

              <div className="item-quantity">
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId?._id, item.quantity - 1)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId?._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="item-total">
                <p className="total-label">Total</p>
                <p className="total-value">{item.productId?.currency || 'AED'} {item.price * item.quantity}</p>
              </div>

              <button 
                className="remove-btn"
                onClick={() => removeItem(item.productId?._id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>AED {cart.totalAmount}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-row total">
            <span>Total</span>
            <span>AED {cart.totalAmount}</span>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          
          <button className="continue-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
