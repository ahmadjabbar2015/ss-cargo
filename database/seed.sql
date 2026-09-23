-- =====================================================================
--  S&S CARGO - FREIGHT OS
--  Dummy seed data. Mirrors the sample data the front end ships with,
--  so hydrating from MySQL produces the same app you already know.
--  All companies, MC/DOT numbers, rates and invoices are invented.
-- =====================================================================

-- ---------------------------------------------------------------- users
INSERT INTO users (id, name, email, role, initials, active) VALUES
  ('U-01', 'Dana Whitfield',  'dana@sscargo.example',   'Operations manager', 'DW', 1),
  ('U-02', 'Marcus Oyelaran', 'marcus@sscargo.example', 'Dispatcher',         'MO', 1),
  ('U-03', 'Priya Raman',     'priya@sscargo.example',  'Billing',            'PR', 1),
  ('U-04', 'Colin Frazier',   'colin@sscargo.example',  'Carrier sales',      'CF', 1),
  ('U-05', 'Sam Achebe',      'sam@sscargo.example',    'Accounting',         'SA', 1);

-- ------------------------------------------------------------ customers
INSERT INTO customers (id, name, contact, email, phone, terms_days, credit_limit, pay_method, pay_last4, customer_since) VALUES
  ('C-101', 'Bradford Foods Inc.',  'Dana Ruiz',          'ap@bradfordfoods.example',  '(312) 555-0148', 30, 150000.00, 'ACH',   '4471', '2024'),
  ('C-102', 'Kestrel Produce',      'Marta Oyelaran',     'billing@kestrel.example',   '(559) 555-0112', 21, 120000.00, 'ACH',   '8820', '2024'),
  ('C-103', 'Tallgrass Steel',      'Ray Whitcomb',       'ap@tallgrass.example',      '(912) 555-0190', 45, 200000.00, 'Check', NULL,   '2023'),
  ('C-104', 'Marlow Distribution',  'Priya Nandakumar',   'finance@marlow.example',    '(973) 555-0177', 30,  90000.00, 'ACH',   '3310', '2025'),
  ('C-105', 'Verde Home Goods',     'Owen Castellanos',   'ap@verdehome.example',      '(213) 555-0166', 30,  60000.00, 'Card',  '1042', '2025'),
  ('C-106', 'Northfield Beverage',  'Alicia Grant',       'ap@northfieldbev.example',  '(305) 555-0134', 30, 140000.00, 'ACH',   '7765', '2023'),
  ('C-107', 'Halsey Components',    'Tom Brennan',        'ap@halsey.example',         '(317) 555-0121', 15,  75000.00, 'Wire',  NULL,   '2026'),
  ('C-108', 'Cedar Ridge Lumber',   'Janine Cobb',        'ap@cedarridge.example',     '(503) 555-0159', 30, 110000.00, 'ACH',   '2218', '2024');

-- ------------------------------------------------------------- carriers
INSERT INTO carriers (id, name, mc_number, dot_number, base_city, equipment, insurance_exp, factoring, quick_pay, rating, on_time_pct, loads_hauled, status, note) VALUES
  ('V-201', 'Sierra Vista Logistics', '1042118', '3210998', 'Phoenix, AZ',    'Dry Van 53''',              '2027-04-14', NULL,   0, 4.9,  99.20, 64, 'active',  NULL),
  ('V-202', 'Cardinal Line Carriers', '1143908', '3771260', 'Springfield, MO','Reefer',                    '2026-11-04', 'TAFS', 1, 4.6,  97.60, 41, 'active',  NULL),
  ('V-203', 'Vasquez Transport LLC',  '1187442', '3844091', 'Laredo, TX',     'Dry Van 53'',Power Only',   '2027-07-02', NULL,   1, 4.8,  98.90, 28, 'active',  NULL),
  ('V-204', 'Great Lakes Haulage',    '0984551', '3118220', 'Toledo, OH',     'Flatbed,Step Deck',         '2026-10-12', 'RTS',  0, 3.6,  94.10, 19, 'active',  NULL),
  ('V-205', 'Mesa Ridge Trucking',    '1209773', '3902114', 'Tucson, AZ',     'Flatbed',                   '2027-02-28', NULL,   0, 4.7, 100.00, 11, 'active',  NULL),
  ('V-206', 'Blue Ridge Freightways', '1255410', '3955012', 'Knoxville, TN',  'Dry Van 53'',Reefer',       '2027-05-08', 'Apex', 1, 4.4,  96.30, 22, 'active',  NULL),
  ('V-207', 'Halden Freight Co.',     '0998120', '3218844', 'Toledo, OH',     'Dry Van 53''',              '2027-03-19', NULL,   0, 0.0,   0.00,  0, 'review',  'Conditional safety rating - manager review required'),
  ('V-208', 'Rio Bravo Carriers',     '1288301', '4011277', 'El Paso, TX',    'Hotshot,Power Only',        '2027-06-22', NULL,   1, 0.0,   0.00,  0, 'pending', 'Authority active - insurance current'),
  ('V-209', 'Copper State Express',   '1301447', '4055190', 'Yuma, AZ',       'Reefer',                    '2026-12-01', 'TAFS', 1, 0.0,   0.00,  0, 'pending', 'Authority active - COI expires in 39 days');

