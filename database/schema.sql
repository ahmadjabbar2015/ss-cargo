-- =====================================================================
--  S&S CARGO - FREIGHT OS
--  Dummy MySQL schema. Mirrors the data model the front end already uses.
--  Safe to re-run: every table is dropped first.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS settlement_deductions;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS invoice_loads;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS load_accessorials;
DROP TABLE IF EXISTS loads;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS trucks;
DROP TABLE IF EXISTS lanes;
DROP TABLE IF EXISTS carriers;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------- users
CREATE TABLE users (
  id         VARCHAR(16)  NOT NULL,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(160) NOT NULL,
  role       VARCHAR(60)  NOT NULL,
  initials   VARCHAR(4)   NOT NULL,
  active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------ customers
CREATE TABLE customers (
  id             VARCHAR(16)   NOT NULL,
  name           VARCHAR(160)  NOT NULL,
  contact        VARCHAR(120)      NULL,
  email          VARCHAR(160)      NULL,
  phone          VARCHAR(40)       NULL,
  terms_days     SMALLINT      NOT NULL DEFAULT 30,
  credit_limit   DECIMAL(12,2) NOT NULL DEFAULT 0,
  pay_method     VARCHAR(20)   NOT NULL DEFAULT 'ACH',
  pay_last4      VARCHAR(8)        NULL,
  customer_since VARCHAR(8)        NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_customers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------- carriers
CREATE TABLE carriers (
  id            VARCHAR(16)  NOT NULL,
  name          VARCHAR(160) NOT NULL,
  mc_number     VARCHAR(20)      NULL,
  dot_number    VARCHAR(20)      NULL,
  base_city     VARCHAR(120)     NULL,
  equipment     VARCHAR(255)     NULL COMMENT 'comma separated equipment types',
  insurance_exp DATE             NULL,
  factoring     VARCHAR(60)      NULL COMMENT 'factor name, NULL when not factored',
  quick_pay     TINYINT(1)   NOT NULL DEFAULT 0,
  rating        DECIMAL(3,1) NOT NULL DEFAULT 0,
  on_time_pct   DECIMAL(5,2) NOT NULL DEFAULT 0,
  loads_hauled  INT          NOT NULL DEFAULT 0,
  status        ENUM('active','pending','review','declined') NOT NULL DEFAULT 'pending',
  note          VARCHAR(255)     NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_carriers_status (status),
  KEY idx_carriers_ins (insurance_exp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------- trucks
CREATE TABLE trucks (
  id         VARCHAR(16)  NOT NULL,
  unit       VARCHAR(40)  NOT NULL,
  driver     VARCHAR(120)     NULL,
  phone      VARCHAR(40)      NULL,
  carrier_id VARCHAR(16)      NULL,
  status     VARCHAR(40)  NOT NULL DEFAULT 'Available',
  location   VARCHAR(120)     NULL,
  PRIMARY KEY (id),
  KEY idx_trucks_carrier (carrier_id),
  CONSTRAINT fk_trucks_carrier FOREIGN KEY (carrier_id)
    REFERENCES carriers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- lanes
CREATE TABLE lanes (
  id          INT AUTO_INCREMENT NOT NULL,
  origin      VARCHAR(120) NOT NULL,
  destination VARCHAR(120) NOT NULL,
  miles       INT          NOT NULL,
  equipment   VARCHAR(60)  NOT NULL,
  weight_lb   INT          NOT NULL,
  commodity   VARCHAR(120)     NULL,
  PRIMARY KEY (id),
  KEY idx_lanes_pair (origin, destination)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------- quotes
CREATE TABLE quotes (
  id          VARCHAR(16)   NOT NULL,
  customer_id VARCHAR(16)       NULL,
  origin      VARCHAR(120)  NOT NULL,
  destination VARCHAR(120)  NOT NULL,
  equipment   VARCHAR(60)   NOT NULL,
  miles       INT           NOT NULL DEFAULT 0,
  weight_lb   INT           NOT NULL DEFAULT 0,
  ready_date  DATE              NULL,
  target_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  status      ENUM('New','Quoted','Won','Lost') NOT NULL DEFAULT 'New',
  received    VARCHAR(40)       NULL,
  notes       TEXT              NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_quotes_status (status),
  CONSTRAINT fk_quotes_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- loads
CREATE TABLE loads (
  id            VARCHAR(16)   NOT NULL,
  customer_id   VARCHAR(16)       NULL,
  carrier_id    VARCHAR(16)       NULL,
  truck_id      VARCHAR(16)       NULL,
  origin        VARCHAR(120)  NOT NULL,
  destination   VARCHAR(120)  NOT NULL,
  equipment     VARCHAR(60)   NOT NULL,
  commodity     VARCHAR(120)      NULL,
  miles         INT           NOT NULL DEFAULT 0,
  weight_lb     INT           NOT NULL DEFAULT 0,
  pickup_date   DATE              NULL,
  delivery_date DATE              NULL,
  revenue       DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'linehaul billed to customer',
  carrier_cost  DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'linehaul paid to carrier',
  status        ENUM('Booked','At pickup','In transit','Delivered','Invoiced','Paid') NOT NULL DEFAULT 'Booked',
  invoice_id    VARCHAR(16)       NULL,
  settlement_id VARCHAR(16)       NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_loads_status (status),
  KEY idx_loads_customer (customer_id),
  KEY idx_loads_carrier (carrier_id),
  CONSTRAINT fk_loads_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id) ON DELETE SET NULL,
  CONSTRAINT fk_loads_carrier FOREIGN KEY (carrier_id)
    REFERENCES carriers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Accessorials sit on the load and are billed to one side or the other.
CREATE TABLE load_accessorials (
  id      INT AUTO_INCREMENT NOT NULL,
  load_id VARCHAR(16)   NOT NULL,
  side    ENUM('cust','carr') NOT NULL,
  label   VARCHAR(120)  NOT NULL,
  amount  DECIMAL(10,2) NOT NULL COMMENT 'negative for advances and recoveries',
  PRIMARY KEY (id),
  KEY idx_acc_load (load_id),
  CONSTRAINT fk_acc_load FOREIGN KEY (load_id)
    REFERENCES loads (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------- invoices (AR)
CREATE TABLE invoices (
  id          VARCHAR(16)   NOT NULL,
  customer_id VARCHAR(16)       NULL,
  issued_date DATE              NULL,
  due_date    DATE              NULL,
  amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid        DECIMAL(12,2) NOT NULL DEFAULT 0,
  terms_days  SMALLINT      NOT NULL DEFAULT 30,
  sent        TINYINT(1)    NOT NULL DEFAULT 0,
  disputed    TINYINT(1)    NOT NULL DEFAULT 0,
  note        VARCHAR(255)      NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_invoices_customer (customer_id),
  KEY idx_invoices_due (due_date),
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoice_loads (
  invoice_id VARCHAR(16) NOT NULL,
  load_id    VARCHAR(16) NOT NULL,
  PRIMARY KEY (invoice_id, load_id),
  CONSTRAINT fk_il_invoice FOREIGN KEY (invoice_id)
    REFERENCES invoices (id) ON DELETE CASCADE,
  CONSTRAINT fk_il_load FOREIGN KEY (load_id)
    REFERENCES loads (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------- settlements (AP)
CREATE TABLE settlements (
  id         VARCHAR(16)   NOT NULL,
  carrier_id VARCHAR(16)       NULL,
  gross_pay  DECIMAL(12,2) NOT NULL DEFAULT 0,
  quick_pay  TINYINT(1)    NOT NULL DEFAULT 0,
  fee        DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'quick-pay fee, 3 percent',
  net_pay    DECIMAL(12,2) NOT NULL DEFAULT 0,
  status     ENUM('Pending','Approved','Paid','Hold') NOT NULL DEFAULT 'Pending',
  method     VARCHAR(40)   NOT NULL DEFAULT 'ACH',
  factor     VARCHAR(60)       NULL,
  paid_on    DATE              NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_settlements_carrier (carrier_id),
  KEY idx_settlements_status (status),
  CONSTRAINT fk_settlements_carrier FOREIGN KEY (carrier_id)
    REFERENCES carriers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settlement_deductions (
  id            INT AUTO_INCREMENT NOT NULL,
  settlement_id VARCHAR(16)   NOT NULL,
  label         VARCHAR(120)  NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ded_settlement (settlement_id),
  CONSTRAINT fk_ded_settlement FOREIGN KEY (settlement_id)
    REFERENCES settlements (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------- payments
CREATE TABLE payments (
  id         VARCHAR(24)   NOT NULL,
  paid_date  DATE          NOT NULL,
  direction  ENUM('in','out') NOT NULL,
  party      VARCHAR(160)  NOT NULL,
  method     VARCHAR(40)   NOT NULL,
  reference  VARCHAR(60)       NULL,
  amount     DECIMAL(12,2) NOT NULL,
  link_id    VARCHAR(16)       NULL COMMENT 'invoice or settlement id',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_dir (direction),
  KEY idx_payments_date (paid_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
