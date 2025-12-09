// CheckoutPage.js - Fixed Stripe Integration
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { getUserId } from './components/Utils';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51SYlQeCt0GZs5TLdv40gy5CFNFZQwjJBKKafhRcRkAteocPEM5UVtYrXtiOMGeuFrci9HUgwn8rPIua4wuqysHsw00cCrrypSt');

// Stripe Card Form Component
const StripeCardForm = ({ 
  clientSecret, 
  orderId, 
  onSuccess, 
  onError, 
  selectedAddress,
  totalAmount
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe not loaded yet. Please wait...');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardNumberElement);
      
      if (!cardElement) {
        setCardError('Card information not found');
        setProcessing(false);
        return;
      }

      // Create payment method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: selectedAddress?.name || 'Customer',
          phone: selectedAddress?.phone || '',
          address: {
            line1: selectedAddress?.addressLine1 || '',
            line2: selectedAddress?.addressLine2 || '',
            city: selectedAddress?.city || '',
            state: selectedAddress?.state || '',
            postal_code: selectedAddress?.pincode || '',
            country: 'IN'
          }
        }
      });

      if (createError) {
        setCardError(createError.message);
        setProcessing(false);
        return;
      }

      // Confirm payment with the created payment method
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
        return_url: `${window.location.origin}/order-success`
      });

      if (confirmError) {
        setCardError(confirmError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess(orderId, paymentMethod.id, paymentIntent.id);
      } else if (paymentIntent.status === 'requires_action') {
        // Handle 3D Secure authentication
        const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
        
        if (actionError) {
          setCardError(actionError.message);
          setProcessing(false);
          return;
        }
        
        onSuccess(orderId, paymentMethod.id, paymentIntent.id);
      } else {
        setCardError(`Payment status: ${paymentIntent.status}`);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setCardError('Payment failed. Please try again.');
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div style={styles.paymentContainer}>
      <div style={styles.paymentHeader}>
        <h3 style={styles.paymentTitle}>Secure Payment</h3>
        <div style={styles.paymentAmount}>
          <span>Amount to Pay:</span>
          <span style={styles.amountValue}>₹ {totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.stripeForm}>
        <div style={styles.stripeSection}>
          <label style={styles.stripeLabel}>Card Number</label>
          <div style={styles.stripeInputWrapper}>
            <CardNumberElement 
              options={cardElementOptions}
              style={styles.cardElement}
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formHalf}>
            <label style={styles.stripeLabel}>Expiry Date</label>
            <div style={styles.stripeInputWrapper}>
              <CardExpiryElement options={cardElementOptions} />
            </div>
          </div>
          <div style={styles.formHalf}>
            <label style={styles.stripeLabel}>CVC</label>
            <div style={styles.stripeInputWrapper}>
              <CardCvcElement options={cardElementOptions} />
            </div>
          </div>
        </div>

        {cardError && (
          <div style={styles.cardError}>
            <span style={styles.errorIcon}>⚠</span>
            {cardError}
          </div>
        )}

        <div style={styles.securityNote}>
          <span style={styles.lockIcon}>🔒</span>
          Your payment is secured with 256-bit SSL encryption
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          style={{
            ...styles.payButton,
            ...((processing || !stripe) ? styles.payButtonDisabled : {})
          }}
        >
          {processing ? (
            <>
              <div style={styles.spinner}></div>
              Processing Payment...
            </>
          ) : `Pay ₹ ${totalAmount.toFixed(2)}`}
        </button>
        
        <div style={styles.cardLogos}>
          <span>Accepted Cards:</span>
          <div style={styles.logos}>
            <span style={styles.cardLogo}>💳</span>
            <span style={styles.cardLogo}>Visa</span>
            <span style={styles.cardLogo}>Mastercard</span>
            <span style={styles.cardLogo}>RuPay</span>
          </div>
        </div>
      </form>
    </div>
  );
};