-- --------------------------------------------------------------- trucks
INSERT INTO trucks (id, unit, driver, phone, carrier_id, status, location) VALUES
  ('T-01', 'Unit 114', 'Luis Vasquez',   '(956) 555-0173', 'V-203', 'On load',        'Laredo, TX'),
  ('T-02', 'Unit 119', 'Ramona Ellis',   '(602) 555-0144', 'V-201', 'On load',        'Phoenix, AZ'),
  ('T-03', 'Unit 207', 'Dale Okonkwo',   '(417) 555-0128', 'V-202', 'On load',        'Fresno, CA'),
  ('T-04', 'Unit 088', 'Marcus Feld',    '(419) 555-0182', 'V-204', 'On load',        'Amarillo, TX'),
  ('T-05', 'Unit 311', 'Sofia Ibarra',   '(520) 555-0119', 'V-205', 'Available',      'Tucson, AZ'),
  ('T-06', 'Unit 402', 'Grant Mbeki',    '(865) 555-0163', 'V-206', 'Available',      'Knoxville, TN'),
  ('T-07', 'Unit 155', 'Hank Pereira',   '(956) 555-0198', 'V-203', 'Available',      'San Antonio, TX'),
  ('T-08', 'Unit 260', 'Yara Stepanek',  '(602) 555-0107', 'V-201', 'Out of service', 'Phoenix, AZ');

-- ---------------------------------------------------------------- lanes
INSERT INTO lanes (origin, destination, miles, equipment, weight_lb, commodity) VALUES
  ('Laredo, TX',       'Chicago, IL',         1383, 'Dry Van 53''', 42100, 'Palletized dry goods'),
  ('Fresno, CA',       'Denver, CO',          1178, 'Reefer',       38600, 'Fresh produce'),
  ('Savannah, GA',     'Memphis, TN',          585, 'Flatbed',      44000, 'Steel coil'),
  ('Newark, NJ',       'Charlotte, NC',        626, 'Power Only',   31400, 'Consumer goods'),
  ('Dallas, TX',       'Atlanta, GA',          781, 'Dry Van 53''', 40200, 'Packaged food'),
  ('Los Angeles, CA',  'Phoenix, AZ',          373, 'Dry Van 53''', 28900, 'Home furnishings'),
  ('Seattle, WA',      'Salt Lake City, UT',   832, 'Reefer',       36700, 'Frozen goods'),
  ('Houston, TX',      'New Orleans, LA',      348, 'Step Deck',    46500, 'Pipe'),
  ('Indianapolis, IN', 'Newark, NJ',           698, 'Dry Van 48''', 33100, 'Auto components'),
  ('Miami, FL',        'Atlanta, GA',          662, 'Reefer',       39800, 'Beverages'),
  ('Kansas City, MO',  'Denver, CO',           602, 'Flatbed',      43200, 'Structural steel'),
  ('El Paso, TX',      'Phoenix, AZ',          431, 'Hotshot',      12400, 'Expedite parts'),
  ('Portland, OR',     'Boise, ID',            430, 'Flatbed',      41000, 'Dimensional lumber'),
  ('Amarillo, TX',     'Kansas City, MO',      535, 'Flatbed',      42800, 'Steel plate');

