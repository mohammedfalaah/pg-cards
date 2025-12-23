import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = ({ user, token, onLogout }) => {
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

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersRes = await axios.get(
        'https://pg-cards.vercel.app/admin/users',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(usersRes.data.users || []);

      // Fetch products
      const productsRes = await axios.get(
        'https://pg-cards.vercel.app/admin/products',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(productsRes.data.products || []);

      // Fetch orders
      const ordersRes = await axios.get(
        'https://pg-cards.vercel.app/admin/orders',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(ordersRes.data.orders || []);

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      setStats({
        totalUsers: usersRes.data.users?.length || 0,
        totalOrders: ordersRes.data.orders?.length || 0,
        totalRevenue,
        activeProducts: productsRes.data.products?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user._id?.toLowerCase().includes(userSearch.toLowerCase())
  );

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
        <button 
          className={`adminNavBtn ${activeTab === 'qrcodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('qrcodes')}
        >
          🔳 QR Codes
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>User ID</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="userCell">
                          <div className="userAvatar">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          {user.name || 'No Name'}
                        </div>
                      </td>
                      <td>{user.email || 'No Email'}</td>
                      <td className="userIdCell">{user._id?.slice(-8) || 'N/A'}</td>
                      <td>
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="roleSelect"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      </td>
                      <td>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      <td>
                        <div className="actionButtons">
                          <button
                            className="actionBtn qrBtn"
                            onClick={() => generateQRForUser(user._id, user.name)}
                            title="Generate QR Code"
                          >
                            🔳
                          </button>
                          <button
                            className="actionBtn deleteBtn"
                            onClick={() => deleteUser(user._id)}
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QR Codes Tab */}
        {activeTab === 'qrcodes' && (
          <div className="qrTab">
            <h2 className="tabTitle">🔳 QR Code Management</h2>
            <p className="tabSubtitle">
              Generate and manage QR codes for user profiles
            </p>

            <div className="qrGenerator">
              {selectedUser && (
                <div className="selectedUserInfo">
                  <h3>QR Code for: <strong>{selectedUser.name}</strong></h3>
                  <p>User ID: {selectedUser.id}</p>
                </div>
              )}

              {qrData ? (
                <div className="qrDisplaySection">
                  <div className="qrImageWrapper">
                    <img 
                      src={qrData} 
                      alt="User QR Code" 
                      className="qrImage"
                    />
                  </div>
                  
                  <div className="qrActions">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = qrData;
                        link.download = `${selectedUser?.name || 'user'}-qr.png`;
                        link.click();
                      }}
                      className="downloadQrBtn"
                    >
                      📥 Download QR
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrData);
                        toast.success('QR copied to clipboard');
                      }}
                      className="copyQrBtn"
                    >
                      📋 Copy QR
                    </button>
                    
                    <button
                      onClick={() => setQrData('')}
                      className="clearQrBtn"
                    >
                      🗑️ Clear QR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="qrInstructions">
                  <div className="qrInstructionIcon">🔳</div>
                  <h3>Generate QR Code</h3>
                  <p>Select a user from the Users tab and click the QR button to generate their profile QR code.</p>
                  <button
                    className="goToUsersBtn"
                    onClick={() => setActiveTab('users')}
                  >
                    👥 Go to Users
                  </button>
                </div>
              )}
            </div>

            {/* QR Code Usage Guide */}
            <div className="qrGuide">
              <h3 className="guideTitle">📚 QR Code Usage Guide</h3>
              <div className="guideSteps">
                <div className="guideStep">
                  <div className="stepNumber">1</div>
                  <p>Navigate to <strong>Users</strong> tab</p>
                </div>
                <div className="guideStep">
                  <div className="stepNumber">2</div>
                  <p>Click the <strong>🔳 QR button</strong> on any user</p>
                </div>
                <div className="guideStep">
                  <div className="stepNumber">3</div>
                  <p>Download or copy the generated QR code</p>
                </div>
                <div className="guideStep">
                  <div className="stepNumber">4</div>
                  <p>Share QR code with user for profile access</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="productsTab">
            <div className="tabHeader">
              <h2 className="tabTitle">🛍️ Product Management</h2>
              <button className="addProductBtn">
                ➕ Add New Product
              </button>
            </div>

            <div className="productsGrid">
              {products.map((product) => (
                <div key={product._id} className="productCard">
                  <div className="productImage">
                    <img 
                      src={product.image || 'https://via.placeholder.com/150'} 
                      alt={product.title}
                    />
                  </div>
                  <div className="productInfo">
                    <h3 className="productTitle">{product.title}</h3>
                    <p className="productCategory">{product.category}</p>
                    <div className="productPrice">
                      AED {product.price}
                      {product.originalPrice && (
                        <span className="originalPrice">
                          AED {product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="productActions">
                      <button className="editBtn">✏️ Edit</button>
                      <button className="deleteBtn">🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              ))}
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
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #d4af37 0%, #f0d97a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #0a0a0a;
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