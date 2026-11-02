import { useEffect, useMemo, useState } from 'react'
import './App.css'

const ITEMS_KEY = 'reusehub-items'
const REQUESTS_KEY = 'reusehub-requests'

const sampleItems = [
  { id: 1, name: 'Engineering Mathematics Textbook', category: 'Stationery', condition: 'Good', description: 'A useful textbook for engineering students. Plenty of life left in it.', contributorName: 'Aarav', image: '', createdAt: '2026-10-27T10:00:00.000Z' },
  { id: 2, name: 'College Notebook Set', category: 'Stationery', condition: 'Gently used', description: 'A set of notebooks with many unused pages.', contributorName: 'Meera', image: '', createdAt: '2026-10-28T10:00:00.000Z' },
  { id: 3, name: 'Wireless Headphones', category: 'Electronics', condition: 'Good', description: 'Working wireless headphones. No connectivity issues.', contributorName: 'Rahul', image: '', createdAt: '2026-10-29T10:00:00.000Z' },
  { id: 4, name: 'USB Keyboard', category: 'Electronics', condition: 'Gently used', description: 'A functional USB keyboard for everyday use.', contributorName: 'Ananya', image: '', createdAt: '2026-10-30T10:00:00.000Z' },
  { id: 5, name: 'Scientific Calculator', category: 'Stationery', condition: 'Good', description: 'Useful for engineering calculations. All buttons work.', contributorName: 'Kiran', image: '', createdAt: '2026-10-31T10:00:00.000Z' },
  { id: 6, name: 'Phone Charger', category: 'Electronics', condition: 'Good', description: 'A working phone charger in good condition.', contributorName: 'Diya', image: '', createdAt: '2026-11-01T10:00:00.000Z' },
]

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    if (value !== null) {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (error) {
    console.error(`Could not read ${key}:`, error)
  }
  // Seed the browser storage on first use, so the demo starts with sample data.
  try {
    localStorage.setItem(key, JSON.stringify(fallback))
  } catch (error) {
    console.error(`Could not initialize ${key}:`, error)
  }
  return fallback
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const maxDimension = 1000
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) return reject(new Error('Image processing is unavailable.'))
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      image.onerror = () => reject(new Error('Could not open this image.'))
      image.src = reader.result
    }
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.readAsDataURL(file)
  })
}