// Main Checkout Component
const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    fetchCartItems();
    fetchAddresses();
  }, []);

  const fetchCartItems = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error('Please login to view cart');
      navigateTo('/');
      return;
    }

    try {
      const response = await axios.post('https://pg-cards.vercel.app/cart/getUserCart', {
        userId
      });
      
      if (response.data.msg === 'Cart fetched') {
        const cartData = response.data.data;
        const items = cartData.items || [];
        setCartItems(items.map(item => ({
          _id: item._id,
          quantity: item.quantity,
          product: item.productId
        })));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await axios.get(`https://pg-cards.vercel.app/user/addresses/${userId}`);
      if (response.data.status === 'SUCCESS') {
        const addressList = response.data.data || [];
        setAddresses(addressList);
        const defaultAddr = addressList.find(addr => addr.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const userId = getUserId();
      await axios.post('https://pg-cards.vercel.app/cart/updateQuantity', {
        userId,
        itemId,
        quantity: newQuantity
      });
      
      setCartItems(cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const userId = getUserId();
      await axios.post('https://pg-cards.vercel.app/cart/removeItem', {
        userId,
        itemId
      });
      
      setCartItems(cartItems.filter(item => item._id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await axios.post('https://pg-cards.vercel.app/user/addAddress', {
        userId,
        ...newAddress
      });

      if (response.data.status === 'SUCCESS') {
        toast.success('Address added successfully');
        setAddresses([...addresses, response.data.data]);
        setSelectedAddress(response.data.data);
        setShowAddressForm(false);
        setNewAddress({
          name: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false
        });
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const response = await axios.post('https://pg-cards.vercel.app/coupon/apply', {
        code: couponCode,
        userId: getUserId(),
        cartTotal: calculateSubtotal()
      });

      if (response.data.status === 'SUCCESS') {
        setAppliedCoupon(response.data.data);
        toast.success('Coupon applied successfully!');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const product = item.product;
      const variant = product?.variants?.[0];
      const price = variant?.price || product?.basePrice || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
  };

  const calculateDiscount = () => {
    let discount = 0;
    cartItems.forEach(item => {
      const product = item.product;
      const variant = product?.variants?.[0];
      if (variant?.originalPrice && variant?.price) {
        const itemDiscount = (variant.originalPrice - variant.price) * (item.quantity || 1);
        discount += itemDiscount;
      }
    });
    return discount;
  };

  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  };

  const calculateGST = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const couponDiscount = calculateCouponDiscount();
    const taxableAmount = subtotal - discount - couponDiscount;
    return (taxableAmount * 0.18);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const couponDiscount = calculateCouponDiscount();
    const gst = calculateGST();
    const deliveryCharges = subtotal > 500 ? 0 : 50;
    return subtotal - discount - couponDiscount + gst + deliveryCharges;
  };

  const createPaymentIntent = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }

    setProcessingPayment(true);

    try {
      const userId = getUserId();
      const amount = Math.round(calculateTotal() * 100); // Convert to paise

      // Create payment intent
      const paymentResponse = await axios.post('https://pg-cards.vercel.app/payment/createPayment', {
        amount: amount,
        userId,
        productId: cartItems[0]?.product?._id,
        variantId: cartItems[0]?.product?.variants?.[0]?._id
      });

      if (paymentResponse.data.msg === 'Order Created & Payment Intent Generated') {
        const { orderId, clientSecret, paymentIntentId } = paymentResponse.data.data;
        setOrderId(orderId);
        setClientSecret(clientSecret);
        setPaymentIntentId(paymentIntentId);
        setShowPaymentForm(true);
        toast.success('Payment initialized successfully!');
        return true;
      }
      
      toast.error('Failed to create payment intent');
      return false;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment. Please try again.');
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (orderId, paymentMethodId, stripePaymentIntentId) => {
    try {
      // Confirm payment on backend
      const confirmResponse = await axios.post('https://pg-cards.vercel.app/payment/confirmPayment', {
        orderId,
        paymentIntentId: stripePaymentIntentId || paymentIntentId
      });

      if (confirmResponse.data.status === 'SUCCESS') {
        // Clear cart
        const userId = getUserId();
        await axios.post('https://pg-cards.vercel.app/cart/clear', { userId });
        
        toast.success('Payment successful! Order confirmed.');
        navigateTo('/order-success');
      } else {
        toast.error('Payment confirmation failed on server');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Payment confirmation failed. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  };

  const handleProceedToPayment = async () => {
    const success = await createPaymentIntent();
    if (!success) {
      setShowPaymentForm(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading checkout...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div style={styles.container}>
        <div className="checkout-content" style={styles.content}>
          <div style={styles.leftSection}>
            <div style={styles.section}>
              <div style={styles.stepHeader}>
                <div style={styles.stepNumber}>1</div>
                <h2 style={styles.stepTitle}>Login or Signup</h2>
                <span style={styles.checkmark}>✓</span>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.stepHeader}>
                <div style={styles.stepNumber}>2</div>
                <h2 style={styles.stepTitle}>Delivery Address</h2>
              </div>

              <div style={styles.addressContent}>
                {addresses.length === 0 ? (
                  <div style={styles.noAddressContainer}>
                    <p style={styles.noAddressText}>No Saved Address yet!</p>
                    <button style={styles.addAddressBtn} onClick={() => setShowAddressForm(true)}>
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  <>
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        style={{
                          ...styles.addressCard,
                          ...(selectedAddress?._id === address._id ? styles.addressCardSelected : {})
                        }}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <input
                          type="radio"
                          checked={selectedAddress?._id === address._id}
                          onChange={() => setSelectedAddress(address)}
                          style={styles.radioInput}
                        />
                        <div style={styles.addressDetails}>
                          <div style={styles.addressName}>{address.name}</div>
                          <div style={styles.addressText}>
                            {address.addressLine1}, {address.addressLine2}
                          </div>
                          <div style={styles.addressText}>
                            {address.city}, {address.state} - {address.pincode}
                          </div>
                          <div style={styles.addressPhone}>Phone: {address.phone}</div>
                        </div>
                      </div>
                    ))}
                    
                    <button style={styles.addNewAddressBtn} onClick={() => setShowAddressForm(true)}>
                      + Add New Address
                    </button>
                  </>
                )}

                {showAddressForm && (
                  <div style={styles.addressFormOverlay}>
                    <div style={styles.addressForm}>
                      <div style={styles.formHeader}>
                        <h3 style={styles.formTitle}>Add New Address</h3>
                        <button style={styles.closeBtn} onClick={() => setShowAddressForm(false)}>
                          ×
                        </button>
                      </div>
                      
                      <form onSubmit={handleAddAddress}>
                        <div style={styles.formGrid}>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                            style={styles.input}
                            required
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            style={styles.input}
                            required
                          />
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Address Line 1"
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                          style={styles.input}
                          required
                        />
                        
                        <input
                          type="text"
                          placeholder="Address Line 2 (Optional)"
                          value={newAddress.addressLine2}
                          onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                          style={styles.input}
                        />
                        
                        <div style={styles.formGrid}>
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            style={styles.input}
                            required
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            style={styles.input}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                            style={styles.input}
                            required
                          />
                        </div>
                        
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                          />
                          <span>Set as default address</span>
                        </label>
                        
                        <button type="submit" style={styles.submitBtn}>Save Address</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!showPaymentForm ? (
              <button 
                style={{
                  ...styles.proceedBtn,
                  ...(processingPayment ? styles.proceedBtnDisabled : {})
                }} 
                onClick={handleProceedToPayment}
                disabled={processingPayment || cartItems.length === 0}
              >
                {processingPayment ? (
                  <>
                    <div style={styles.buttonSpinner}></div>
                    Initializing Payment...
                  </>
                ) : 'Proceed to Payment'}
              </button>
            ) : (
              <div style={styles.paymentContainerWrapper}>
                <div style={styles.section}>
                  <div style={styles.stepHeader}>
                    <div style={styles.stepNumber}>3</div>
                    <h2 style={styles.stepTitle}>Payment Details</h2>
                  </div>
                  <div style={styles.paymentContent}>
                    {clientSecret && (
                      <StripeCardForm
                        clientSecret={clientSecret}
                        orderId={orderId}
                        selectedAddress={selectedAddress}
                        totalAmount={calculateTotal()}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    )}
                    <button 
                      style={styles.backToAddressBtn}
                      onClick={() => setShowPaymentForm(false)}
                    >
                      ← Back to Address
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <p style={styles.note}>
              Note: Once payment is complete, our sales team will promptly reach out to you.
            </p>
          </div>

          <div style={styles.rightSection}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>

            {cartItems.length === 0 ? (
              <div style={styles.emptyCart}>
                <p style={styles.emptyCartText}>Your cart is empty</p>
                <button 
                  style={styles.continueShoppingBtn}
                  onClick={() => navigateTo('/products')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {cartItems.map((item) => {
                  const product = item.product;
                  const variant = product?.variants?.[0];
                  const price = variant?.price || product?.basePrice || 0;
                  const originalPrice = variant?.originalPrice || product?.originalPrice;
                  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                  const color = variant?.color || 'Default';
                  const finish = variant?.finish || 'Standard';

                  return (
                    <div key={item._id} style={styles.cartItem}>
                      <img
                        src={variant?.frontImage || 'https://via.placeholder.com/120'}
                        alt={product?.title}
                        style={styles.productImage}
                      />
                      <div style={styles.productInfo}>
                        <h3 style={styles.productTitle}>{product?.title}</h3>
                        <p style={styles.productVariant}>
                          {color} with {finish}
                        </p>
                        <div style={styles.priceRow}>
                          <span style={styles.productPrice}>₹ {price}</span>
                          {originalPrice && originalPrice > price && (
                            <>
                              <span style={styles.originalPrice}>₹ {originalPrice}</span>
                              <span style={styles.discountBadge}>{discount}% off</span>
                            </>
                          )}
                        </div>
                        
                        <div style={styles.quantityControls}>
                          <button
                            style={styles.qtyBtn}
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span style={styles.quantity}>{item.quantity}</span>
                          <button
                            style={styles.qtyBtn}
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <button style={styles.removeBtn} onClick={() => removeItem(item._id)}>
                        ×
                      </button>
                    </div>
                  );
                })}

                <div style={styles.deliveryInfo}>
                  Products will delivered within 5-7 Working Days
                </div>

              

                <div style={styles.priceDetails}>
                  <h3 style={styles.priceDetailsTitle}>Price Details</h3>
                  
                  <div style={styles.priceRow}>
                    <span>Price({cartItems.length} items)</span>
                    <span>₹ {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {calculateDiscount() > 0 && (
                    <div style={styles.priceRow}>
                      <span>Discount</span>
                      <span style={styles.greenText}>- ₹ {calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  {appliedCoupon && (
                    <div style={styles.priceRow}>
                      <span>Coupon Discount</span>
                      <span style={styles.greenText}>- ₹ {calculateCouponDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div style={styles.priceRow}>
                    <span>Delivery Charges</span>
                    <span style={calculateSubtotal() > 500 ? styles.greenText : {}}>
                      {calculateSubtotal() > 500 ? 'FREE' : '₹ 50'}
                    </span>
                  </div>
                  
                  <div style={styles.priceRow}>
                    <span>GST (18%)</span>
                    <span>₹ {calculateGST().toFixed(2)}</span>
                  </div>
                  
                  <div style={{...styles.priceRow, ...styles.totalRow}}>
                    <span style={styles.totalLabel}>Total Payable</span>
                    <span style={styles.totalAmount}>₹ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Elements>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: '100px',
    paddingBottom: '40px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '3px solid #ddd',
    borderTop: '3px solid #ff6b35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    color: '#666',
    fontSize: '16px',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '30px',
    marginTop:'50px',
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    backgroundColor: '#000',
    gap: '16px',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ff6b35',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
  },
  stepTitle: {
    flex: 1,
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: '24px',
    fontWeight: '700',
  },
  addressContent: {
    padding: '24px',
  },
  paymentContainerWrapper: {
    marginTop: '20px',
  },
  paymentContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e0e0e0',
  },
  paymentHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  paymentTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#000',
    margin: '0 0 12px 0',
  },
  paymentAmount: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '16px',
    color: '#666',
  },
  amountValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000',
  },
  paymentContent: {
    padding: '0',
  },
  noAddressContainer: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  noAddressText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  addAddressBtn: {
    padding: '12px 32px',
    backgroundColor: '#fff',
    color: '#ff6b35',
    border: '2px solid #ff6b35',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#fff5f2',
    }
  },
  addressCard: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  addressCardSelected: {
    borderColor: '#ff6b35',
    backgroundColor: '#fff5f2',
  },
  radioInput: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#ff6b35',
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#000',
  },
  addressText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  addressPhone: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
  },
  addNewAddressBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#fff',
    color: '#ff6b35',
    border: '2px dashed #ff6b35',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#fff5f2',
    }
  },
  addressFormOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  addressForm: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000',
    margin: 0,
  },
  closeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f5f5f5',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    }
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e55a2b',
    }
  },
  proceedBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    '&:hover:not(:disabled)': {
      backgroundColor: '#e55a2b',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
    }
  },
  proceedBtnDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  buttonSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  note: {
    fontSize: '12px',
    color: '#666',
    marginTop: '12px',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  rightSection: {
    backgroundColor: '#fff',
    padding: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#000',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyCartText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  continueShoppingBtn: {
    padding: '12px 24px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e55a2b',
    }
  },
  cartItem: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f0f0f0',
    position: 'relative',
  },
  productImage: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    padding: '8px',
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  productTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#000',
    margin: 0,
  },
  productVariant: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
  productPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#000',
  },
  originalPrice: {
    fontSize: '13px',
    color: '#999',
    textDecoration: 'line-through',
    marginLeft: '8px',
  },
  discountBadge: {
    fontSize: '11px',
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: '#e8f5e9',
    padding: '2px 6px',
    borderRadius: '3px',
    marginLeft: '8px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      borderColor: '#ff6b35',
    }
  },
  quantity: {
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '30px',
    textAlign: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '24px',
    height: '24px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
    transition: 'color 0.3s',
    '&:hover': {
      color: '#ff6b35',
    }
  },
  deliveryInfo: {
    padding: '12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#2e7d32',
    marginBottom: '20px',
    textAlign: 'center',
  },
  couponSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  couponTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#000',
  },
  couponInput: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  couponField: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  applyBtn: {
    padding: '10px 24px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e55a2b',
    }
  },
  couponApplied: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    fontSize: '13px',
  },
  couponCode: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  couponDiscount: {
    marginLeft: 'auto',
    color: '#2e7d32',
    fontWeight: '600',
  },
  removeCouponBtn: {
    background: 'none',
    border: 'none',
    color: '#ff6b35',
    cursor: 'pointer',
    fontSize: '12px',
    textDecoration: 'underline',
    '&:hover': {
      color: '#e55a2b',
    }
  },
  priceDetails: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  priceDetailsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#000',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#666',
  },
  greenText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalRow: {
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
    marginTop: '16px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#000',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#000',
  },
  // Stripe Form Styles
  stripeForm: {
    width: '100%',
  },
  stripeSection: {
    marginBottom: '20px',
  },
  stripeLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  stripeInputWrapper: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s',
    '&:focus-within': {
      borderColor: '#ff6b35',
      boxShadow: '0 0 0 2px rgba(255, 107, 53, 0.1)',
    }
  },
  cardElement: {
    width: '100%',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  formHalf: {
    flex: 1,
  },
  cardError: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '20px',
  },
  lockIcon: {
    fontSize: '16px',
  },
  payButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    '&:hover:not(:disabled)': {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
    }
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  cardLogos: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    fontSize: '13px',
    color: '#666',
  },
  logos: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  cardLogo: {
    padding: '4px 8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '12px',
  },
  backToAddressBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      borderColor: '#999',
    }
  },
};

export default CheckoutPage;