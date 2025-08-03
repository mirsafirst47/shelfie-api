const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/:customerId/purchases', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const result = await db.query(`
      SELECT 
        p.sku,
        p.product_name,
        p.manufacturer,
        p.expiration_date,
        p.batch_number,
        pur.purchase_date,
        pur.store_name,
        pur.quantity
      FROM purchases pur
      JOIN products p ON pur.product_sku = p.sku
      WHERE pur.customer_id = $1
      ORDER BY pur.purchase_date DESC
    `, [customerId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching customer purchases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer purchases'
    });
  }
});

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.customer_id,
        c.phone_number,
        c.email,
        c.store_name,
        c.created_at,
        COUNT(p.id) as purchase_count
      FROM customers c
      LEFT JOIN purchases p ON c.customer_id = p.customer_id
      GROUP BY c.customer_id, c.phone_number, c.email, c.store_name, c.created_at
      ORDER BY c.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

module.exports = router;