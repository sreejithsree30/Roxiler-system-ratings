const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-here';


app.use(cors());
app.use(express.json());


let users = [
  {
    id: 1,
    name: 'System Admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('Admin123!', 10),
    address: '123 Admin Street',
    role: 'admin'
  },
  {
    id: 2,
    name: 'Store Owner One',
    email: 'store1@example.com',
    password: bcrypt.hashSync('Store123!', 10),
    address: '456 Store Avenue',
    role: 'store_owner',
    storeId: 1
  },
  {
    id: 3,
    name: 'Normal User',
    email: 'user@example.com',
    password: bcrypt.hashSync('User123!', 10),
    address: '789 User Road',
    role: 'normal'
  }
];

let stores = [
  {
    id: 1,
    name: 'Fresh Grocery Store',
    email: 'store1@example.com',
    address: '456 Store Avenue',
    ownerId: 2,
    ratings: []
  },
  {
    id: 2,
    name: 'Electronics Hub',
    email: 'electronics@example.com',
    address: '321 Tech Boulevard',
    ownerId: null,
    ratings: []
  }
];

let ratings = [
  {
    id: 1,
    userId: 3,
    storeId: 1,
    rating: 4,
    createdAt: new Date().toISOString()
  }
];


const generateId = (array) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

const calculateAverageRating = (storeId) => {
  const storeRatings = ratings.filter(r => r.storeId === storeId);
  if (storeRatings.length === 0) return 0;
  const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / storeRatings.length) * 10) / 10;
};


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};


const validateUser = (userData) => {
  const errors = [];
  
  if (!userData.name || userData.name.length < 6 || userData.name.length > 20) {
    errors.push('Name must be between 6 and 20 characters');
  }
  
  if (!userData.address || userData.address.length > 400) {
    errors.push('Address must not exceed 400 characters');
  }
  
  if (!userData.password || userData.password.length < 8 || userData.password.length > 16) {
    errors.push('Password must be between 8 and 16 characters');
  }
  
  if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(userData.password)) {
    errors.push('Password must contain at least one uppercase letter and one special character');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userData.email || !emailRegex.test(userData.email)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
};


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      storeId: user.storeId
    }
  });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, address } = req.body;
  
  const errors = validateUser({ name, email, password, address });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: generateId(users),
    name,
    email,
    password: hashedPassword,
    address,
    role: 'normal'
  };
  
  users.push(newUser);
  
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      address: newUser.address
    }
  });
});

app.get('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { name, email, address, role } = req.query;
  
  let filteredUsers = users.filter(u => u.role !== 'admin' || u.id === req.user.id);
  
  if (name) {
    filteredUsers = filteredUsers.filter(u => 
      u.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  if (email) {
    filteredUsers = filteredUsers.filter(u => 
      u.email.toLowerCase().includes(email.toLowerCase())
    );
  }
  
  if (address) {
    filteredUsers = filteredUsers.filter(u => 
      u.address.toLowerCase().includes(address.toLowerCase())
    );
  }
  
  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }
  
  const usersWithRatings = filteredUsers.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    rating: user.role === 'store_owner' ? calculateAverageRating(user.storeId) : null
  }));
  
  res.json(usersWithRatings);
});

app.post('/api/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { name, email, password, address, role } = req.body;
  
  const errors = validateUser({ name, email, password, address });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: generateId(users),
    name,
    email,
    password: hashedPassword,
    address,
    role: role || 'normal'
  };
  
  users.push(newUser);
  
  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    address: newUser.address,
    role: newUser.role
  });
});

app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ error: 'Can only update own password' });
  }
  
  const errors = validateUser({ name: 'Valid Name', email: 'valid@email.com', password, address: 'Valid Address' });
  const passwordErrors = errors.filter(err => err.includes('Password'));
  
  if (passwordErrors.length > 0) {
    return res.status(400).json({ errors: passwordErrors });
  }
  
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  users[userIndex].password = hashedPassword;
  
  res.json({ message: 'Password updated successfully' });
});


app.get('/api/stores', authenticateToken, (req, res) => {
  const { name, address } = req.query;
  
  let filteredStores = [...stores];
  
  if (name) {
    filteredStores = filteredStores.filter(s => 
      s.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  if (address) {
    filteredStores = filteredStores.filter(s => 
      s.address.toLowerCase().includes(address.toLowerCase())
    );
  }
  
  const storesWithRatings = filteredStores.map(store => {
    const averageRating = calculateAverageRating(store.id);
    const userRating = ratings.find(r => r.storeId === store.id && r.userId === req.user.id);
    
    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      rating: averageRating,
      userRating: userRating ? userRating.rating : null
    };
  });
  
  res.json(storesWithRatings);
});

app.post('/api/stores', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { name, email, address } = req.body;
  
  if (!name || !email || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const newStore = {
    id: generateId(stores),
    name,
    email,
    address,
    ownerId: null,
    ratings: []
  };
  
  stores.push(newStore);
  
  res.status(201).json(newStore);
});

// Rating routes
app.post('/api/ratings', authenticateToken, authorizeRole(['normal']), (req, res) => {
  const { storeId, rating } = req.body;
  
  if (!storeId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Valid store ID and rating (1-5) are required' });
  }
  
  const store = stores.find(s => s.id === storeId);
  if (!store) {
    return res.status(404).json({ error: 'Store not found' });
  }
  
  const existingRating = ratings.find(r => r.storeId === storeId && r.userId === req.user.id);
  
  if (existingRating) {
    existingRating.rating = rating;
    existingRating.createdAt = new Date().toISOString();
  } else {
    const newRating = {
      id: generateId(ratings),
      userId: req.user.id,
      storeId,
      rating,
      createdAt: new Date().toISOString()
    };
    ratings.push(newRating);
  }
  
  res.json({ message: 'Rating submitted successfully' });
});


app.get('/api/dashboard/stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const stats = {
    totalUsers: users.filter(u => u.role !== 'admin').length,
    totalStores: stores.length,
    totalRatings: ratings.length
  };
  
  res.json(stats);
});

app.get('/api/dashboard/store-ratings', authenticateToken, authorizeRole(['store_owner']), (req, res) => {
  const userStore = stores.find(s => s.ownerId === req.user.id);
  
  if (!userStore) {
    return res.status(404).json({ error: 'Store not found' });
  }
  
  const storeRatings = ratings.filter(r => r.storeId === userStore.id);
  const averageRating = calculateAverageRating(userStore.id);
  
  const ratingsWithUsers = storeRatings.map(rating => {
    const user = users.find(u => u.id === rating.userId);
    return {
      id: rating.id,
      rating: rating.rating,
      createdAt: rating.createdAt,
      user: {
        name: user.name,
        email: user.email
      }
    };
  });
  
  res.json({
    averageRating,
    ratings: ratingsWithUsers
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});