import fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const inputFile = "orderfile.csv";
const outputFile = "orderstatus.csv";

// Order tracking
let previousOrderName = null;
let lineNumber = 0;
let documentCounter = 410268;
let trackingCounter = 5353958;

// Store order-level values (CRITICAL FIX)
let currentOrderData = {};

// Date helpers (yesterday)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const formatDate = (d) =>
  `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

const formatTime = (d) =>
  d.toTimeString().split(" ")[0];

const rows = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row) => {
    const orderName = row["Name"];

    // New order detected
    if (orderName !== previousOrderName) {
      lineNumber = 1;
      documentCounter++;
      trackingCounter++;

      // Generate ONCE per order
      currentOrderData = {
        documentNumber: `SO${documentCounter}`,
        poCheckNumber: row["Id"],
        systemDate: formatDate(yesterday),
        actualShipDate: formatDate(yesterday),
        timeOfDay: formatTime(yesterday),
        trackingNumber: `TCS${trackingCounter}`
      };

      previousOrderName = orderName;
    } else {
      lineNumber++;
    }

    // Push row (REUSE order-level data)
    rows.push({
      "Document Number": currentOrderData.documentNumber,
      "PO/Check Number": currentOrderData.poCheckNumber,
      "WMS Order Num": "",
      "System Date": currentOrderData.systemDate,
      "Actual Ship Date": currentOrderData.actualShipDate,
      "Time of Day": currentOrderData.timeOfDay,
      "Line Number": lineNumber,
      "Quantity": row["Lineitem quantity"],
      "Quantity Shipped": 1,
      "Model Number": row["Lineitem sku"],
      "Customer Model Number": "",
      "UPC Code": "29665206732",
      "Item Description": row["Lineitem name"],
      "Ship Via": "Shopify",
      "WMS Total No of Carton": 1,
      "Item Tracking #": currentOrderData.trackingNumber,
      "WMS Individual Carton": "1",
      "Ship method name": "Bogus",
      "Vendor Name": "Grand Seiko",
      "Bill of Lading": "Processed",
      "Processed Flag": "Y",
      "Status of Order": "Credit-Processed"
    });
  })
  .on("end", async () => {
    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: [
        "Document Number",
        "PO/Check Number",
        "WMS Order Num",
        "System Date",
        "Actual Ship Date",
        "Time of Day",
        "Line Number",
        "Quantity",
        "Quantity Shipped",
        "Model Number",
        "Customer Model Number",
        "UPC Code",
        "Item Description",
        "Ship Via",
        "WMS Total No of Carton",
        "Item Tracking #",
        "WMS Individual Carton",
        "Ship method name",
        "Vendor Name",
        "Bill of Lading",
        "Processed Flag",
        "Status of Order"
      ].map((col) => ({ id: col, title: col }))
    });

    await csvWriter.writeRecords(rows);
    console.log("✅ orderstatus.csv generated successfully");
  });