function App() {
  const [items, setItems] = useState(() => readStorage(ITEMS_KEY, sampleItems))
  const [requests, setRequests] = useState(() => readStorage(REQUESTS_KEY, []))
  const [page, setPage] = useState('home')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedItem, setSelectedItem] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [certificate, setCertificate] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)) }
    catch (storageError) { setError('Storage is full. Try listing the item without a photo or use a smaller photo.') }
  }, [items])

  useEffect(() => {
    try { localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests)) }
    catch (storageError) { setError('Could not save this demo request in browser storage.') }
  }, [requests])

  const goTo = (nextPage) => {
    setPage(nextPage)
    setSelectedItem(null)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0]
    setImagePreview('')
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
    try { setImagePreview(await compressImage(file)) }
    catch (imageError) {
      setError(imageError.message || 'Unable to process this image.')
      event.target.value = ''
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const newItem = {
      id: Date.now(),
      contributorName: form.elements['contributor-name'].value.trim(),
      name: form.elements['item-name'].value.trim(),
      category: form.elements['item-category'].value,
      condition: form.elements['item-condition'].value,
      description: form.elements['item-description'].value.trim(),
      image: imagePreview,
      createdAt: new Date().toISOString(),
    }
    if (!newItem.name || !newItem.contributorName) {
      setError('Please complete all required fields.')
      return
    }
    setItems((current) => [...current, newItem])
    setCertificate({ contributorName: newItem.contributorName, itemName: newItem.name })
    setNotice('Your item has been listed successfully!')
    setError('')
    setImagePreview('')
    form.reset()
    setPage('browse')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const requestItem = (item) => {
    if (requests.some((request) => request.itemId === item.id)) {
      setNotice('You have already submitted a demo request for this item.')
      return
    }
    setRequests((current) => [...current, {
      id: Date.now(),
      itemId: item.id,
      itemName: item.name,
      contributorName: item.contributorName,
      requestedAt: new Date().toISOString(),
      status: 'Request submitted (demo)',
    }])
    setNotice(`Your request for "${item.name}" has been recorded in this demo.`)
  }

  const myListedItems = items.filter((item) => item.contributorName && item.contributorName !== 'Demo Student')
  const requestedIds = requests.map((request) => request.itemId)

  return (
    <div className="app">
      <nav className="navbar">
        <button className="brand-button" onClick={() => goTo('home')}>♻ ReUseHUB</button>
        <div className="nav-links">
          <button className={page === 'home' ? 'nav-active' : ''} onClick={() => goTo('home')}>Home</button>
          <button className={page === 'browse' || page === 'details' ? 'nav-active' : ''} onClick={() => openBrowse()}>Browse Items</button>
          <button className={page === 'list' ? 'nav-active' : ''} onClick={() => goTo('list')}>List an Item</button>
          <button className={page === 'activity' ? 'nav-active' : ''} onClick={() => goTo('activity')}>My Activity</button>
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
          <div className="sorting-row"><p className="result-count">{filteredItems.length} items found</p><label htmlFor="sort-items">Sort by:</label><select id="sort-items" className="sort-select" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="az">Name: A to Z</option></select></div>
          <div className="item-grid">
            {filteredItems.map((item) => <article className="item-card" key={item.id}>
              <button className="item-card-open" onClick={() => { setSelectedItem(item); setPage('details'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label={`View ${item.name} details`}>
                <div className="item-image-placeholder">{item.image ? <img src={item.image} alt={item.name} /> : <span>📷</span>}</div>
                <p className="item-category">{item.category}</p><h3>{item.name}</h3><p>Condition: {item.condition}</p><span className="available">● Available</span>
              </button>
              <button className="small-action-btn" onClick={() => { setSelectedItem(item); setPage('details'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>View details</button>
            </article>)}
          </div>
          {filteredItems.length === 0 && <p className="empty-message">No items found. Try another search or category.</p>}
        </section>
      )}

      {page === 'details' && selectedItem && (
        <section className="detail-section page-section">
          <button className="back-link" onClick={() => goTo('browse')}>← Back to Browse</button>
          <div className="detail-card">
            <div className="detail-image">{selectedItem.image ? <img src={selectedItem.image} alt={selectedItem.name} /> : <span>📷</span>}</div>
            <div className="detail-info">
              <p className="item-category">{selectedItem.category}</p><h2>{selectedItem.name}</h2>
              <p><strong>Condition:</strong> {selectedItem.condition}</p>
              <p><strong>Contributed by:</strong> {selectedItem.contributorName || 'Campus student'}</p>
              <p>{selectedItem.description || 'No description provided.'}</p>
              <span className="available">● Available</span>
              <button className="primary-btn request-btn" onClick={() => requestItem(selectedItem)}>{requestedIds.includes(selectedItem.id) ? 'Request Submitted' : 'Request This Item'}</button>
              <p className="demo-note">Demo interaction: requests are stored in this browser until backend integration.</p>
            </div>
          </div>
        </section>
      )}

      {page === 'list' && (
        <section className="upload-section page-section">
          <p className="tagline">PASS IT ON</p><h2>List an Item</h2><p>Share something you no longer need with another student.</p>
          <div className="upload-placeholder"><form onSubmit={handleSubmit}>
            <label htmlFor="contributor-name">Your Name</label><input id="contributor-name" name="contributor-name" type="text" placeholder="Enter your full name" required />
            <label htmlFor="item-name">Item Name</label><input id="item-name" name="item-name" type="text" placeholder="e.g. Engineering Mathematics textbook" required />
            <label htmlFor="item-category">Category</label><select id="item-category" name="item-category" required defaultValue=""><option value="" disabled>Select a category</option><option value="Stationery">Stationery</option><option value="Electronics">Electronics</option></select>
            <label htmlFor="item-condition">Condition</label><select id="item-condition" name="item-condition" required defaultValue=""><option value="" disabled>Select condition</option><option value="Like New">Like New</option><option value="Good">Good</option><option value="Usable">Usable</option></select>
            <label htmlFor="item-description">Description</label><textarea id="item-description" name="item-description" placeholder="Describe your item..." rows="4" required />
            <label htmlFor="item-image">Upload Item Photo (maximum 5 MB)</label><input id="item-image" name="item-image" type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <div className="image-preview"><p>Photo Preview:</p><img src={imagePreview} alt="Preview of your item" /><button type="button" onClick={() => { setImagePreview(''); document.getElementById('item-image').value = '' }}>Remove Photo</button></div>}
            <button type="submit" className="primary-btn">Submit Item</button>
          </form></div>
        </section>
      )}

      {page === 'activity' && (
        <section className="activity-section page-section">
          <p className="tagline">YOUR REUSEHUB DASHBOARD</p><h2>My Activity</h2><p className="browse-description">A local demo summary of contributions and requests in this browser.</p>
          <div className="activity-stats"><div><strong>{myListedItems.length}</strong><span>Items listed</span></div><div><strong>{requests.length}</strong><span>Requests made</span></div></div>
          <h3 className="activity-heading">Recently listed items</h3>
          {myListedItems.length ? <div className="activity-list">{[...myListedItems].reverse().map((item) => <div className="activity-row" key={item.id}><div><strong>{item.name}</strong><p>{item.category} · {item.condition} · by {item.contributorName}</p></div><span className="available">Available</span></div>)}</div> : <p className="empty-message">No contributed items yet. List your first item to see it here.</p>}
          <h3 className="activity-heading">My requests</h3>
          {requests.length ? <div className="activity-list">{[...requests].reverse().map((request) => <div className="activity-row" key={request.id}><div><strong>{request.itemName}</strong><p>Contributor: {request.contributorName}</p></div><span className="request-status">{request.status}</span></div>)}</div> : <p className="empty-message">You haven't requested any items yet.</p>}
          <p className="demo-note">This is a frontend demonstration. User accounts and shared activity will be connected to the backend in the next phase.</p>
        </section>
      )}

      {certificate && (
        <section className="certificate-section">
          <div className="appreciation-certificate">
            <p className="certificate-label">♻ REUSEHUB ♻</p><h2>Certificate of Appreciation</h2><p>Proudly presented to</p><h3>{certificate.contributorName}</h3>
            <p>In recognition of your valuable contribution towards sustainability and promoting reuse on our campus.</p>
            <p>For listing: <strong>{certificate.itemName}</strong></p><p className="certificate-thanks">Thank you for giving unused items a new life!</p>
            <button type="button" className="print-certificate-btn" onClick={() => window.print()}>Print / Save Certificate</button>
          </div>
        </section>
      )}

      <footer><h3>Small actions. A greener campus.</h3><p>ReUseHUB · Give Unused Items a New Life. ♻</p><p>Supporting UN Sustainable Development Goal 12.</p></footer>
    </div>
  )
}

export default App