-- --------------------------------------------------------------- quotes
-- ready_date values are relative to the demo "today" (2026-09-24).
INSERT INTO quotes (id, customer_id, origin, destination, equipment, miles, weight_lb, ready_date, target_rate, status, received, notes) VALUES
  ('Q-1184', 'C-101', 'Laredo, TX',       'Chicago, IL',   'Dry Van 53''', 1383, 42100, '2026-09-25', 3200.00, 'New',    '05:52 today', 'Dock hours 07:00-15:00. Appointment required at delivery.'),
  ('Q-1183', 'C-102', 'Fresno, CA',       'Denver, CO',    'Reefer',       1178, 38600, '2026-09-25', 3750.00, 'New',    '04:31 today', 'Continuous 34F. Pulp temp on load and unload.'),
  ('Q-1182', 'C-108', 'Portland, OR',     'Boise, ID',     'Flatbed',       430, 41000, '2026-09-26', 1150.00, 'New',    'Yesterday',   'Tarps required. 4 straps minimum.'),
  ('Q-1181', 'C-103', 'Savannah, GA',     'Memphis, TN',   'Flatbed',       585, 44000, '2026-09-26', 1600.00, 'Quoted', 'Yesterday',   'Coil racks in place.'),
  ('Q-1180', 'C-107', 'Indianapolis, IN', 'Newark, NJ',    'Dry Van 48''',  698, 33100, '2026-09-27', 1500.00, 'Quoted', 'Yesterday',   ''),
  ('Q-1178', 'C-104', 'Newark, NJ',       'Charlotte, NC', 'Power Only',    626, 31400, '2026-09-26', 1380.00, 'Won',    '21 Sep',      ''),
  ('Q-1176', 'C-105', 'Los Angeles, CA',  'Phoenix, AZ',   'Dry Van 53''',  373, 28900, '2026-09-23',  980.00, 'Lost',   '20 Sep',      'Lost on price - customer took $915 elsewhere.'),
  ('Q-1174', 'C-106', 'Miami, FL',        'Atlanta, GA',   'Reefer',        662, 39800, '2026-09-25', 2050.00, 'Quoted', '20 Sep',      '');

