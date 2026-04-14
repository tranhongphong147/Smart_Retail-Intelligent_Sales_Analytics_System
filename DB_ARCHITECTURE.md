# Database Architecture - Smart Retail System

This document describes the database schema and architecture for the **Smart Retail - Intelligent Sales Analytics System**. The system uses **MySQL** as its primary relational database.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        int id PK
        string username UNIQUE
        string password_hash
        enum role "admin, manager, staff"
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        string sku UNIQUE
        string name
        string category
        decimal cost_price
        decimal selling_price
        int min_stock_level
    }

    INVENTORY {
        int id PK
        int product_id FK
        int current_quantity
        date last_restocked_date
    }

    ORDERS {
        int id PK
        datetime order_date
        decimal total_amount
        enum status "completed, canceled, refunded"
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_purchase
    }

    PRODUCTS ||--|| INVENTORY : "has"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "sold_in"
```

---

## Detailed Table Specifications

### 1. `users`
Stores user credentials and access levels for the system.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier for each user. |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | User login name. |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password. |
| `role` | ENUM | NOT NULL, DEFAULT 'staff' | User permissions: `admin`, `manager`, `staff`. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |

### 2. `products`
The core catalog of items available for sale.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier for the product. |
| `sku` | VARCHAR(50) | NOT NULL, UNIQUE | Stock Keeping Unit (Unique identifier). |
| `name` | VARCHAR(100) | NOT NULL | Product name. |
| `category` | VARCHAR(50) | - | Product category (e.g., Electronics, Food). |
| `cost_price` | DECIMAL(15,2) | NOT NULL | Price paid to acquire the product. |
| `selling_price` | DECIMAL(15,2) | NOT NULL | Price sold to customers. |
| `min_stock_level`| INT | DEFAULT 0 | Threshold for low stock alerts. |

### 3. `inventory`
Tracks the real-time stock availability for products.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Primary Key. |
| `product_id` | INT | FK (products.id), CASCADE | Reference to the product. |
| `current_quantity`| INT | NOT NULL, DEFAULT 0 | Current stock on hand. |
| `last_restocked_date`| DATE | - | Date of the most recent stock update. |

### 4. `orders`
General transaction information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique Order ID. |
| `order_date` | DATETIME | DEFAULT NOW() | Date and time of the transaction. |
| `total_amount` | DECIMAL(15,2)| NOT NULL | Total gross amount of the order. |
| `status` | ENUM | NOT NULL, DEFAULT 'completed' | `completed`, `canceled`, `refunded`. |

### 5. `order_items`
Line items for each order, linking products to transactions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Primary Key. |
| `order_id` | INT | FK (orders.id), CASCADE | Reference to the order. |
| `product_id` | INT | FK (products.id), RESTRICT| Reference to the product. |
| `quantity` | INT | NOT NULL | Number of units purchased. |
| `price_at_purchase`| DECIMAL(15,2)| NOT NULL | Snapshot of selling price at transaction time. |

---

## Performance Indexes

To ensure fast query response times for the analytics dashboard, the following indexes are applied:

- `idx_orders_order_date`: Speeds up time-based sales reports.
- `idx_order_items_product`: Enhances performance for "Top Selling Products" queries.
- `idx_inventory_product`: Optimizes stock level lookups.

---

## Data Integrity Rules

1. **Cascading Deletes**: 
   - Deleting a `product` will automatically remove its `inventory` record (CASCADE).
   - Deleting an `order` will automatically remove its `order_items`.
2. **Restricted Deletes**:
   - A `product` cannot be deleted if it is linked to existing `order_items` (RESTRICT), ensuring historical sales data remains consistent.
