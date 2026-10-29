
import { useState } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Engineering Mathematics Textbook',
      category: 'Stationery',
      condition: 'Good',
      image: ''
    },
    {
      id: 2,
      name: 'College Notebook Set',
      category: 'Stationery',
      condition: 'Gently used',
      image: ''
    },
    {
      id: 3,
      name: 'Wireless Headphones',
      category: 'Electronics',
      condition: 'Good',
      image: ''
    },
    {
      id: 4,
      name: 'USB Keyboard',
      category: 'Electronics',
      condition: 'Gently used',
      image: ''
    },
    {
      id: 5,
      name: 'Scientific Calculator',
      category: 'Stationery',
      condition: 'Good',
      image: ''
    },
    {
      id: 6,
      name: 'Phone Charger',
      category: 'Electronics',
      condition: 'Good',
      image: ''
    }
  ])

  const [search, setSearch] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [category, setCategory] = useState('All')
  const [successMessage, setSuccessMessage] = useState('')
  const [certificate, setCertificate] = useState(null)

  const handleImageChange = (event) => {
    const file = event.target.files[0]

    if (!file) {
      setImagePreview('')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      event.target.value = ''
      setImagePreview('')
      return
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    const imageUrl = URL.createObjectURL(file)
    setImagePreview(imageUrl)
    setSuccessMessage('')
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
      image: imagePreview
    }

    setItems((previousItems) => [...previousItems, newItem])
    setCertificate({
  contributorName: newItem.contributorName,
  itemName: newItem.name,
});
    setSuccessMessage('Your item has been listed successfully!')

    setSearch('')
    setCategory('All')
    form.reset()

    setImagePreview('')
    // Keep the preview URL alive for the newly listed item.
    // It will remain usable until the page is refreshed.
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || item.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="app">
      <nav className="navbar">
        <h2>♻ ReUseHub</h2>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#browse">Browse Items</a>
          <a href="#list">List an Item</a>
        </div>
      </nav>

      <section id="home" className="hero">
        <p className="tagline">A CAMPUS COMMUNITY FOR REUSE</p>

        <h1>
          One person's unused item,
          <span> another person's treasure.</span>
        </h1>

        <p className="description">
          Give your stationery and electronic gadgets a second life.
          Share what you no longer need and discover something useful.
        </p>

        <div className="buttons">
          <a href="#browse" className="primary-btn">
            Explore Items →
          </a>
          <a href="#list" className="secondary-btn">
            + List an Item
          </a>
        </div>
      </section>

      <section id="browse" className="categories">
        <p className="tagline">EXPLORE REUSEHUB</p>
        <h2>What can you give a second life?</h2>

        <input
          type="search"
          placeholder="Search for books, calculators, headphones..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="filter-buttons">
          {['All', 'Stationery', 'Electronics'].map((name) => (
            <button
              key={name}
              type="button"
              className={category === name ? 'filter active' : 'filter'}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <p className="result-count">
          {filteredItems.length} items found
        </p>

        <div className="item-grid">
          {filteredItems.map((item) => (
            <article className="item-card" key={item.id}>
              <div className="item-image-placeholder">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <span>📷</span>
                )}
              </div>

              <p className="item-category">{item.category}</p>
              <h3>{item.name}</h3>
              <p>Condition: {item.condition}</p>

              {item.description && <p>{item.description}</p>}

              <span className="available">● Available</span>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="empty-message">
            No items found. Try another search!
          </p>
        )}
      </section>

      <section id="list" className="upload-section">
        <p className="tagline">PASS IT ON</p>
        <h2>List an Item</h2>
        <p>Have something you no longer need? Give it a new life!</p>

        <div className="upload-placeholder">
          <form onSubmit={handleSubmit}>
            <label htmlFor="contributor-name">Your Name</label>
<input
  id="contributor-name"
  name="contributor-name"
  type="text"
  placeholder="Enter your full name"
  required
/>
            <label htmlFor="item-name">Item Name</label>
            <input
              id="item-name"
              name="item-name"
              type="text"
              placeholder="e.g. Engineering Mathematics textbook"
              required
            />

            <label htmlFor="item-category">Category</label>
            <select
              id="item-category"
              name="item-category"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Stationery">Stationery</option>
              <option value="Electronics">Electronics</option>
            </select>

            <label htmlFor="item-condition">Condition</label>
            <select
              id="item-condition"
              name="item-condition"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select condition
              </option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Usable">Usable</option>
            </select>

            <label htmlFor="item-description">Description</label>
            <textarea
              id="item-description"
              name="item-description"
              placeholder="Describe your item..."
              rows="4"
              required
            />

            <label htmlFor="item-image">Upload Item Photo</label>
            <input
              id="item-image"
              name="item-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {imagePreview && (
              <div className="image-preview">
                <p>Photo Preview:</p>
                <img src={imagePreview} alt="Preview of your item" />

                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview)
                    setImagePreview('')
                    document.getElementById('item-image').value = ''
                  }}
                >
                  Remove Photo
                </button>
              </div>
            )}

            {successMessage && (
              <p className="success-message" role="status">
                {successMessage}
              </p>
            )}

            <button type="submit" className="primary-btn">
              Submit Item
            </button>
          </form>
        </div>
      </section>

{certificate && (
  <section className="certificate-section">
    <div className="appreciation-certificate">
      <p className="certificate-label">♻ REUSEHUB ♻</p>
      <h2>Certificate of Appreciation</h2>
      <p>Proudly presented to</p>
      <h3>{certificate.contributorName}</h3>
      <p>
        In recognition of your valuable contribution towards
        sustainability and promoting reuse on our campus.
      </p>
      <p>
        For listing: <strong>{certificate.itemName}</strong>
      </p>
      <p className="certificate-thanks">
        Thank you for giving unused items a new life!
      </p>
      <button
  type="button"
  className="print-certificate-btn"
  onClick={() => window.print()}
>
  Print / Save Certificate
</button>
    </div>
  </section>
)}

      <footer>
        <h3>Small actions. A greener campus.</h3>
        <p>ReUseHub · Give Unused Items a New Life. ♻</p>
        <p>Supporting UN Sustainable Development Goal 12.</p>
      </footer>
    </div>
  )
}

export default App