-- ---------------------------------------------------------------- loads
INSERT INTO loads (id, customer_id, carrier_id, truck_id, origin, destination, equipment, commodity, miles, weight_lb, pickup_date, delivery_date, revenue, carrier_cost, status, invoice_id, settlement_id) VALUES
  ('SS-4762', 'C-103', 'V-204', 'T-04', 'Savannah, GA',     'Memphis, TN',        'Flatbed',      'Steel coil',           585, 44000, '2026-09-04', '2026-09-06', 1620.00, 1290.00, 'Paid',      'INV-3300', 'SET-5100'),
  ('SS-4763', 'C-101', 'V-201', 'T-02', 'Laredo, TX',       'Chicago, IL',        'Dry Van 53''', 'Palletized dry goods',1383, 42100, '2026-09-05', '2026-09-08', 3280.00, 2620.00, 'Paid',      'INV-3302', 'SET-5102'),
  ('SS-4764', 'C-102', 'V-202', 'T-03', 'Fresno, CA',       'Denver, CO',         'Reefer',       'Fresh produce',       1178, 38600, '2026-09-06', '2026-09-09', 3890.00, 3110.00, 'Paid',      'INV-3304', 'SET-5104'),
  ('SS-4765', 'C-104', 'V-203', 'T-01', 'Newark, NJ',       'Charlotte, NC',      'Power Only',   'Consumer goods',       626, 31400, '2026-09-08', '2026-09-10', 1410.00, 1120.00, 'Paid',      'INV-3306', 'SET-5106'),
  ('SS-4766', 'C-106', 'V-206', 'T-06', 'Miami, FL',        'Atlanta, GA',        'Reefer',       'Beverages',            662, 39800, '2026-09-09', '2026-09-11', 2080.00, 1660.00, 'Paid',      'INV-3308', 'SET-5108'),
  ('SS-4767', 'C-105', 'V-201', 'T-02', 'Los Angeles, CA',  'Phoenix, AZ',        'Dry Van 53''', 'Home furnishings',     373, 28900, '2026-09-11', '2026-09-12',  995.00,  790.00, 'Paid',      'INV-3310', 'SET-5110'),
  ('SS-4768', 'C-108', 'V-205', 'T-05', 'Portland, OR',     'Boise, ID',          'Flatbed',      'Dimensional lumber',   430, 41000, '2026-09-12', '2026-09-13', 1180.00,  940.00, 'Invoiced',  'INV-3312', 'SET-5112'),
  ('SS-4769', 'C-107', 'V-203', 'T-07', 'Indianapolis, IN', 'Newark, NJ',         'Dry Van 48''', 'Auto components',      698, 33100, '2026-09-14', '2026-09-16', 1540.00, 1230.00, 'Invoiced',  'INV-3314', 'SET-5114'),
  ('SS-4770', 'C-101', 'V-201', 'T-02', 'Dallas, TX',       'Atlanta, GA',        'Dry Van 53''', 'Packaged food',        781, 40200, '2026-09-15', '2026-09-17', 1980.00, 1560.00, 'Invoiced',  'INV-3316', 'SET-5116'),
  ('SS-4771', 'C-103', 'V-204', 'T-04', 'Kansas City, MO',  'Denver, CO',         'Flatbed',      'Structural steel',     602, 43200, '2026-09-16', '2026-09-18', 1720.00, 1390.00, 'Invoiced',  'INV-3318', 'SET-5118'),
  ('SS-4772', 'C-102', 'V-202', 'T-03', 'Seattle, WA',      'Salt Lake City, UT', 'Reefer',       'Frozen goods',         832, 36700, '2026-09-17', '2026-09-19', 2640.00, 2110.00, 'Invoiced',  'INV-3320', 'SET-5120'),
  ('SS-4773', 'C-106', 'V-206', 'T-06', 'Houston, TX',      'New Orleans, LA',    'Step Deck',    'Pipe',                 348, 46500, '2026-09-18', '2026-09-19', 1240.00,  980.00, 'Invoiced',  'INV-3322', 'SET-5122'),
  ('SS-4774', 'C-104', 'V-203', 'T-01', 'Amarillo, TX',     'Kansas City, MO',    'Flatbed',      'Steel plate',          535, 42800, '2026-09-19', '2026-09-21', 1480.00, 1180.00, 'Invoiced',  'INV-3324', 'SET-5124'),
  ('SS-4775', 'C-105', 'V-205', 'T-05', 'El Paso, TX',      'Phoenix, AZ',        'Hotshot',      'Expedite parts',       431, 12400, '2026-09-21', '2026-09-22', 1120.00,  890.00, 'Delivered',  NULL,      'SET-5126'),
  ('SS-4776', 'C-102', 'V-202', 'T-03', 'Fresno, CA',       'Denver, CO',         'Reefer',       'Fresh produce',       1178, 38600, '2026-09-23', '2026-09-26', 3760.00, 3010.00, 'In transit', NULL,      NULL),
  ('SS-4777', 'C-101', 'V-201', 'T-02', 'Laredo, TX',       'Chicago, IL',        'Dry Van 53''', 'Palletized dry goods',1383, 42100, '2026-09-24', '2026-09-27', 3240.00, 2590.00, 'In transit', NULL,      NULL),
  ('SS-4778', 'C-108', 'V-204', 'T-04', 'Portland, OR',     'Boise, ID',          'Flatbed',      'Dimensional lumber',   430, 41000, '2026-09-24', '2026-09-25', 1160.00,  930.00, 'At pickup',  NULL,      NULL),
  ('SS-4779', 'C-104', 'V-206', 'T-06', 'Newark, NJ',       'Charlotte, NC',      'Power Only',   'Consumer goods',       626, 31400, '2026-09-25', '2026-09-27', 1380.00, 1100.00, 'Booked',     NULL,      NULL),
  ('SS-4780', 'C-103', 'V-205', 'T-05', 'Savannah, GA',     'Memphis, TN',        'Flatbed',      'Steel coil',           585, 44000, '2026-09-26', '2026-09-28', 1650.00, 1320.00, 'Booked',     NULL,      NULL),
  ('SS-4781', 'C-107', 'V-203', 'T-07', 'Indianapolis, IN', 'Newark, NJ',         'Dry Van 48''', 'Auto components',      698, 33100, '2026-09-26', '2026-09-28', 1520.00, 1210.00, 'Booked',     NULL,      NULL);

