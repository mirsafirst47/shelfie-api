const express = require('express');
const router = express.Router();
const db = require('../config/database');


// POST /api/checkout - Process complete checkout transaction
router.post('/', async (req, res) => {
  try {
    const { customer_id, customer_info, store_name, items, total_amount } = req.body;
    
    // Start database transaction
    await db.query('BEGIN');
    
    try {
      // If it's a new customer, create them first
      if (customer_info && customer_info.is_new) {
        await db.query(
          'INSERT INTO customers (customer_id, phone_number, email, store_name) VALUES ($1, $2, $3, $4) ON CONFLICT (customer_id) DO NOTHING',
          [customer_id, customer_info.phone_number || null, customer_info.email || null, store_name]
        );
      }
      
      // Add each item as a purchase
      const purchasePromises = items.map(item => {
        return db.query(
          'INSERT INTO purchases (customer_id, product_sku, store_name, quantity, purchase_date) VALUES ($1, $2, $3, $4, NOW())',
          [customer_id, item.sku, store_name, item.quantity]
        );
      });
      
      await Promise.all(purchasePromises);
      
      // Commit transaction
      await db.query('COMMIT');
      
      // Return success with purchase details
      res.status(201).json({
        success: true,
        message: 'Checkout completed successfully',
        data: {
          customer_id,
          items_count: items.length,
          total_items: items.reduce((sum, item) => sum + item.quantity, 0),
          store_name,
          total_amount,
          is_new_customer: customer_info?.is_new || false,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process checkout'
    });
  }
});


// // POST /api/checkout - Process complete checkout transaction
// router.post('/', async (req, res) => {
//   try {
//     const { customer_id, store_name, items, total_amount } = req.body;
    
//     // Start database transaction
//     await db.query('BEGIN');
    
//     try {
//       // Add each item as a purchase
//       const purchasePromises = items.map(item => {
//         return db.query(
//           'INSERT INTO purchases (customer_id, product_sku, store_name, quantity, purchase_date) VALUES ($1, $2, $3, $4, NOW())',
//           [customer_id, item.sku, store_name, item.quantity]
//         );
//       });
      
//       await Promise.all(purchasePromises);
      
//       // Commit transaction
//       await db.query('COMMIT');
      
//       // Return success with purchase details
//       res.status(201).json({
//         success: true,
//         message: 'Checkout completed successfully',
//         data: {
//           customer_id,
//           items_count: items.length,
//           total_items: items.reduce((sum, item) => sum + item.quantity, 0),
//           store_name,
//           total_amount,
//           timestamp: new Date().toISOString()
//         }
//       });
      
//     } catch (error) {
//       // Rollback on error
//       await db.query('ROLLBACK');
//       throw error;
//     }
    
//   } catch (error) {
//     console.error('Error processing checkout:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to process checkout'
//     });
//   }
// });

// GET /api/checkout/recent - Get recent checkouts for demo
router.get('/recent', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.customer_id,
        c.store_name,
        COUNT(p.id) as items_purchased,
        SUM(p.quantity) as total_quantity,
        MAX(p.purchase_date) as last_purchase
      FROM customers c
      LEFT JOIN purchases p ON c.customer_id = p.customer_id
      WHERE p.purchase_date > NOW() - INTERVAL '1 hour'
      GROUP BY c.customer_id, c.store_name
      ORDER BY last_purchase DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching recent checkouts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent checkouts'
    });
  }
});

module.exports = router;