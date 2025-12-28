**Order Status CSV Generator (Node.js)**

This project reads an order line-item CSV file and generates a WMS-compatible Order Status CSV. It repeats order-level fields for every line item, auto-increments document and tracking numbers per order, resets line numbers per order, and applies hardcoded and derived WMS values.

Input: orderfile.csv containing order numbers, IDs, SKUs, and quantities.
Output: orderstatus.csv formatted for WMS processing and validation.

Built with Node.js using csv-parser and csv-writer. Suitable for Shopify → WMS order processing and QA validation.