-- Accessorials. Negative carrier amounts are fuel advances, recovered at settlement.
INSERT INTO load_accessorials (load_id, side, label, amount) VALUES
  ('SS-4763', 'cust', 'Detention at consignee (2.0 hrs)',  120.00),
  ('SS-4764', 'cust', 'Reefer fuel surcharge',             185.00),
  ('SS-4764', 'carr', 'Fuel advance',                     -500.00),
  ('SS-4766', 'cust', 'Layover',                           250.00),
  ('SS-4768', 'cust', 'Tarp fee',                          100.00),
  ('SS-4768', 'carr', 'Tarp pay',                           75.00),
  ('SS-4770', 'cust', 'Detention at consignee (3.5 hrs)',  210.00),
  ('SS-4770', 'carr', 'Fuel advance',                     -400.00),
  ('SS-4771', 'cust', 'Driver assist',                      90.00),
  ('SS-4772', 'cust', 'Reefer fuel surcharge',             160.00),
  ('SS-4774', 'carr', 'Fuel advance',                     -300.00),
  ('SS-4775', 'cust', 'After-hours delivery',              145.00),
  ('SS-4776', 'cust', 'Reefer fuel surcharge',             175.00);

-- ------------------------------------------------------------- invoices
INSERT INTO invoices (id, customer_id, issued_date, due_date, amount, paid, terms_days, sent, disputed, note) VALUES
  ('INV-3288', 'C-105', '2026-07-14', '2026-08-13',  8420.00,     0.00, 30, 1, 0, 'Second reminder sent 2 Sep.'),
  ('INV-3294', 'C-103', '2026-07-29', '2026-09-12',  6180.00,  2000.00, 45, 1, 0, 'Partial received, chasing balance.'),
  ('INV-3300', 'C-103', '2026-09-07', '2026-10-22',  1620.00,  1620.00, 45, 1, 0, ''),
  ('INV-3302', 'C-101', '2026-09-09', '2026-10-09',  3400.00,  3400.00, 30, 1, 0, ''),
  ('INV-3304', 'C-102', '2026-09-10', '2026-10-01',  4075.00,  4075.00, 21, 1, 0, ''),
  ('INV-3306', 'C-104', '2026-09-11', '2026-10-11',  1410.00,  1410.00, 30, 1, 0, ''),
  ('INV-3308', 'C-106', '2026-09-12', '2026-10-12',  2330.00,  2330.00, 30, 1, 0, ''),
  ('INV-3310', 'C-105', '2026-09-13', '2026-10-13',   995.00,   448.00, 30, 1, 0, 'Partial payment on account.'),
  ('INV-3312', 'C-108', '2026-09-14', '2026-10-14',  1280.00,     0.00, 30, 1, 0, ''),
  ('INV-3314', 'C-107', '2026-09-17', '2026-10-02',  1540.00,     0.00, 15, 1, 0, ''),
  ('INV-3316', 'C-101', '2026-09-18', '2026-10-18',  2190.00,     0.00, 30, 1, 1, 'Customer disputes the driver-assist charge.'),
  ('INV-3318', 'C-103', '2026-09-19', '2026-11-03',  1810.00,     0.00, 45, 1, 0, ''),
  ('INV-3320', 'C-102', '2026-09-20', '2026-10-11',  2800.00,     0.00, 21, 1, 0, ''),
  ('INV-3322', 'C-106', '2026-09-20', '2026-10-20',  1240.00,     0.00, 30, 1, 0, ''),
  ('INV-3324', 'C-104', '2026-09-22', '2026-10-22',  1480.00,     0.00, 30, 1, 0, ''),
  ('INV-3399', 'C-102', '2026-09-24', '2026-10-15',  3760.00,     0.00, 21, 0, 0, '');

INSERT INTO invoice_loads (invoice_id, load_id) VALUES
  ('INV-3300', 'SS-4762'), ('INV-3302', 'SS-4763'), ('INV-3304', 'SS-4764'),
  ('INV-3306', 'SS-4765'), ('INV-3308', 'SS-4766'), ('INV-3310', 'SS-4767'),
  ('INV-3312', 'SS-4768'), ('INV-3314', 'SS-4769'), ('INV-3316', 'SS-4770'),
  ('INV-3318', 'SS-4771'), ('INV-3320', 'SS-4772'), ('INV-3322', 'SS-4773'),
  ('INV-3324', 'SS-4774');

