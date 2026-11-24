import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('reusehub_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authBranch, setAuthBranch] = useState('')
  const [authSection, setAuthSection] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // App & Data States
  const [items, setItems] = useState([])
  const [requests, setRequests] = useState([])
  const [page, setPage] = useState('home')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedItem, setSelectedItem] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [inputCodes, setInputCodes] = useState({})

  // Fetch items from MongoDB via backend API
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`)
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setItems(result.data.map((item) => ({ ...item, id: item._id })))
      }
    } catch (fetchError) {
      console.error('Failed to load items from backend:', fetchError)
      setError('Could not connect to backend server. Make sure server is running on http://localhost:5000')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch requests from MongoDB via backend API
  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`)
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setRequests(result.data.map((req) => ({ ...req, id: req._id })))
      }
    } catch (fetchError) {
      console.error('Failed to load requests from backend:', fetchError)
    }
  }

  useEffect(() => {
    if (user) {
      fetchItems()
      fetchRequests()
    }
  }, [user])

  const goTo = (nextPage) => {
    setPage(nextPage)
    setSelectedItem(null)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Authentication (Sign In & Sign Up)
  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      if (authMode === 'register') {
        // Sign Up (First-time account creation)
        if (!authName || !authEmail || !authPassword || !authBranch || !authSection) {
          throw new Error('Please fill in all details (Name, Email, Password, Branch, Section)')
        }
        if (authPassword.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword,
            branch: authBranch.trim(),
            section: authSection.trim().toUpperCase(),
          }),
        })

        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Registration failed')
        }

        // Store user and token
        localStorage.setItem('reusehub_user', JSON.stringify(result.user))
        localStorage.setItem('reusehub_token', result.token)
        setUser(result.user)
        setNotice(`Welcome to ReUseHUB, ${result.user.name}! Your account has been created.`)
      } else {
        // Sign In (Returning user)
        if (!authEmail || !authPassword) {
          throw new Error('Please enter both your college email and password')
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail.trim(),
            password: authPassword,
          }),
        })

        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Login failed. Invalid email or password.')
        }

        localStorage.setItem('reusehub_user', JSON.stringify(result.user))
        localStorage.setItem('reusehub_token', result.token)
        setUser(result.user)
        setNotice(`Welcome back, ${result.user.name}!`)
      }
    } catch (err) {
      setAuthError(err.message || 'An error occurred during authentication.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('reusehub_user')
    localStorage.removeItem('reusehub_token')
    setUser(null)
    setPage('home')
    setNotice('You have been logged out safely.')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    setImagePreview('')
    setImageFile(null)
    setError('')
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should not exceed 5 MB.')
      event.target.value = ''
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    const name = form.elements['item-name'].value.trim()
    const itemCategory = form.elements['item-category'].value
    const condition = form.elements['item-condition'].value
    const description = form.elements['item-description'].value.trim()

    if (!name || !itemCategory || !condition || !description) {
      setError('Please complete all required fields.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const formData = new FormData()
      formData.append('name', name)
      formData.append('contributorName', user.name)
      formData.append('userId', user.id)
      formData.append('contributorBranch', user.branch)
      formData.append('contributorSection', user.section)
      formData.append('category', itemCategory)
      formData.append('condition', condition)
      formData.append('description', description)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to list item')
      }

      const created = { ...result.data, id: result.data._id }
      setItems((current) => [created, ...current])
      
      setNotice('Your item has been listed successfully! When you hand it over to a student and enter their confirmation code, your Certificate of Appreciation will be issued.')
      setError('')
      setImagePreview('')
      setImageFile(null)
      form.reset()
      setPage('browse')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (submitError) {
      setError(submitError.message || 'Error listing item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = useMemo(() => items
    .filter((item) => {
      const term = search.toLowerCase()
      const matchesSearch = item.name.toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      return matchesSearch && (category === 'All' || item.category === category)
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      if (sortOrder === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      return a.name.localeCompare(b.name)
    }), [items, search, category, sortOrder])

  const openBrowse = (selectedCategory = 'All') => {
    setCategory(selectedCategory)
    setSearch('')
    goTo('browse')
  }

  const requestItem = async (item) => {
    const targetItemId = item._id || item.id

    // Check if contributor is requesting their own item
    if (item.userId === user.id || item.contributorName === user.name) {
      setError('You contributed this item! You cannot request your own item.')
      return
    }

    if (requests.some((request) => request.itemId === targetItemId)) {
      setNotice('You have already submitted a request for this item.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: targetItemId,
          itemName: item.name,
          contributorName: item.contributorName,
          requesterName: user.name,
          requesterId: user.id,
          requesterBranch: user.branch,
          requesterSection: user.section,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit request')
      }

      const recordedRequest = { ...result.data, id: result.data._id }
      setRequests((current) => [recordedRequest, ...current])
      setNotice(`Request submitted! Your 4-digit Handover Code is: ${recordedRequest.handoverCode}. Share it with ${item.contributorName} upon receiving the item.`)
    } catch (requestError) {
      setError(requestError.message || 'Could not submit request.')
    }
  }

  // Handle Handover Verification: Requires the 4-digit OTP provided by receiver
  const handleHandover = async (request, enteredCode) => {
    setError('')
    if (!enteredCode || enteredCode.trim().length !== 4) {
      setError('Please enter the 4-digit confirmation code given by the receiver.')
      return
    }

    try {
      const targetId = request.id || request._id
      const response = await fetch(`${API_BASE_URL}/requests/${targetId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: enteredCode.trim() }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Verification failed. Incorrect code.')
      }

      // Update requests in state
      setRequests((current) =>
        current.map((r) =>
          r.id === targetId || r._id === targetId
            ? { ...r, status: 'Completed / Handed Over' }
            : r
        )
      )

      // Update item availability in state
      setItems((current) =>
        current.map((item) =>
          item.id === request.itemId || item._id === request.itemId
            ? { ...item, isAvailable: false }
            : item
        )
      )

      // Clear code input
      setInputCodes((prev) => ({ ...prev, [targetId]: '' }))

      // Generate the Certificate of Appreciation upon verified handover!
      setCertificate({
        contributorName: request.contributorName,
        itemName: request.itemName,
      })

      setNotice(`🎉 Code Verified! You have successfully handed over "${request.itemName}". Your Certificate of Appreciation is unlocked below!`)
      
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 250)
    } catch (handoverError) {
      setError(handoverError.message || 'Could not complete handover.')
    }
  }

  // Items contributed by the logged in student
  const myContributedItems = items.filter(
    (item) => item.userId === user?.id || item.contributorName === user?.name
  )
  
  // Requests made by the logged in student
  const myMadeRequests = requests.filter(
    (request) => request.requesterId === user?.id || request.requesterName === user?.name
  )

  const requestedIds = requests.map((request) => request.itemId)

  // -------------------------------------------------------------
  // IF USER IS NOT LOGGED IN: DISPLAY STUDENT LOGIN / SIGN UP
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="app">
        <nav className="navbar">
          <button className="brand-button" style={{ cursor: 'default' }}>♻ ReUseHUB</button>
          <span style={{ color: '#287448', fontWeight: 600, fontSize: '14px' }}>Campus Student Portal</span>
        </nav>

        <div className="auth-wrapper">
          <div className="auth-card">
            <h2>{authMode === 'login' ? 'Student Sign In' : 'Create Student Account'}</h2>
            <p className="auth-subtitle">
              {authMode === 'login'
                ? 'Welcome back! Sign in with your college email to access campus items.'
                : 'Join ReUseHUB to share, discover, and reuse campus items.'}
            </p>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
              >
                First Time? Create Account
              </button>
            </div>

            {authError && (
              <div className="app-error" style={{ margin: '0 0 18px', padding: '10px 14px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === 'register' && (
                <>
                  <label>
                    Full Name
                    <input
                      type="text"
                      placeholder="e.g. Darshan Ankalagi"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label>
                      Branch
                      <select
                        value={authBranch}
                        onChange={(e) => setAuthBranch(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Branch</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Science">Information Science</option>
                        <option value="AI & Data Science">AI & Data Science</option>
                        <option value="Electronics & Comm">Electronics & Comm</option>
                        <option value="Electrical & Electronics">Electrical & Electronics</option>
                        <option value="Mechanical Engg">Mechanical Engg</option>
                        <option value="Civil Engg">Civil Engg</option>
                      </select>
                    </label>

                    <label>
                      Section
                      <select
                        value={authSection}
                        onChange={(e) => setAuthSection(e.target.value)}
                        required
                      >
                        <option value="" disabled>Section</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

              <label>
                College Email ID
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  placeholder={authMode === 'register' ? 'Min 6 characters' : 'Enter your password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="primary-btn" disabled={authLoading}>
                {authLoading ? 'Verifying...' : authMode === 'login' ? 'Sign In to ReUseHUB' : 'Register & Start Reusing'}
              </button>
            </form>
          </div>
        </div>

        <footer>
          <h3>Small actions. A greener campus.</h3>
          <p>ReUseHUB · Give Unused Items a New Life. ♻</p>
        </footer>
      </div>
    )
  }

  // -------------------------------------------------------------
  // LOGGED IN VIEW: FULL REUSEHUB APPLICATION
  // -------------------------------------------------------------
  return (
    <div className="app">
      <nav className="navbar">
        <button className="brand-button" onClick={() => goTo('home')}>♻ ReUseHUB</button>
        <div className="nav-links">
          <button className={page === 'home' ? 'nav-active' : ''} onClick={() => goTo('home')}>Home</button>
          <button className={page === 'browse' || page === 'details' ? 'nav-active' : ''} onClick={() => openBrowse()}>Browse Items</button>
          <button className={page === 'list' ? 'nav-active' : ''} onClick={() => goTo('list')}>List an Item</button>
          <button className={page === 'activity' ? 'nav-active' : ''} onClick={() => goTo('activity')}>My Activity</button>
          
          {/* Logged in User Badge & Logout */}
          <div className="user-badge">
            <span>👤 {user.name} ({user.branch} - Sec {user.section})</span>
            <button type="button" className="logout-btn" onClick={handleLogout} title="Log out of your account">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {notice && <div className="app-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
      {error && <div className="app-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}

      {page === 'home' && (
        <>
          <section className="hero">
            <p className="tagline">A CAMPUS COMMUNITY FOR REUSE</p>
            <h1>One person's unused item,<span> another person's treasure.</span></h1>
            <p className="description">Give your stationery and electronic gadgets a second life. Share what you no longer need and discover something useful.</p>
            <div className="buttons">
              <button className="primary-btn" onClick={() => openBrowse()}>Explore Items →</button>
              <button className="secondary-btn" onClick={() => goTo('list')}>+ List an Item</button>
            </div>
          </section>
          <section className="home-categories">
            <p className="tagline">EXPLORE REUSEHUB</p>
            <h2>What can you give a second life?</h2>
            <p className="browse-description">Choose a category and discover useful items shared by fellow students.</p>
            <div className="category-grid">
              <button className="category-card" onClick={() => openBrowse('Stationery')}>
                <span className="category-icon">📚</span><h3>Stationery</h3><p>Books, notebooks, calculators and more.</p><span className="category-link">Explore stationery →</span>
              </button>
              <button className="category-card" onClick={() => openBrowse('Electronics')}>
                <span className="category-icon">🎧</span><h3>Electronic Gadgets</h3><p>Chargers, keyboards, headphones and useful devices.</p><span className="category-link">Explore electronics →</span>
              </button>
            </div>
          </section>
          <section className="home-cta">
            <h2>Have something you no longer need?</h2>
            <p>Pass it on to another student and make reuse part of campus life.</p>
            <button className="primary-btn" onClick={() => goTo('list')}>List an Item</button>
          </section>
        </>
      )}

      {page === 'browse' && (
        <section className="categories page-section">
          <p className="tagline">EXPLORE REUSEHUB</p>
          <h2>Browse Available Items</h2>
          <p className="browse-description">Find something useful from your campus community.</p>
          <input type="search" placeholder="Search books, calculators, headphones..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="filter-buttons">
            {['All', 'Stationery', 'Electronics'].map((name) => <button key={name} type="button" className={category === name ? 'filter active' : 'filter'} onClick={() => setCategory(name)}>{name}</button>)}
          </div>
          <div className="sorting-row">
            <p className="result-count">{isLoading ? 'Loading items from database...' : `${filteredItems.length} items found`}</p>
            <label htmlFor="sort-items">Sort by:</label>
            <select id="sort-items" className="sort-select" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Name: A to Z</option>
            </select>
          </div>
          <div className="item-grid">
            {filteredItems.map((item) => <article className="item-card" key={item.id}>
              <button className="item-card-open" onClick={() => { setSelectedItem(item); setPage('details'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label={`View ${item.name} details`}>
                <div className="item-image-placeholder">{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📷</span>}</div>
                <p className="item-category">{item.category}</p><h3>{item.name}</h3><p>Condition: {item.condition}</p>
                {item.isAvailable === false ? (
                  <span className="available" style={{ color: '#777' }}>● Handed Over</span>
                ) : (
                  <span className="available">● Available</span>
                )}
              </button>
              <button className="small-action-btn" onClick={() => { setSelectedItem(item); setPage('details'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>View details</button>
            </article>)}
          </div>
          {!isLoading && filteredItems.length === 0 && <p className="empty-message">No items found. Try another search or category.</p>}
        </section>
      )}

      {page === 'details' && selectedItem && (
        <section className="detail-section page-section">
          <button className="back-link" onClick={() => goTo('browse')}>← Back to Browse</button>
          <div className="detail-card">
            <div className="detail-image">{selectedItem.image ? <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : <span>📷</span>}</div>
            <div className="detail-info">
              <p className="item-category">{selectedItem.category}</p><h2>{selectedItem.name}</h2>
              <p><strong>Condition:</strong> {selectedItem.condition}</p>
              <p><strong>Contributed by:</strong> {selectedItem.contributorName} {selectedItem.contributorBranch ? `(${selectedItem.contributorBranch} - Sec ${selectedItem.contributorSection})` : ''}</p>
              <p>{selectedItem.description || 'No description provided.'}</p>
              
              {selectedItem.isAvailable === false ? (
                <>
                  <span className="available" style={{ color: '#777' }}>● Handed Over / Donated</span>
                  <button className="primary-btn request-btn" disabled style={{ background: '#888', cursor: 'not-allowed' }}>
                    Item Already Handed Over
                  </button>
                </>
              ) : selectedItem.userId === user.id || selectedItem.contributorName === user.name ? (
                <div style={{ background: '#f4f8f4', border: '1px solid #d4e2d2', padding: '12px', borderRadius: '8px', color: '#1e5a35', fontWeight: 600 }}>
                  You listed this item. You can manage incoming requests in <strong>My Activity</strong>.
                </div>
              ) : (
                <>
                  <span className="available">● Available</span>
                  <button className="primary-btn request-btn" onClick={() => requestItem(selectedItem)}>
                    {requestedIds.includes(selectedItem.id) ? 'Request Submitted' : 'Request This Item'}
                  </button>
                </>
              )}
              <p className="demo-note">Connected to MongoDB Atlas: requests are recorded with student identity and OTP verification.</p>
            </div>
          </div>
        </section>
      )}

      {page === 'list' && (
        <section className="upload-section page-section">
          <p className="tagline">PASS IT ON</p><h2>List an Item</h2><p>Share something you no longer need with another student.</p>
          <div className="upload-placeholder"><form onSubmit={handleSubmit}>
            <label htmlFor="contributor-name">Contributing as</label>
            <input
              id="contributor-name"
              name="contributor-name"
              type="text"
              value={`${user.name} (${user.branch} - Sec ${user.section})`}
              disabled
              style={{ background: '#f0f4ef', color: '#263d2e', fontWeight: 600 }}
            />
            
            <label htmlFor="item-name">Item Name</label><input id="item-name" name="item-name" type="text" placeholder="e.g. Scientific Calculator" required />
            <label htmlFor="item-category">Category</label><select id="item-category" name="item-category" required defaultValue=""><option value="" disabled>Select a category</option><option value="Stationery">Stationery</option><option value="Electronics">Electronics</option></select>
            <label htmlFor="item-condition">Condition</label><select id="item-condition" name="item-condition" required defaultValue=""><option value="" disabled>Select condition</option><option value="Like New">Like New</option><option value="Good">Good</option><option value="Usable">Usable</option></select>
            <label htmlFor="item-description">Description</label><textarea id="item-description" name="item-description" placeholder="Describe your item..." rows="4" required />
            <label htmlFor="item-image">Upload Item Photo (maximum 5 MB)</label><input id="item-image" name="item-image" type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <div className="image-preview"><p>Photo Preview:</p><img src={imagePreview} alt="Preview of your item" /><button type="button" onClick={() => { setImagePreview(''); setImageFile(null); const el = document.getElementById('item-image'); if (el) el.value = '' }}>Remove Photo</button></div>}
            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Listing item in database...' : 'Submit Item'}
            </button>
          </form></div>
        </section>
      )}

      {page === 'activity' && (
        <section className="activity-section page-section">
          <p className="tagline">YOUR REUSEHUB DASHBOARD</p><h2>My Activity</h2><p className="browse-description">Live record of your contributions and requests stored in MongoDB Atlas.</p>
          
          {/* Student Profile Card */}
          <div className="profile-card">
            <div>
              <h3 style={{ margin: '0 0 6px', color: '#263d2e' }}>🎓 {user.name}</h3>
              <p style={{ margin: 0, color: '#4a6252', fontSize: '14px' }}>
                <strong>Branch:</strong> {user.branch} &nbsp;|&nbsp; <strong>Section:</strong> {user.section} &nbsp;|&nbsp; <strong>Email:</strong> {user.email}
              </p>
            </div>
            <div className="user-badge" style={{ background: '#fff', border: '1px solid #cbdacb' }}>
              <span>Verified Student Account</span>
            </div>
          </div>

          <div className="activity-stats"><div><strong>{myContributedItems.length}</strong><span>Items you listed</span></div><div><strong>{myMadeRequests.length}</strong><span>Requests you made</span></div></div>
          
          <h3 className="activity-heading">Items You Listed (Donor Records)</h3>
          {myContributedItems.length ? (
            <div className="activity-list">
              {[...myContributedItems].reverse().map((item) => {
                const matchedRequest = requests.find((r) => r.itemId === item.id || r.itemId === item._id)
                return (
                  <div className="activity-row" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eef2ef', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.category} · Condition: {item.condition}</p>
                      {matchedRequest && matchedRequest.status === 'Request submitted' && (
                        <p style={{ color: '#c05621', fontWeight: 600, marginTop: '6px' }}>
                          📩 Requested by: {matchedRequest.requesterName} {matchedRequest.requesterBranch ? `(${matchedRequest.requesterBranch} - Sec ${matchedRequest.requesterSection})` : ''}
                        </p>
                      )}
                      {matchedRequest && matchedRequest.status === 'Completed / Handed Over' && (
                        <p style={{ color: '#287448', fontWeight: 600, marginTop: '6px' }}>
                          ✅ Handed over to: {matchedRequest.requesterName} {matchedRequest.requesterBranch ? `(${matchedRequest.requesterBranch} - Sec ${matchedRequest.requesterSection})` : ''}
                        </p>
                      )}
                    </div>

                    <div>
                      {matchedRequest && matchedRequest.status === 'Request submitted' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span className="request-status" style={{ background: '#fff2de', color: '#8a4b08' }}>Pending Handover</span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="Enter OTP"
                              value={inputCodes[matchedRequest.id] || ''}
                              onChange={(e) => setInputCodes({ ...inputCodes, [matchedRequest.id]: e.target.value.replace(/\D/g, '') })}
                              style={{ width: '85px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbdacb', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px' }}
                            />
                            <button
                              type="button"
                              className="small-action-btn"
                              style={{ background: '#287448', color: '#fff', border: 'none', cursor: 'pointer', padding: '7px 12px', borderRadius: '6px', fontWeight: 'bold', margin: 0 }}
                              onClick={() => handleHandover(matchedRequest, inputCodes[matchedRequest.id])}
                            >
                              Verify & Give 🎓
                            </button>
                          </div>
                          <small style={{ color: '#69766d', fontSize: '11px' }}>Ask receiver for their 4-digit code</small>
                        </div>
                      ) : matchedRequest && matchedRequest.status === 'Completed / Handed Over' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span className="available" style={{ color: '#287448' }}>Handed Over ♻</span>
                          <button
                            type="button"
                            className="small-action-btn"
                            style={{ cursor: 'pointer', padding: '7px 12px', borderRadius: '6px', fontWeight: 'bold', margin: 0 }}
                            onClick={() => {
                              setCertificate({ contributorName: item.contributorName, itemName: item.name })
                              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                            }}
                          >
                            View Certificate 📜
                          </button>
                        </div>
                      ) : (
                        <span className="available">Available</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="empty-message">You haven't listed any items yet. Share an unused stationery or electronic item to see it here!</p>
          )}

          <h3 className="activity-heading" style={{ marginTop: '36px' }}>Your Requested Items (Receiver Records)</h3>
          {myMadeRequests.length ? (
            <div className="activity-list">
              {[...myMadeRequests].reverse().map((request) => (
                <div className="activity-row" key={request.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px', borderBottom: '1px solid #eef2ef', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                      <strong>{request.itemName}</strong>
                      <p>Contributor: {request.contributorName}</p>
                    </div>
                    <span className="request-status" style={request.status === 'Completed / Handed Over' ? { background: '#eaf6eb', color: '#246b39' } : {}}>
                      {request.status}
                    </span>
                  </div>

                  {request.status === 'Request submitted' && request.handoverCode && (
                    <div style={{ background: '#f0fdf4', border: '1px dashed #22c55e', padding: '8px 12px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                        🔑 Your Handover Confirmation Code: <span style={{ fontSize: '16px', letterSpacing: '3px', color: '#15803d', fontWeight: 800 }}>{request.handoverCode}</span>
                      </p>
                      <p style={{ margin: '3px 0 0', color: '#4b5563', fontSize: '11px' }}>
                        Share this 4-digit code with {request.contributorName} in person when you receive the item to complete the handover.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">You haven't requested any items yet. Explore the Browse page to find something useful!</p>
          )}

          <p className="demo-note" style={{ marginTop: '24px' }}>Connected to ReUseHUB Node.js + Express backend and MongoDB Atlas with Student Authentication & OTP Verification.</p>
        </section>
      )}

      {certificate && (
        <section className="certificate-section">
          <div className="appreciation-certificate">
            <p className="certificate-label">♻ REUSEHUB ♻</p><h2>Certificate of Appreciation</h2><p>Proudly presented to</p><h3>{certificate.contributorName}</h3>
            <p>In recognition of your valuable contribution towards sustainability and promoting reuse on our campus.</p>
            <p>For successfully donating & handing over: <strong>{certificate.itemName}</strong></p>
            <p className="certificate-thanks">Thank you for giving unused items a new life!</p>
            <button type="button" className="print-certificate-btn" onClick={() => window.print()}>Print / Save Certificate</button>
          </div>
        </section>
      )}

      <footer><h3>Small actions. A greener campus.</h3><p>ReUseHUB · Give Unused Items a New Life. ♻</p><p>Supporting UN Sustainable Development Goal 12.</p></footer>
    </div>
  )
}

export default App
