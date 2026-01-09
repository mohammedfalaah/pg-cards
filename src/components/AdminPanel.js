import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = ({ user, token: propToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0
  });

  // Get token from prop or localStorage
  const token = propToken || localStorage.getItem('token') || localStorage.getItem('authToken');

  // Product Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: 'Metal',
    basePrice: '',
    currency: 'AED',
    material: '',
    features: [''],
    variants: [{ color: '', frontImage: '', backImage: '', price: '', finish: 'Glossy' }]
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const authToken = token || localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!authToken) {
      setLoading(false);
      toast.error('No authentication token found');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch products first (most important)
      try {
        const productsRes = await axios.post(
          'https://pg-cards.vercel.app/card/getProducts',
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setProducts(productsRes.data.products || productsRes.data.data || productsRes.data || []);
      } catch (e) {
        console.log('Products fetch error:', e);
        setProducts([]);
      }

      // Fetch users from userProfile API
      try {
        const usersRes = await axios.post(
          'https://pg-cards.vercel.app/userProfile/getAllUserProfiles',
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const usersList = usersRes.data.data?.list || usersRes.data.data || [];
        setUsers(usersList);
      } catch (e) {
        console.log('Users fetch error:', e);
        setUsers([]);
      }

      // Fetch orders
      try {
        const ordersRes = await axios.get(
          'https://pg-cards.vercel.app/admin/orders',
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setOrders(ordersRes.data.orders || ordersRes.data.data || ordersRes.data || []);
      } catch (e) {
        console.log('Orders fetch error:', e);
        setOrders([]);
      }

      // Calculate stats
      setStats({
        totalUsers: users.length || 0,
        totalOrders: orders.length || 0,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        activeProducts: products.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate QR Code for User
  const generateQRForUser = async (userId, userName) => {
    try {
      setSelectedUser({ id: userId, name: userName });
      
      const response = await axios.post(
        'https://pg-cards.vercel.app/userProfile/getUser',
        { userId },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.code === 200) {
        setQrData(response.data.data.qr);
        toast.success(`QR generated for ${userName}`);
      } else {
        toast.error(response.data.msg || 'Failed to generate QR');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error('Failed to generate QR code');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(
        `https://pg-cards.vercel.app/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(
        `https://pg-cards.vercel.app/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      toast.success('User role updated');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(profile =>
    profile.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    profile.user?.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    profile.user?.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    profile.companyName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    profile._id?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Reset product form
  const resetProductForm = () => {
    setProductForm({
      title: '',
      description: '',
      category: 'Metal',
      basePrice: '',
      currency: 'INR',
      material: '',
      features: [''],
      variants: [{ color: '', frontImage: '', backImage: '', price: '', finish: 'Glossy' }]
    });
    setEditingProduct(null);
  };

  // Open product modal for creating
  const openCreateProductModal = () => {
    resetProductForm();
    setShowProductModal(true);
  };

  // Open product modal for editing
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title || '',
      description: product.description || '',
      category: product.category || 'Metal',
      basePrice: product.basePrice || product.price || '',
      currency: product.currency || 'INR',
      material: product.material || '',
      features: product.features?.length > 0 ? product.features : [''],
      variants: product.variants?.length > 0 ? product.variants : [{ color: '', frontImage: '', backImage: '', price: '', finish: 'Glossy' }]
    });
    setShowProductModal(true);
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'pgcards_unsigned');
    formData.append('folder', 'pgcards');

    try {
      setUploadingImage(true);
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dhcwgdobf/image/upload',
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle image upload for variant
  const handleVariantImageUpload = async (index, field, file) => {
    const imageUrl = await uploadToCloudinary(file);
    if (imageUrl) {
      const newVariants = [...productForm.variants];
      newVariants[index][field] = imageUrl;
      setProductForm({ ...productForm, variants: newVariants });
      toast.success('Image uploaded successfully');
    }
  };

  // Add feature
  const addFeature = () => {
    setProductForm({ ...productForm, features: [...productForm.features, ''] });
  };

  // Remove feature
  const removeFeature = (index) => {
    const newFeatures = productForm.features.filter((_, i) => i !== index);
    setProductForm({ ...productForm, features: newFeatures.length > 0 ? newFeatures : [''] });
  };

  // Update feature
  const updateFeature = (index, value) => {
    const newFeatures = [...productForm.features];
    newFeatures[index] = value;
    setProductForm({ ...productForm, features: newFeatures });
  };

  // Add variant
  const addVariant = () => {
    setProductForm({
      ...productForm,
      variants: [...productForm.variants, { color: '', frontImage: '', backImage: '', price: '', finish: 'Glossy' }]
    });
  };

  // Remove variant
  const removeVariant = (index) => {
    const newVariants = productForm.variants.filter((_, i) => i !== index);
    setProductForm({ ...productForm, variants: newVariants.length > 0 ? newVariants : [{ color: '', frontImage: '', backImage: '', price: '', finish: 'Glossy' }] });
  };

  // Update variant
  const updateVariant = (index, field, value) => {
    const newVariants = [...productForm.variants];
    newVariants[index][field] = value;
    setProductForm({ ...productForm, variants: newVariants });
  };

  // Create or Update Product
  const handleSaveProduct = async () => {
    // Validation
    if (!productForm.title.trim()) {
      toast.error('Product title is required');
      return;
    }
    if (!productForm.basePrice) {
      toast.error('Base price is required');
      return;
    }

    // Filter out empty features
    const cleanFeatures = productForm.features.filter(f => f.trim() !== '');
    
    // Filter out incomplete variants and validate
    const cleanVariants = productForm.variants.filter(v => v.color.trim() !== '');

    const productData = {
      title: productForm.title,
      description: productForm.description,
      category: productForm.category,
      basePrice: Number(productForm.basePrice),
      currency: productForm.currency,
      material: productForm.material,
      features: cleanFeatures,
      variants: cleanVariants.map(v => ({
        ...v,
        price: Number(v.price) || Number(productForm.basePrice)
      }))
    };

    try {
      if (editingProduct) {
        // Update existing product
        const response = await axios.post(
          'https://pg-cards.vercel.app/card/updateProduct',
          { 
            id: editingProduct._id,
            updatedData: productData
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setProducts(products.map(p => 
          p._id === editingProduct._id ? response.data.product || response.data.data || { ...p, ...productData } : p
        ));
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const response = await axios.post(
          'https://pg-cards.vercel.app/card/createProduct',
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const newProduct = response.data.product || response.data.data || response.data;
        setProducts([...products, newProduct]);
        toast.success('Product created successfully');
      }
      
      setShowProductModal(false);
      resetProductForm();
      // Refresh products list
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || error.response?.data?.msg || 'Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.post(
        'https://pg-cards.vercel.app/card/deleteProduct',
        { id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="adminLoading">
        <div className="adminLoader"></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="adminContainer">
      {/* Admin Header */}
      <div className="adminHeader">
        <div className="adminHeaderLeft">
          <h1 className="adminTitle">Admin Dashboard</h1>
          <p className="adminWelcome">Welcome back, {user?.name || 'Admin'} 👋</p>
        </div>
        <div className="adminHeaderRight">
          <button className="adminLogoutBtn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="adminNav">
        <button 
          className={`adminNavBtn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`adminNavBtn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`adminNavBtn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🛍️ Products
        </button>
        <button 
          className={`adminNavBtn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
      
      </div>

      {/* Main Content */}
      <div className="adminContent">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboardTab">
            <h2 className="tabTitle">📊 Dashboard Overview</h2>
            
            <div className="statsGrid">
              <div className="statCard">
                <div className="statIcon">👥</div>
                <div className="statInfo">
                  <h3 className="statValue">{stats.totalUsers}</h3>
                  <p className="statLabel">Total Users</p>
                </div>
              </div>
              
              <div className="statCard">
                <div className="statIcon">📦</div>
                <div className="statInfo">
                  <h3 className="statValue">{stats.totalOrders}</h3>
                  <p className="statLabel">Total Orders</p>
                </div>
              </div>
              
              <div className="statCard">
                <div className="statIcon">💰</div>
                <div className="statInfo">
                  <h3 className="statValue">AED {stats.totalRevenue.toLocaleString()}</h3>
                  <p className="statLabel">Total Revenue</p>
                </div>
              </div>
              
              <div className="statCard">
                <div className="statIcon">🛍️</div>
                <div className="statInfo">
                  <h3 className="statValue">{stats.activeProducts}</h3>
                  <p className="statLabel">Active Products</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recentActivity">
              <h3 className="sectionTitle">Recent Activity</h3>
              <div className="activityList">
                {orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="activityItem">
                    <div className="activityIcon">🛒</div>
                    <div className="activityDetails">
                      <p className="activityText">
                        New order from <strong>{order.userName || 'Customer'}</strong>
                      </p>
                      <p className="activityTime">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="activityAmount">AED {order.totalAmount || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="usersTab">
            <div className="tabHeader">
              <h2 className="tabTitle">👥 User Management</h2>
              <div className="searchBox">
                <input
                  type="text"
                  placeholder="Search users by name, email, or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="searchInput"
                />
                <span className="searchIcon">🔍</span>
              </div>
            </div>

            <div className="usersTableContainer">
              <table className="usersTable">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Theme</th>
                    <th>Status</th>
                    <th>Joined</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((profile) => (
                    <tr key={profile._id}>
                      <td>
                        <div className="userCell">
                          {profile.profilePicture && !profile.profilePicture.startsWith('blob:') ? (
                            <img 
                              src={profile.profilePicture} 
                              alt={profile.fullName}
                              className="userAvatarImg"
                            />
                          ) : (
                            <div className="userAvatar">
                              {profile.fullName?.charAt(0) || profile.user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="userNameCell">
                          <span className="userName">{profile.fullName || profile.user?.name || 'No Name'}</span>
                          <span className="userDesignation">{profile.companyDesignation}</span>
                        </div>
                      </td>
                      <td>{profile.user?.email || 'No Email'}</td>
                      <td>{profile.companyName || '-'}</td>
                      <td>
                        <span className={`themeBadge theme-${profile.theme}`}>
                          {profile.theme || 'standard'}
                        </span>
                      </td>
                      <td>
                        <span className={`statusBadge ${profile.isPurchase ? 'purchased' : 'trial'}`}>
                          {profile.isPurchase ? '✅ Purchased' : '⏳ Trial'}
                        </span>
                      </td>
                      <td>
                        {profile.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                    
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="emptyState">
                <div className="emptyIcon">👥</div>
                <h3>No Users Found</h3>
                <p>No users match your search criteria</p>
              </div>
            )}
          </div>
        )}

        {/* QR Codes Tab */}
       

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="productsTab">
            <div className="tabHeader">
              <h2 className="tabTitle">🛍️ Product Management</h2>
              <button className="addProductBtn" onClick={openCreateProductModal}>
                ➕ Add New Product
              </button>
            </div>

            <div className="productsGrid">
              {products.map((product) => (
                <div key={product._id} className="productCard">
                  <div className="productImage">
                    <img 
                      src={product.variants?.[0]?.frontImage || product.image || 'https://via.placeholder.com/150'} 
                      alt={product.title}
                    />
                  </div>
                  <div className="productInfo">
                    <h3 className="productTitle">{product.title}</h3>
                    <p className="productCategory">{product.category} • {product.material}</p>
                    <div className="productPrice">
                      {product.currency || 'INR'} {product.basePrice || product.price}
                    </div>
                    {product.variants?.length > 0 && (
                      <p className="productVariants">{product.variants.length} variant(s)</p>
                    )}
                    <div className="productActions">
                       <button className="editBtn" onClick={() => openEditProductModal(product)}>✏️ Edit</button> 
                      <button className="deleteBtn" onClick={() => handleDeleteProduct(product._id)}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="emptyState">
                <div className="emptyIcon">🛍️</div>
                <h3>No Products Yet</h3>
                <p>Click "Add New Product" to create your first product</p>
              </div>
            )}
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="modalOverlay" onClick={() => setShowProductModal(false)}>
            <div className="productModal" onClick={(e) => e.stopPropagation()}>
              <div className="modalHeader">
                <h2>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                <button className="closeModalBtn" onClick={() => setShowProductModal(false)}>✕</button>
              </div>
              
              <div className="modalBody">
                {/* Basic Info */}
                <div className="formSection">
                  <h3 className="sectionLabel">Basic Information</h3>
                  
                  <div className="formGroup">
                    <label>Product Title *</label>
                    <input
                      type="text"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="e.g., Premium Metal NFC Card"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>

                  <div className="formRow">
                    <div className="formGroup">
                      <label>Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        <option value="Metal">Metal</option>
                        <option value="PVC">PVC</option>
                        <option value="Wood">Wood</option>
                        <option value="Bamboo">Bamboo</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>

                    <div className="formGroup">
                      <label>Material</label>
                      <input
                        type="text"
                        value={productForm.material}
                        onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                        placeholder="e.g., Stainless Steel"
                      />
                    </div>
                  </div>

                  <div className="formRow">
                    <div className="formGroup">
                      <label>Base Price *</label>
                      <input
                        type="number"
                        value={productForm.basePrice}
                        onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                        placeholder="899"
                      />
                    </div>

                    <div className="formGroup">
                      <label>Currency</label>
                      <select
                        value={productForm.currency}
                        onChange={(e) => setProductForm({ ...productForm, currency: e.target.value })}
                      >
                        <option value="AED">AED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="formSection">
                  <h3 className="sectionLabel">Features</h3>
                  {productForm.features.map((feature, index) => (
                    <div key={index} className="featureRow">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., NFC enabled"
                      />
                      <button 
                        type="button" 
                        className="removeBtn"
                        onClick={() => removeFeature(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button type="button" className="addMoreBtn" onClick={addFeature}>
                    + Add Feature
                  </button>
                </div>

                {/* Variants */}
                <div className="formSection">
                  <h3 className="sectionLabel">Variants</h3>
                  {productForm.variants.map((variant, index) => (
                    <div key={index} className="variantCard">
                      <div className="variantHeader">
                        <span>Variant {index + 1}</span>
                        <button 
                          type="button" 
                          className="removeBtn"
                          onClick={() => removeVariant(index)}
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="formRow">
                        <div className="formGroup">
                          <label>Color</label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            placeholder="e.g., Silver"
                          />
                        </div>
                        <div className="formGroup">
                          <label>Price</label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                            placeholder="999"
                          />
                        </div>
                        <div className="formGroup">
                          <label>Finish</label>
                          <select
                            value={variant.finish}
                            onChange={(e) => updateVariant(index, 'finish', e.target.value)}
                          >
                            <option value="Glossy">Glossy</option>
                            <option value="Matte">Matte</option>
                            <option value="Brushed">Brushed</option>
                          </select>
                        </div>
                      </div>

                      <div className="formRow">
                        <div className="formGroup">
                          <label>Front Image</label>
                          <div className="imageUpload">
                            {variant.frontImage ? (
                              <div className="imagePreview">
                                <img src={variant.frontImage} alt="Front" />
                                <button 
                                  type="button"
                                  onClick={() => updateVariant(index, 'frontImage', '')}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <label className="uploadLabel">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleVariantImageUpload(index, 'frontImage', e.target.files[0]);
                                    }
                                  }}
                                />
                                {uploadingImage ? '⏳ Uploading...' : '📷 Upload Front'}
                              </label>
                            )}
                          </div>
                        </div>
                        <div className="formGroup">
                          <label>Back Image</label>
                          <div className="imageUpload">
                            {variant.backImage ? (
                              <div className="imagePreview">
                                <img src={variant.backImage} alt="Back" />
                                <button 
                                  type="button"
                                  onClick={() => updateVariant(index, 'backImage', '')}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <label className="uploadLabel">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleVariantImageUpload(index, 'backImage', e.target.files[0]);
                                    }
                                  }}
                                />
                                {uploadingImage ? '⏳ Uploading...' : '📷 Upload Back'}
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="addMoreBtn" onClick={addVariant}>
                    + Add Variant
                  </button>
                </div>
              </div>

              <div className="modalFooter">
                <button className="cancelBtn" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button className="saveBtn" onClick={handleSaveProduct}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="ordersTab">
            <h2 className="tabTitle">📦 Order Management</h2>
            
            <div className="ordersTableContainer">
              <table className="ordersTable">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="orderId">#{order._id?.slice(-8)}</td>
                      <td>
                        <div className="customerCell">
                          <div className="customerAvatar">
                            {order.userName?.charAt(0) || 'C'}
                          </div>
                          {order.userName || 'Customer'}
                        </div>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="orderAmount">AED {order.totalAmount || 0}</td>
                      <td>
                        <select
                          value={order.status || 'pending'}
                          className="statusSelect"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="processing">🔄 Processing</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="viewOrderBtn">
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Admin Container */
        .adminContainer {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Admin Header */
        .adminHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(26, 26, 26, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .adminTitle {
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #ffffff 0%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .adminWelcome {
          color: #a0a0a0;
          margin: 5px 0 0 0;
          font-size: 14px;
        }

        .adminLogoutBtn {
          padding: 10px 24px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.3);
          color: #ff3b30;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .adminLogoutBtn:hover {
          background: rgba(255, 59, 48, 0.2);
          transform: translateY(-2px);
        }

        /* Admin Navigation */
        .adminNav {
          display: flex;
          gap: 10px;
          padding: 20px 40px;
          background: rgba(10, 10, 10, 0.8);
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }

        .adminNavBtn {
          padding: 12px 24px;
          background: rgba(26, 26, 26, 0.5);
          border: 1px solid rgba(212, 175, 55, 0.1);
          color: #a0a0a0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .adminNavBtn:hover {
          background: rgba(212, 175, 55, 0.1);
          color: #ffffff;
          transform: translateY(-2px);
        }

        .adminNavBtn.active {
          background: rgba(212, 175, 55, 0.2);
          color: #d4af37;
          border-color: rgba(212, 175, 55, 0.4);
        }

        /* Admin Content */
        .adminContent {
          padding: 40px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .tabTitle {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 20px 0;
          color: #ffffff;
        }

        .tabSubtitle {
          color: #a0a0a0;
          margin-bottom: 30px;
        }

        /* Dashboard Stats */
        .statsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .statCard {
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .statCard:hover {
          transform: translateY(-5px);
          border-color: rgba(212, 175, 55, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .statIcon {
          font-size: 40px;
          width: 70px;
          height: 70px;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .statInfo {
          flex: 1;
        }

        .statValue {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
        }

        .statLabel {
          color: #a0a0a0;
          margin: 5px 0 0 0;
          font-size: 14px;
        }

        /* Recent Activity */
        .recentActivity {
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          padding: 30px;
        }

        .sectionTitle {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #ffffff;
        }

        .activityList {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .activityItem {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(10, 10, 10, 0.5);
          border-radius: 8px;
          border-left: 3px solid #d4af37;
        }

        .activityIcon {
          font-size: 20px;
        }

        .activityDetails {
          flex: 1;
        }

        .activityText {
          margin: 0;
          color: #ffffff;
        }

        .activityTime {
          margin: 5px 0 0 0;
          color: #a0a0a0;
          font-size: 12px;
        }

        .activityAmount {
          font-weight: 700;
          color: #d4af37;
        }

        /* Users Tab */
        .tabHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .searchBox {
          position: relative;
          width: 300px;
        }

        .searchInput {
          width: 100%;
          padding: 12px 40px 12px 20px;
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
        }

        .searchInput::placeholder {
          color: #666;
        }

        .searchIcon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        /* Tables */
        .usersTableContainer, .ordersTableContainer {
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .usersTable, .ordersTable {
          width: 100%;
          border-collapse: collapse;
        }

        .usersTable th, .ordersTable th {
          background: rgba(10, 10, 10, 0.8);
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #d4af37;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }

        .usersTable td, .ordersTable td {
          padding: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .usersTable tr:hover, .ordersTable tr:hover {
          background: rgba(212, 175, 55, 0.05);
        }

        /* User Cell */
        .userCell, .customerCell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .userAvatar, .customerAvatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #d4af37 0%, #f0d97a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #0a0a0a;
          font-size: 16px;
        }

        .userAvatarImg {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(212, 175, 55, 0.3);
        }

        .userNameCell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .userName {
          font-weight: 600;
          color: #ffffff;
        }

        .userDesignation {
          font-size: 12px;
          color: #a0a0a0;
        }

        .themeBadge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .themeBadge.theme-standard {
          background: rgba(52, 199, 89, 0.1);
          color: #34c759;
        }

        .themeBadge.theme-modern {
          background: rgba(156, 136, 255, 0.1);
          color: #9c88ff;
        }

        .themeBadge.theme-epic {
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
        }

        .statusBadge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .statusBadge.purchased {
          background: rgba(52, 199, 89, 0.1);
          color: #34c759;
        }

        .statusBadge.trial {
          background: rgba(255, 149, 0, 0.1);
          color: #ff9500;
        }

        .viewBtn {
          background: rgba(52, 199, 89, 0.1);
          color: #34c759;
        }

        .viewBtn:hover {
          background: rgba(52, 199, 89, 0.2);
          transform: scale(1.1);
        }

        .userIdCell {
          font-family: monospace;
          font-size: 12px;
          color: #a0a0a0;
        }

        /* Role & Status Select */
        .roleSelect, .statusSelect {
          padding: 8px 12px;
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #ffffff;
          cursor: pointer;
        }

        .roleSelect option, .statusSelect option {
          background: #1a1a1a;
        }

        /* Action Buttons */
        .actionButtons {
          display: flex;
          gap: 8px;
        }

        .actionBtn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qrBtn {
          background: rgba(0, 122, 255, 0.1);
          color: #007aff;
        }

        .qrBtn:hover {
          background: rgba(0, 122, 255, 0.2);
          transform: scale(1.1);
        }

        .deleteBtn {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }

        .deleteBtn:hover {
          background: rgba(255, 59, 48, 0.2);
          transform: scale(1.1);
        }

        /* QR Tab */
        .qrGenerator {
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
        }

        .selectedUserInfo {
          background: rgba(212, 175, 55, 0.1);
          border-left: 4px solid #d4af37;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .qrDisplaySection {
          text-align: center;
        }

        .qrImageWrapper {
          display: inline-block;
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 2px solid rgba(212, 175, 55, 0.3);
        }

        .qrImage {
          width: 250px;
          height: 250px;
        }

        .qrActions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .downloadQrBtn, .copyQrBtn, .clearQrBtn {
          padding: 12px 24px;
          border: 2px solid;
          border-radius: 8px;
          background: rgba(26, 26, 26, 0.8);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .downloadQrBtn {
          color: #34c759;
          border-color: rgba(52, 199, 89, 0.3);
        }

        .downloadQrBtn:hover {
          background: rgba(52, 199, 89, 0.1);
          transform: translateY(-2px);
        }

        .copyQrBtn {
          color: #007aff;
          border-color: rgba(0, 122, 255, 0.3);
        }

        .copyQrBtn:hover {
          background: rgba(0, 122, 255, 0.1);
          transform: translateY(-2px);
        }

        .clearQrBtn {
          color: #ff3b30;
          border-color: rgba(255, 59, 48, 0.3);
        }

        .clearQrBtn:hover {
          background: rgba(255, 59, 48, 0.1);
          transform: translateY(-2px);
        }

        .qrInstructions {
          text-align: center;
          padding: 40px;
        }

        .qrInstructionIcon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .qrInstructions h3 {
          margin: 0 0 10px 0;
          color: #ffffff;
        }

        .qrInstructions p {
          color: #a0a0a0;
          margin-bottom: 30px;
        }

        .goToUsersBtn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .goToUsersBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 122, 255, 0.3);
        }

        /* QR Guide */
        .qrGuide {
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          padding: 30px;
        }

        .guideTitle {
          font-size: 20px;
          margin: 0 0 20px 0;
          color: #ffffff;
        }

        .guideSteps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .guideStep {
          background: rgba(10, 10, 10, 0.5);
          padding: 20px;
          border-radius: 8px;
          border-left: 3px solid #d4af37;
        }

        .stepNumber {
          width: 30px;
          height: 30px;
          background: #d4af37;
          color: #0a0a0a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 15px;
        }

        /* Products Tab */
        .addProductBtn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .addProductBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(52, 199, 89, 0.3);
        }

        .productsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .productCard {
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .productCard:hover {
          transform: translateY(-5px);
          border-color: rgba(212, 175, 55, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .productImage {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .productImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .productInfo {
          padding: 20px;
        }

        .productTitle {
          margin: 0 0 10px 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
        }

        .productCategory {
          color: #a0a0a0;
          font-size: 14px;
          margin: 0 0 15px 0;
        }

        .productPrice {
          font-size: 20px;
          font-weight: 700;
          color: #d4af37;
          margin-bottom: 15px;
        }

        .productVariants {
          color: #a0a0a0;
          font-size: 12px;
          margin: 0 0 15px 0;
        }

        .originalPrice {
          text-decoration: line-through;
          color: #666;
          margin-left: 10px;
          font-size: 16px;
        }

        .productActions {
          display: flex;
          gap: 10px;
        }

        .editBtn, .deleteBtn {
          flex: 1;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .editBtn {
          background: rgba(0, 122, 255, 0.1);
          color: #007aff;
        }

        .editBtn:hover {
          background: rgba(0, 122, 255, 0.2);
        }

        .deleteBtn {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }

        .deleteBtn:hover {
          background: rgba(255, 59, 48, 0.2);
        }

        .emptyState {
          text-align: center;
          padding: 60px 20px;
          background: rgba(26, 26, 26, 0.5);
          border-radius: 12px;
          border: 1px dashed rgba(212, 175, 55, 0.2);
        }

        .emptyIcon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .emptyState h3 {
          color: #ffffff;
          margin: 0 0 10px 0;
        }

        .emptyState p {
          color: #a0a0a0;
          margin: 0;
        }

        /* Product Modal */
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .productModal {
          background: #1a1a1a;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }

        .modalHeader h2 {
          margin: 0;
          color: #ffffff;
          font-size: 20px;
        }

        .closeModalBtn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .closeModalBtn:hover {
          background: rgba(255, 59, 48, 0.2);
        }

        .modalBody {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .formSection {
          margin-bottom: 30px;
        }

        .sectionLabel {
          color: #d4af37;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 15px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .formGroup {
          margin-bottom: 15px;
        }

        .formGroup label {
          display: block;
          color: #a0a0a0;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .formGroup input,
        .formGroup textarea,
        .formGroup select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .formGroup input:focus,
        .formGroup textarea:focus,
        .formGroup select:focus {
          outline: none;
          border-color: rgba(212, 175, 55, 0.5);
        }

        .formGroup input::placeholder,
        .formGroup textarea::placeholder {
          color: #666;
        }

        .formGroup select option {
          background: #1a1a1a;
        }

        .formRow {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .featureRow {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .featureRow input {
          flex: 1;
          padding: 10px 14px;
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
        }

        .removeBtn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .removeBtn:hover {
          background: rgba(255, 59, 48, 0.2);
        }

        .addMoreBtn {
          padding: 10px 20px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px dashed rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          color: #d4af37;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          width: 100%;
        }

        .addMoreBtn:hover {
          background: rgba(212, 175, 55, 0.2);
        }

        .variantCard {
          background: rgba(10, 10, 10, 0.3);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
        }

        .variantHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          color: #ffffff;
          font-weight: 600;
        }

        .imageUpload {
          border: 2px dashed rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          overflow: hidden;
        }

        .uploadLabel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          cursor: pointer;
          color: #a0a0a0;
          transition: all 0.3s ease;
        }

        .uploadLabel:hover {
          background: rgba(212, 175, 55, 0.05);
          color: #d4af37;
        }

        .uploadLabel input {
          display: none;
        }

        .imagePreview {
          position: relative;
          width: 100%;
          height: 100px;
        }

        .imagePreview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .imagePreview button {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 59, 48, 0.9);
          color: white;
          cursor: pointer;
          font-size: 12px;
        }

        .modalFooter {
          display: flex;
          gap: 15px;
          padding: 20px 24px;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }

        .cancelBtn {
          flex: 1;
          padding: 14px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #a0a0a0;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancelBtn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .saveBtn {
          flex: 1;
          padding: 14px 24px;
          background: linear-gradient(135deg, #d4af37 0%, #f0d97a 100%);
          border: none;
          border-radius: 8px;
          color: #0a0a0a;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .saveBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
        }

        /* Orders Tab */
        .orderId {
          font-family: monospace;
          font-size: 12px;
          color: #a0a0a0;
        }

        .orderAmount {
          font-weight: 700;
          color: #d4af37;
        }

        .viewOrderBtn {
          padding: 8px 16px;
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .viewOrderBtn:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: translateY(-2px);
        }

        /* Loading State */
        .adminLoading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .adminLoader {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(212, 175, 55, 0.1);
          border-top: 3px solid #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .adminContent {
            padding: 20px;
          }
          
          .statsGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .adminHeader {
            padding: 15px 20px;
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .adminNav {
            padding: 15px 20px;
            overflow-x: auto;
            white-space: nowrap;
          }
          
          .adminNavBtn {
            padding: 10px 16px;
            font-size: 14px;
          }
          
          .statsGrid {
            grid-template-columns: 1fr;
          }
          
          .tabHeader {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .searchBox {
            width: 100%;
          }
          
          .usersTable, .ordersTable {
            display: block;
            overflow-x: auto;
          }
          
          .qrActions {
            flex-direction: column;
            align-items: center;
          }
          
          .qrImage {
            width: 200px;
            height: 200px;
          }
          
          .guideSteps {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .adminTitle {
            font-size: 24px;
          }
          
          .statIcon {
            width: 50px;
            height: 50px;
            font-size: 28px;
          }
          
          .statValue {
            font-size: 24px;
          }
          
          .productsGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;