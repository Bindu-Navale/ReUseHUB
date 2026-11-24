const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('../models/Item');

// Load environment variables from backend/.env
dotenv.config({ path: __dirname + '/../.env' });

const sampleItems = [
  {
    name: 'Engineering Mathematics Textbook',
    category: 'Stationery',
    condition: 'Good',
    description: 'A useful textbook for engineering students. Plenty of life left in it.',
    contributorName: 'Aarav',
    image: '',
  },
  {
    name: 'College Notebook Set',
    category: 'Stationery',
    condition: 'Gently used',
    description: 'A set of notebooks with many unused pages.',
    contributorName: 'Meera',
    image: '',
  },
  {
    name: 'Wireless Headphones',
    category: 'Electronics',
    condition: 'Good',
    description: 'Working wireless headphones. No connectivity issues.',
    contributorName: 'Rahul',
    image: '',
  },
  {
    name: 'USB Keyboard',
    category: 'Electronics',
    condition: 'Gently used',
    description: 'A functional USB keyboard for everyday use.',
    contributorName: 'Ananya',
    image: '',
  },
  {
    name: 'Scientific Calculator',
    category: 'Stationery',
    condition: 'Good',
    description: 'Useful for engineering calculations. All buttons work.',
    contributorName: 'Kiran',
    image: '',
  },
  {
    name: 'Phone Charger',
    category: 'Electronics',
    condition: 'Good',
    description: 'A working phone charger in good condition.',
    contributorName: 'Diya',
    image: '',
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas for seeding...');

    // Delete existing items to avoid duplicates
    await Item.deleteMany();
    console.log('Cleared existing items...');

    // Insert the 6 sample items
    await Item.insertMany(sampleItems);
    console.log('✅ Successfully seeded 6 sample items into MongoDB Atlas!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
};

seedData();