-- ---------------------------------------------------------- settlements
INSERT INTO settlements (id, carrier_id, gross_pay, quick_pay, fee, net_pay, status, method, factor, paid_on) VALUES
  ('SET-5100', 'V-204', 1290.00, 0,   0.00, 1290.00, 'Paid',     'ACH to factor', 'RTS',  '2026-09-18'),
  ('SET-5102', 'V-201', 2620.00, 0,   0.00, 2620.00, 'Paid',     'ACH',            NULL,  '2026-09-20'),
  ('SET-5104', 'V-202', 3110.00, 1,  93.00, 2517.00, 'Paid',     'ACH to factor', 'TAFS', '2026-09-10'),
  ('SET-5106', 'V-203', 1120.00, 1,  34.00, 1086.00, 'Paid',     'ACH',            NULL,  '2026-09-11'),
  ('SET-5108', 'V-206', 1660.00, 1,  50.00, 1610.00, 'Paid',     'ACH to factor', 'Apex', '2026-09-12'),
  ('SET-5110', 'V-201',  790.00, 0,   0.00,  790.00, 'Paid',     'ACH',            NULL,  '2026-09-24'),
  ('SET-5112', 'V-205', 1015.00, 0,   0.00, 1015.00, 'Approved', 'ACH',            NULL,  NULL),
  ('SET-5114', 'V-203', 1230.00, 1,  37.00, 1193.00, 'Approved', 'ACH',            NULL,  NULL),
  ('SET-5116', 'V-201', 1560.00, 0,   0.00, 1160.00, 'Approved', 'ACH',            NULL,  NULL),
  ('SET-5118', 'V-204', 1390.00, 0,   0.00, 1390.00, 'Approved', 'ACH to factor', 'RTS',  NULL),
  ('SET-5120', 'V-202', 2110.00, 1,  63.00, 2047.00, 'Approved', 'ACH to factor', 'TAFS', NULL),
  ('SET-5122', 'V-206',  980.00, 1,  29.00,  951.00, 'Approved', 'ACH to factor', 'Apex', NULL),
  ('SET-5124', 'V-203', 1180.00, 1,  35.00,  845.00, 'Approved', 'ACH',            NULL,  NULL),
  ('SET-5126', 'V-205',  890.00, 0,   0.00,  890.00, 'Pending',  'ACH',            NULL,  NULL);

INSERT INTO settlement_deductions (settlement_id, label, amount) VALUES
  ('SET-5104', 'Fuel advance recovery', 500.00),
  ('SET-5116', 'Fuel advance recovery', 400.00),
  ('SET-5124', 'Fuel advance recovery', 300.00);

-- ------------------------------------------------------------- payments
INSERT INTO payments (id, paid_date, direction, party, method, reference, amount, link_id) VALUES
  ('PMT-7001', '2026-09-05', 'in',  'Tallgrass Steel',                  'Check', 'CHK 20418', 2000.00, 'INV-3294'),
  ('PMT-7002', '2026-09-24', 'in',  'Tallgrass Steel',                  'Check', 'CHK 20533', 1620.00, 'INV-3300'),
  ('PMT-7003', '2026-09-24', 'in',  'Bradford Foods Inc.',              'ACH',   'DEP72101',  3400.00, 'INV-3302'),
  ('PMT-7004', '2026-09-23', 'in',  'Kestrel Produce',                  'ACH',   'DEP72102',  4075.00, 'INV-3304'),
  ('PMT-7005', '2026-09-23', 'in',  'Marlow Distribution',              'ACH',   'DEP72103',  1410.00, 'INV-3306'),
  ('PMT-7006', '2026-09-22', 'in',  'Northfield Beverage',              'ACH',   'DEP72104',  2330.00, 'INV-3308'),
  ('PMT-7007', '2026-09-22', 'in',  'Verde Home Goods',                 'Card',  'DEP72105',   448.00, 'INV-3310'),
  ('PMT-7010', '2026-09-18', 'out', 'Great Lakes Haulage (via RTS)',    'ACH to factor', 'ACH41000', 1290.00, 'SET-5100'),
  ('PMT-7011', '2026-09-20', 'out', 'Sierra Vista Logistics',           'ACH',   'ACH41001',  2620.00, 'SET-5102'),
  ('PMT-7012', '2026-09-10', 'out', 'Cardinal Line Carriers (via TAFS)','ACH to factor', 'ACH41002', 2517.00, 'SET-5104'),
  ('PMT-7013', '2026-09-11', 'out', 'Vasquez Transport LLC',            'ACH',   'ACH41003',  1086.00, 'SET-5106'),
  ('PMT-7014', '2026-09-12', 'out', 'Blue Ridge Freightways (via Apex)','ACH to factor', 'ACH41004', 1610.00, 'SET-5108'),
  ('PMT-7015', '2026-09-24', 'out', 'Sierra Vista Logistics',           'ACH',   'ACH41005',   790.00, 'SET-5110');
