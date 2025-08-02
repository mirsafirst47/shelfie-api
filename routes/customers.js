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

module.exports = router;