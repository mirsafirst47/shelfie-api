const db = require('./config/database');

async function setupDatabase() {
  try {
    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        batch_number VARCHAR(100) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(255),
        expiration_date DATE NOT NULL,
        qr_code VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create customers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        customer_id VARCHAR(100) UNIQUE NOT NULL,
        phone_number VARCHAR(20),
        email VARCHAR(255),
        store_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create purchases table
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        customer_id VARCHAR(100) REFERENCES customers(customer_id),
        product_sku VARCHAR(100) REFERENCES products(sku),
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        store_name VARCHAR(100),
        quantity INTEGER DEFAULT 1
      );
    `);
    
    console.log('✅ Database tables created successfully');
    
    // Insert sample data
    await db.query(`
      INSERT INTO products (sku, batch_number, product_name, manufacturer, expiration_date, qr_code)
      VALUES 
        ('SKU-789456123', 'B2025028', 'Organic Whole Milk', 'Great Value', '2025-02-04', 'QR-789456123'),
        ('SKU-445789012', 'B2025034', 'Dole Romaine Lettuce', 'Dole Fresh Vegetables', '2025-01-22', 'QR-445789012'),
        ('SKU-998877665', 'B2025015', 'Caesar Salad Dressing', 'Wish-Bone', '2025-01-30', 'QR-998877665')
      ON CONFLICT (sku) DO NOTHING;
    `);
    
    await db.query(`
      INSERT INTO customers (customer_id, phone_number, email, store_name)
      VALUES 
        ('CUST-001', '+1-555-0123', 'customer@example.com', 'Walmart'),
        ('CUST-002', '+1-555-0456', 'family@example.com', 'Target')
      ON CONFLICT (customer_id) DO NOTHING;
    `);
    
    console.log('✅ Sample data inserted successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    process.exit();
  }
}

setupDatabase();