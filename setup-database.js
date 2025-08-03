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
    
    // Clear existing data first
    await db.query('DELETE FROM purchases');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM customers');
    
    // Insert realistic sample data with varied expiration dates
    await db.query(`
      INSERT INTO products (sku, batch_number, product_name, manufacturer, expiration_date, qr_code)
      VALUES 
        ($1, $2, $3, $4, $5, $6),
        ($7, $8, $9, $10, $11, $12),
        ($13, $14, $15, $16, $17, $18),
        ($19, $20, $21, $22, $23, $24),
        ($25, $26, $27, $28, $29, $30),
        ($31, $32, $33, $34, $35, $36),
        ($37, $38, $39, $40, $41, $42),
        ($43, $44, $45, $46, $47, $48),
        ($49, $50, $51, $52, $53, $54),
        ($55, $56, $57, $58, $59, $60),
        ($61, $62, $63, $64, $65, $66),
        ($67, $68, $69, $70, $71, $72)
    `, [
      // Fresh products (expires in weeks/months)
      'SKU-789456123', 'B2025028', 'Organic Whole Milk', 'Great Value', '2025-08-25', 'QR-789456123',
      'SKU-112233445', 'B2025045', 'Greek Yogurt', 'Chobani', '2025-08-20', 'QR-112233445',
      'SKU-556677889', 'B2025050', 'Whole Wheat Bread', 'Natures Own', '2025-08-15', 'QR-556677889',
      'SKU-334455667', 'B2025052', 'Baby Carrots', 'Bolthouse Farms', '2025-08-30', 'QR-334455667',
      
      // Expiring soon (next few days)
      'SKU-998877665', 'B2025015', 'Caesar Salad Dressing', 'Wish-Bone', '2025-08-05', 'QR-998877665',
      'SKU-776655443', 'B2025048', 'Fresh Strawberries', 'Driscolls', '2025-08-07', 'QR-776655443',
      'SKU-123456789', 'B2025049', 'Shredded Cheese', 'Kraft', '2025-08-06', 'QR-123456789',
      
      // Long shelf life (expires 2026)
      'SKU-987654321', 'B2025051', 'Canned Tomatoes', 'Hunts', '2026-02-15', 'QR-987654321',
      'SKU-192837465', 'B2025053', 'Pasta Sauce', 'Raos', '2026-01-20', 'QR-192837465',
      'SKU-564738291', 'B2025054', 'Olive Oil', 'Bertolli', '2026-06-10', 'QR-564738291',
      
      // Already expired (for demo purposes)
      'SKU-445789012', 'B2025034', 'Dole Romaine Lettuce', 'Dole Fresh Vegetables', '2025-07-25', 'QR-445789012',
      'SKU-847362951', 'B2025035', 'Expired Yogurt', 'Yoplait', '2025-07-28', 'QR-847362951'
    ]);
    
    await db.query(`
      INSERT INTO customers (customer_id, phone_number, email, store_name)
      VALUES 
        ($1, $2, $3, $4),
        ($5, $6, $7, $8)
    `, [
      'CUST-001', '+1-555-0123', 'customer@example.com', 'Walmart',
      'CUST-002', '+1-555-0456', 'family@example.com', 'Target'
    ]);
    
    // Add some realistic purchases with recent dates
    await db.query(`
      INSERT INTO purchases (customer_id, product_sku, purchase_date, store_name, quantity)
      VALUES 
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15),
        ($16, $17, $18, $19, $20),
        ($21, $22, $23, $24, $25),
        ($26, $27, $28, $29, $30),
        ($31, $32, $33, $34, $35)
    `, [
      'CUST-001', 'SKU-789456123', '2025-08-01 10:30:00', 'Walmart', 1,
      'CUST-001', 'SKU-998877665', '2025-08-01 10:30:00', 'Walmart', 1,
      'CUST-001', 'SKU-445789012', '2025-07-20 14:15:00', 'Walmart', 1,
      'CUST-001', 'SKU-987654321', '2025-07-25 16:45:00', 'Walmart', 2,
      'CUST-002', 'SKU-112233445', '2025-07-30 09:20:00', 'Target', 1,
      'CUST-002', 'SKU-776655443', '2025-08-01 11:10:00', 'Target', 1,
      'CUST-002', 'SKU-556677889', '2025-07-28 13:30:00', 'Target', 1
    ]);
    
    console.log('✅ Updated sample data with realistic expiration dates');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    process.exit();
  }
}

setupDatabase();