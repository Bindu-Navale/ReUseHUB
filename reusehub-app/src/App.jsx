
import './App.css'

function App() {
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
          <a href="#browse" className="primary-btn">Explore Items →</a>
          <a href="#list" className="secondary-btn">+ List an Item</a>
        </div>
      </section>

      <section id="browse" className="categories">
        <p className="tagline">EXPLORE REUSEHUB</p>
        <h2>What can you give a second life?</h2>

        <div className="category-grid">
          <div className="category-card">
            <div className="emoji">📚</div>
            <h3>Stationery</h3>
            <p>Textbooks, notebooks, calculators and art supplies.</p>
          </div>

          <div className="category-card">
            <div className="emoji">🎧</div>
            <h3>Electronic Gadgets</h3>
            <p>Headphones, keyboards, mice, chargers and more.</p>
          </div>
        </div>
      </section>

      <footer id="list">
        <h3>Small actions. A greener campus.</h3>
        <p>ReUseHub · Give Unused Items a New Life. ♻</p>
        <p>Supporting UN Sustainable Development Goal 12.</p>
      </footer>
    </div>
  )
}

export default App

