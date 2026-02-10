const fs = require('fs');
const path = require('path');

// ─── Full multi-region configuration (fictional brand & data) ──────────────────

const CSV_HEADER = [
  'LOCATION','SITE_NAME','SUB_DISTRICT','REGIONAL_AREA','INVOICE_NUMBER',
  'ORDER_NUMBER','ORIGINAL_ORDER_NUMBER','ORDER_NUMBER_RELATION',
  'SKU_NUMBER','SKU_NAME','TOTAL_QTY','UNIT_PRICE','MP_PRICE','NETT_SALES','SALES',
  'ORDER_QTY_NEW','UNIT_PRICE_NEW','MP_PRICE_NEW','LINE_AMOUNT_NEW','ITEM_GROSS_AMOUNT_NEW',
  'EMPLOYEE_NUMBER','EMPLOYEE_NAME','SALES_TARGET','SALES_TARGET_UNIQ',
  'POSITION','IS_STORE_LEAD','CHANNEL_CODE','CHANNEL_NAME','STATUS','NOTES','FLAG',
  'ORDER_ITEM_ID','DIST_CHANNEL_CODE','DIST_CHAN_DESC','SHIPPING_DATE',
  'MATL_TYPE_DESC','MATL_TYPE','MGH_1','MGH_2','MGH_3','MGH_4',
  'PRODUCT_TYPE','GENDER','IS_BOGO','IS_GWP','JUMLAH_PEMBAGI','JOB_ID','PRC_DT','Column1',
];

// ─── Fictional product catalog ─────────────────────────────────────────────────
// 3 brands: Summit Gear (outdoor/adventure), Nomad Co (lifestyle), Basecamp (urban tech)

const PRODUCT_CATALOG = {
  SUMMIT: {
    mgh1: 'SUMMIT GEAR', mgh2: 'OUTDOOR & ADVENTURE',
    categories: [
      {
        mgh3: 'CARRY GOODS', weight: 22,
        products: [
          { sku: 'SG-BP-3001', name: 'Summit Ridgeline 30L Daypack', price: 599000, type: 'Daypack' },
          { sku: 'SG-BP-2501', name: 'Summit Trailblazer 25L Pack', price: 449000, type: 'Daypack' },
          { sku: 'SG-BP-2202', name: 'Summit Horizon 22L Daypack', price: 529000, type: 'Daypack' },
          { sku: 'SG-CR-6501', name: 'Summit Everest 65L Carrier', price: 1899000, type: 'Carrier' },
          { sku: 'SG-CR-7502', name: 'Summit K2 75+10L Carrier', price: 2299000, type: 'Carrier' },
          { sku: 'SG-CR-5503', name: 'Summit Annapurna 55L Carrier', price: 1599000, type: 'Carrier' },
          { sku: 'SG-WB-0501', name: 'Summit Nomad Waist Bag 5L', price: 249000, type: 'Waist Bag' },
          { sku: 'SG-SL-0301', name: 'Summit Transit Sling Bag', price: 329000, type: 'Sling Bag' },
          { sku: 'SG-SL-0302', name: 'Summit Traverse 2.0 Sling Bag', price: 279000, type: 'Sling Bag' },
          { sku: 'SG-SV-1401', name: 'Summit DigiVault Laptop Sleeve 14"', price: 199000, type: 'Sling Bag' },
        ],
      },
      {
        mgh3: 'SHOES', weight: 18,
        products: [
          { sku: 'SG-FW-8901', name: 'Summit Viper Mid Cut Hiking Boot', price: 899000, type: 'Hiking Shoes' },
          { sku: 'SG-FW-7901', name: 'Summit Polaris WP Hiking Shoes', price: 799000, type: 'Hiking Shoes' },
          { sku: 'SG-FW-7502', name: 'Summit Raptor 2.0 Trail Running', price: 749000, type: 'Trail Running' },
          { sku: 'SG-SD-2901', name: 'Summit Breeze Comfort Sandals', price: 299000, type: 'Sandals' },
          { sku: 'SG-SD-3501', name: 'Summit Velocity 3 Sandals', price: 349000, type: 'Sandals' },
          { sku: 'SG-SD-2602', name: 'Summit Recovery Pro Sandals', price: 269000, type: 'Sandals' },
          { sku: 'SG-FW-6701', name: 'Summit Vertex Approach Shoes', price: 679000, type: 'Hiking Shoes' },
          { sku: 'SG-FW-1291', name: 'Summit Zenith GTX Mid Boots', price: 1299000, type: 'Hiking Shoes' },
        ],
      },
      {
        mgh3: 'CLOTHING', weight: 30,
        products: [
          { sku: 'SG-JK-8901', name: 'Summit Moto Rapid 1.1 Riding Jacket', price: 899000, type: 'Jacket' },
          { sku: 'SG-JK-1291', name: 'Summit StormShield WP Jacket', price: 1299000, type: 'Jacket' },
          { sku: 'SG-JK-1591', name: 'Summit Thermal Down Jacket', price: 1599000, type: 'Jacket' },
          { sku: 'SG-JK-6491', name: 'Summit Mosquito Guard Hoodie', price: 649000, type: 'Jacket' },
          { sku: 'SG-TS-1791', name: 'Summit Basecamp Tee', price: 179000, type: 'T-Shirt' },
          { sku: 'SG-TS-1992', name: 'Summit Pathfinder Graphic Tee', price: 199000, type: 'T-Shirt' },
          { sku: 'SG-TS-1693', name: 'Summit Mountain Born Tee', price: 169000, type: 'T-Shirt' },
          { sku: 'SG-PL-2791', name: 'Summit Wild Terrain Polo', price: 279000, type: 'T-Shirt' },
          { sku: 'SG-PT-4991', name: 'Summit Highland Cargo Pants', price: 499000, type: 'Pants' },
          { sku: 'SG-PT-5491', name: 'Summit Convertible Trek Pants', price: 549000, type: 'Pants' },
          { sku: 'SG-SH-3291', name: 'Summit QuickDry Trail Shorts', price: 329000, type: 'Shorts' },
          { sku: 'SG-SH-2992', name: 'Summit Urban Commuter Shorts', price: 299000, type: 'Shorts' },
        ],
      },
      {
        mgh3: 'HEAD GEAR', weight: 10,
        products: [
          { sku: 'SG-CP-1491', name: 'Summit Classic Baseball Cap BLK', price: 149000, type: 'Caps' },
          { sku: 'SG-CP-1292', name: 'Summit Adventure Trucker Cap', price: 129000, type: 'Caps' },
          { sku: 'SG-HT-1991', name: 'Summit Safari Boonie Hat', price: 199000, type: 'Hats' },
          { sku: 'SG-BN-1791', name: 'Summit Merino Wool Beanie', price: 179000, type: 'Beanies' },
          { sku: 'SG-HT-1692', name: 'Summit Tactical Bucket Hat', price: 169000, type: 'Hats' },
        ],
      },
      {
        mgh3: 'ADD-ONS', weight: 10,
        products: [
          { sku: 'SG-AC-3991', name: 'Summit Ride Polarized Sunglasses', price: 399000, type: 'Sunglasses' },
          { sku: 'SG-AC-5991', name: 'Summit Peak Digital Watch', price: 599000, type: 'Watch' },
          { sku: 'SG-AC-1491', name: 'Summit Tactical Nylon Belt', price: 149000, type: 'Belt' },
          { sku: 'SG-AC-2491', name: 'Summit RFID Bifold Wallet', price: 249000, type: 'Wallet' },
          { sku: 'SG-AC-8991', name: 'Summit Compass Pro Watch', price: 899000, type: 'Watch' },
          { sku: 'SG-AC-3291', name: 'Summit Carbon Fiber Wallet', price: 329000, type: 'Wallet' },
        ],
      },
      {
        mgh3: 'GEAR', weight: 10,
        products: [
          { sku: 'SG-EQ-2491', name: 'Summit Basecamp 4P Tent', price: 2499000, type: 'Tent' },
          { sku: 'SG-EQ-1191', name: 'Summit Glacier -5C Sleeping Bag', price: 1199000, type: 'Sleeping Bag' },
          { sku: 'SG-EQ-4491', name: 'Summit Jungle King Hammock', price: 449000, type: 'Hammock' },
          { sku: 'SG-EQ-6991', name: 'Summit Carbon Lite Trekking Pole', price: 699000, type: 'Trekking Pole' },
          { sku: 'SG-EQ-3491', name: 'Summit Alpine 2P Ultralight Tent', price: 3499000, type: 'Tent' },
          { sku: 'SG-EQ-3492', name: 'Summit Nomad Cooking Set', price: 349000, type: 'Trekking Pole' },
        ],
      },
    ],
  },
  NOMAD: {
    mgh1: 'NOMAD CO', mgh2: 'LIFESTYLE',
    categories: [
      {
        mgh3: 'CARRY GOODS', weight: 55,
        products: [
          { sku: 'NC-BP-2991', name: 'Nomad Delanoir 2.0 Backpack', price: 299000, type: 'Backpack' },
          { sku: 'NC-LP-3491', name: 'Nomad Freya Laptop Backpack 15"', price: 349000, type: 'Laptop Bag' },
          { sku: 'NC-TV-4491', name: 'Nomad Cityzen Travel Bag', price: 449000, type: 'Travel Bag' },
          { sku: 'NC-BP-2492', name: 'Nomad Havana Mini Backpack', price: 249000, type: 'Backpack' },
          { sku: 'NC-BP-2793', name: 'Nomad Scholar School Backpack', price: 279000, type: 'Backpack' },
          { sku: 'NC-LP-3292', name: 'Nomad Commuter Laptop Bag 14"', price: 329000, type: 'Laptop Bag' },
        ],
      },
      {
        mgh3: 'ADD-ONS', weight: 45,
        products: [
          { sku: 'NC-AC-0791', name: 'Nomad Denim Pencil Case', price: 79000, type: 'Pencil Case' },
          { sku: 'NC-AC-0991', name: 'Nomad Utility Pouch L', price: 99000, type: 'Pouch' },
          { sku: 'NC-AC-0391', name: 'Nomad Explorer Lanyard', price: 39000, type: 'Lanyard' },
          { sku: 'NC-AC-1491', name: 'Nomad Canvas Tote Bag', price: 149000, type: 'Pouch' },
          { sku: 'NC-AC-1291', name: 'Nomad Multi Organizer Pouch', price: 129000, type: 'Pouch' },
        ],
      },
    ],
  },
  BASECAMP: {
    mgh1: 'BASECAMP', mgh2: 'URBAN TECH',
    categories: [
      {
        mgh3: 'CARRY GOODS', weight: 60,
        products: [
          { sku: 'BC-BP-3991', name: 'Basecamp Berlin Laptop Backpack', price: 399000, type: 'Backpack' },
          { sku: 'BC-SL-3491', name: 'Basecamp Anti-Theft Sling Pro', price: 349000, type: 'Sling Bag' },
          { sku: 'BC-BP-4491', name: 'Basecamp Tokyo 2.0 Backpack', price: 449000, type: 'Backpack' },
          { sku: 'BC-WB-1991', name: 'Basecamp Commuter Waist Bag', price: 199000, type: 'Waist Bag' },
        ],
      },
      {
        mgh3: 'ADD-ONS', weight: 40,
        products: [
          { sku: 'BC-AC-1491', name: 'Basecamp Digital Pouch Pro', price: 149000, type: 'Pouch' },
          { sku: 'BC-AC-0991', name: 'Basecamp Cable Organizer', price: 99000, type: 'Pouch' },
          { sku: 'BC-AC-1791', name: 'Basecamp RFID Passport Holder', price: 179000, type: 'Wallet' },
        ],
      },
    ],
  },
};

// Material type mapping
const MATERIAL_TYPES = [
  { code: 'ZSMG', name: 'Summit Gear', catalog: 'SUMMIT', weight: 65 },
  { code: 'ZNCO', name: 'Nomad Co', catalog: 'NOMAD', weight: 22 },
  { code: 'ZBCP', name: 'Basecamp', catalog: 'BASECAMP', weight: 13 },
];

// ─── Regional / Sub-district / Site / RA full hierarchy ───────────────────────

const REGIONS = [
  {
    regional: 'REGIONAL 1',
    subDistricts: [
      {
        code: 'DKI 01', label: 'DKI Jakarta 1',
        sites: [
          { loc: '1101', name: 'Hub Store Alpha-01' },
          { loc: '1102', name: 'Hub Store Alpha-02' },
          { loc: '1103', name: 'Hub Store Alpha-03' },
          { loc: '1104', name: 'Hub Store Alpha-04' },
        ],
        ras: [
          'RA-A01 Arya K.', 'RA-A02 Bella S.', 'RA-A03 Chandra D.', 'RA-A04 Dina W.',
          'RA-A05 Erwin P.', 'RA-A06 Farah M.', 'RA-A07 Gilang R.', 'RA-A08 Hana T.',
        ],
        baseTarget: 65000000,
        txPerMonth: [240, 260, 280],
      },
      {
        code: 'DKI 02', label: 'DKI Jakarta 2',
        sites: [
          { loc: '1201', name: 'Hub Store Beta-01' },
          { loc: '1202', name: 'Hub Store Beta-02' },
          { loc: '1203', name: 'Hub Store Beta-03' },
          { loc: '1204', name: 'Hub Store Beta-04' },
          { loc: '1205', name: 'Hub Store Beta-05' },
        ],
        ras: [
          'RA-B01 Irfan A.', 'RA-B02 Jasmine L.', 'RA-B03 Kevin H.', 'RA-B04 Lina P.',
          'RA-B05 Mario S.', 'RA-B06 Nita R.', 'RA-B07 Oscar W.', 'RA-B08 Putri D.',
          'RA-B09 Reza F.', 'RA-B10 Sari N.', 'RA-B11 Tono M.', 'RA-B12 Umi K.',
        ],
        baseTarget: 50000000,
        txPerMonth: [300, 340, 370],
      },
      {
        code: 'DKI 03', label: 'DKI Jakarta 3',
        sites: [
          { loc: '1301', name: 'Hub Store Gamma-01' },
          { loc: '1302', name: 'Hub Store Gamma-02' },
          { loc: '1303', name: 'Hub Store Gamma-03' },
        ],
        ras: [
          'RA-C01 Vino H.', 'RA-C02 Wati S.', 'RA-C03 Xander P.', 'RA-C04 Yanti R.',
          'RA-C05 Zaki M.', 'RA-C06 Alia F.',
        ],
        baseTarget: 55000000,
        txPerMonth: [180, 200, 210],
      },
      {
        code: 'DKI 04', label: 'DKI Jakarta 4',
        sites: [
          { loc: '1401', name: 'Hub Store Delta-01' },
          { loc: '1402', name: 'Hub Store Delta-02' },
          { loc: '1403', name: 'Hub Store Delta-03' },
        ],
        ras: [
          'RA-D01 Bayu T.', 'RA-D02 Citra A.', 'RA-D03 Dani W.', 'RA-D04 Eka P.',
          'RA-D05 Farel S.', 'RA-D06 Gita N.',
        ],
        baseTarget: 48000000,
        txPerMonth: [170, 190, 200],
      },
    ],
  },
  {
    regional: 'REGIONAL 2',
    subDistricts: [
      {
        code: 'JABAR 01', label: 'Jawa Barat 1',
        sites: [
          { loc: '2101', name: 'Hub Store Epsilon-01' },
          { loc: '2102', name: 'Hub Store Epsilon-02' },
          { loc: '2103', name: 'Hub Store Epsilon-03' },
          { loc: '2104', name: 'Hub Store Epsilon-04' },
        ],
        ras: [
          'RA-E01 Hadi K.', 'RA-E02 Indri M.', 'RA-E03 Jaya P.', 'RA-E04 Kania S.',
          'RA-E05 Leo R.', 'RA-E06 Mega D.', 'RA-E07 Nanda F.', 'RA-E08 Okta W.',
        ],
        baseTarget: 60000000,
        txPerMonth: [250, 270, 290],
      },
      {
        code: 'JABAR 02', label: 'Jawa Barat 2',
        sites: [
          { loc: '2201', name: 'Hub Store Zeta-01' },
          { loc: '2202', name: 'Hub Store Zeta-02' },
        ],
        ras: [
          'RA-F01 Panca T.', 'RA-F02 Queen A.', 'RA-F03 Rio H.', 'RA-F04 Sinta L.',
        ],
        baseTarget: 42000000,
        txPerMonth: [120, 130, 140],
      },
      {
        code: 'JABAR 03', label: 'Jawa Barat 3',
        sites: [
          { loc: '2301', name: 'Hub Store Eta-01' },
          { loc: '2302', name: 'Hub Store Eta-02' },
        ],
        ras: [
          'RA-G01 Tegar N.', 'RA-G02 Ulfa P.', 'RA-G03 Vega R.', 'RA-G04 Wulan D.',
        ],
        baseTarget: 40000000,
        txPerMonth: [110, 120, 130],
      },
      {
        code: 'JABAR 04', label: 'Jawa Barat 4',
        sites: [
          { loc: '2401', name: 'Hub Store Theta-01' },
          { loc: '2402', name: 'Hub Store Theta-02' },
        ],
        ras: [
          'RA-H01 Yoga S.', 'RA-H02 Zahra K.', 'RA-H03 Adhi M.', 'RA-H04 Bunga F.',
        ],
        baseTarget: 38000000,
        txPerMonth: [100, 110, 120],
      },
    ],
  },
  {
    regional: 'REGIONAL 3',
    subDistricts: [
      {
        code: 'JATENG 02', label: 'Jawa Tengah 2',
        sites: [
          { loc: '3201', name: 'Hub Store Iota-01' },
          { loc: '3202', name: 'Hub Store Iota-02' },
          { loc: '3203', name: 'Hub Store Iota-03' },
        ],
        ras: [
          'RA-I01 Cakra W.', 'RA-I02 Dewi L.', 'RA-I03 Ega P.', 'RA-I04 Fitri A.',
          'RA-I05 Galih S.', 'RA-I06 Hesti R.',
        ],
        baseTarget: 45000000,
        txPerMonth: [160, 180, 190],
      },
      {
        code: 'JATIM 01', label: 'Jawa Timur 1',
        sites: [
          { loc: '3301', name: 'Hub Store Kappa-01' },
          { loc: '3302', name: 'Hub Store Kappa-02' },
          { loc: '3303', name: 'Hub Store Kappa-03' },
        ],
        ras: [
          'RA-J01 Ivan T.', 'RA-J02 Juli N.', 'RA-J03 Kris M.', 'RA-J04 Luna S.',
          'RA-J05 Miko D.', 'RA-J06 Nisa H.', 'RA-J07 Oki R.',
        ],
        baseTarget: 55000000,
        txPerMonth: [200, 220, 240],
      },
      {
        code: 'JATIM 02', label: 'Jawa Timur 2',
        sites: [
          { loc: '3401', name: 'Hub Store Lambda-01' },
          { loc: '3402', name: 'Hub Store Lambda-02' },
        ],
        ras: [
          'RA-K01 Panji W.', 'RA-K02 Ratih K.', 'RA-K03 Satria F.', 'RA-K04 Tiara N.',
        ],
        baseTarget: 43000000,
        txPerMonth: [130, 140, 150],
      },
      {
        code: 'JATIM 03', label: 'Jawa Timur 3',
        sites: [
          { loc: '3501', name: 'Hub Store Mu-01' },
          { loc: '3502', name: 'Hub Store Mu-02' },
        ],
        ras: [
          'RA-L01 Umar P.', 'RA-L02 Vera S.', 'RA-L03 Wisnu A.', 'RA-L04 Xena D.',
        ],
        baseTarget: 38000000,
        txPerMonth: [100, 110, 115],
      },
    ],
  },
  {
    regional: 'REGIONAL 4',
    subDistricts: [
      {
        code: 'SUMATERA 01', label: 'Sumatera 1',
        sites: [
          { loc: '4101', name: 'Hub Store Nu-01' },
          { loc: '4102', name: 'Hub Store Nu-02' },
        ],
        ras: [
          'RA-M01 Yudha R.', 'RA-M02 Zara T.', 'RA-M03 Aldo K.', 'RA-M04 Bella N.',
        ],
        baseTarget: 42000000,
        txPerMonth: [120, 130, 140],
      },
      {
        code: 'SUMATERA 02', label: 'Sumatera 2',
        sites: [
          { loc: '4201', name: 'Hub Store Xi-01' },
          { loc: '4202', name: 'Hub Store Xi-02' },
        ],
        ras: [
          'RA-N01 Carlos M.', 'RA-N02 Diana F.', 'RA-N03 Edo S.', 'RA-N04 Fira W.',
        ],
        baseTarget: 40000000,
        txPerMonth: [110, 120, 125],
      },
      {
        code: 'SUMATERA 03', label: 'Sumatera 3',
        sites: [
          { loc: '4301', name: 'Hub Store Omicron-01' },
          { loc: '4302', name: 'Hub Store Omicron-02' },
        ],
        ras: [
          'RA-O01 Gani P.', 'RA-O02 Hilda R.', 'RA-O03 Ilham D.', 'RA-O04 Jelita K.',
        ],
        baseTarget: 38000000,
        txPerMonth: [100, 110, 115],
      },
    ],
  },
  {
    regional: 'REGIONAL 5',
    subDistricts: [
      {
        code: 'IBT 01', label: 'Indonesia Bagian Timur 1',
        sites: [
          { loc: '5101', name: 'Hub Store Pi-01' },
          { loc: '5102', name: 'Hub Store Pi-02' },
        ],
        ras: [
          'RA-P01 Kenzo A.', 'RA-P02 Laras S.', 'RA-P03 Maulana H.', 'RA-P04 Nayla T.',
        ],
        baseTarget: 40000000,
        txPerMonth: [110, 120, 130],
      },
      {
        code: 'IBT 02', label: 'Indonesia Bagian Timur 2',
        sites: [
          { loc: '5201', name: 'Hub Store Rho-01' },
          { loc: '5202', name: 'Hub Store Rho-02' },
          { loc: '5203', name: 'Hub Store Rho-03' },
        ],
        ras: [
          'RA-Q01 Ozan D.', 'RA-Q02 Pipit W.', 'RA-Q03 Raka F.', 'RA-Q04 Shinta M.',
          'RA-Q05 Tomi K.', 'RA-Q06 Ulfa B.',
        ],
        baseTarget: 52000000,
        txPerMonth: [170, 190, 200],
      },
      {
        code: 'IBT 03', label: 'Indonesia Bagian Timur 3',
        sites: [
          { loc: '5301', name: 'Hub Store Sigma-01' },
        ],
        ras: [
          'RA-R01 Valdo N.', 'RA-R02 Wenny P.', 'RA-R03 Xavi R.',
        ],
        baseTarget: 35000000,
        txPerMonth: [80, 90, 95],
      },
      {
        code: 'IBT 04', label: 'Indonesia Bagian Timur 4',
        sites: [
          { loc: '5401', name: 'Hub Store Tau-01' },
        ],
        ras: [
          'RA-S01 Yoel K.', 'RA-S02 Zita A.', 'RA-S03 Abi W.',
        ],
        baseTarget: 32000000,
        txPerMonth: [70, 80, 85],
      },
    ],
  },
];

// Shared options
const DIST_CHANNELS = [
  { code: 'R1', name: 'DIRECT', weight: 60 },
  { code: 'R2', name: 'BULK ORDER', weight: 12 },
  { code: 'R3', name: 'E-COMMERCE', weight: 22 },
  { code: 'R4', name: 'B2B', weight: 6 },
];

const CHANNELS = [
  { code: 'C01', name: 'Direct', weight: 45 },
  { code: 'C02', name: 'Loyalty', weight: 30 },
  { code: 'C03', name: 'Partner', weight: 15 },
  { code: 'C04', name: 'B2B', weight: 5 },
  { code: 'C12', name: 'Direct', weight: 5 },
];

const PRODUCT_TYPES = [
  { name: 'Regular', weight: 65 },
  { name: 'Limited Edition', weight: 15 },
  { name: 'Collaboration', weight: 10 },
  { name: 'Outlet', weight: 5 },
  { name: 'Seasonal', weight: 5 },
];

const GENDERS = ['Male', 'Female', 'Adult Unisex', 'Kids Unisex'];

const RETURN_REASONS = [
  'Size Tidak Sesuai', 'Produk Cacat', 'Warna Tidak Sesuai',
  'Berubah Pikiran', 'Salah Kirim', 'Tidak Sesuai Deskripsi',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function weightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(month) {
  const daysInMonth = [31, 28, 31];
  const maxDay = daysInMonth[month - 1];
  const day = randomInt(1, maxDay);
  const h = randomInt(8, 21);
  const m = randomInt(0, 59);
  const s = randomInt(0, 59);
  return `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.000000 UTC`;
}

let globalInvoiceCounter = 0;
let globalOrderBase = 2.27625e14;

function nextInvoice(location, month) {
  globalInvoiceCounter++;
  const dateStr = `2502${String(month).padStart(2, '0')}`;
  return `${location}-${dateStr}-${String(globalInvoiceCounter).padStart(5, '0')}`;
}

function nextOrderNum() {
  globalOrderBase++;
  return globalOrderBase.toExponential(5);
}

// ─── Row generator ─────────────────────────────────────────────────────────────

function generateSubDistrictRows(region, sd) {
  const allRows = [];

  // Pre-compute RA monthly performance multipliers
  const raMultipliers = {};
  const raIds = {};
  sd.ras.forEach((name, idx) => {
    const id = `${sd.code.replace(/\s/g, '')}${String(idx + 1).padStart(3, '0')}`;
    raIds[name] = id;
    raMultipliers[name] = {
      1: 0.65 + Math.random() * 0.7,
      2: 0.65 + Math.random() * 0.7,
      3: 0.65 + Math.random() * 0.7,
    };
  });

  // Assign RAs to sites round-robin
  const raSiteMap = {};
  sd.ras.forEach((name, idx) => {
    raSiteMap[name] = idx % sd.sites.length;
  });

  // First RA at each site is store lead
  const storeLeads = new Set();
  const siteSeen = new Set();
  sd.ras.forEach(name => {
    const siteIdx = raSiteMap[name];
    if (!siteSeen.has(siteIdx)) {
      siteSeen.add(siteIdx);
      storeLeads.add(name);
    }
  });

  for (let month = 1; month <= 3; month++) {
    const txCount = sd.txPerMonth[month - 1];
    const returnCount = Math.round(txCount * (0.03 + Math.random() * 0.05));

    for (let i = 0; i < txCount + returnCount; i++) {
      const isReturn = i >= txCount;

      const raName = sd.ras[randomInt(0, sd.ras.length - 1)];
      const raId = raIds[raName];
      const siteIdx = raSiteMap[raName];
      const site = sd.sites[siteIdx];

      const matType = weightedRandom(MATERIAL_TYPES);
      const catalog = PRODUCT_CATALOG[matType.catalog];
      const category = weightedRandom(catalog.categories);
      const product = category.products[randomInt(0, category.products.length - 1)];

      const distChannel = weightedRandom(DIST_CHANNELS);
      const channel = weightedRandom(CHANNELS);
      const productType = weightedRandom(PRODUCT_TYPES);
      const gender = GENDERS[randomInt(0, GENDERS.length - 1)];

      let qty = randomInt(1, 4);
      let unitPrice = product.price;
      unitPrice = Math.round(unitPrice * (0.9 + Math.random() * 0.2));
      unitPrice = Math.round(unitPrice / 1000) * 1000;

      let nettSales = qty * unitPrice;
      let sales = qty * unitPrice;

      if (channel.name === 'Loyalty') {
        nettSales = Math.round(nettSales * (0.9 + Math.random() * 0.05));
      } else if (channel.name === 'Partner') {
        nettSales = Math.round(nettSales * (0.8 + Math.random() * 0.1));
      } else {
        nettSales = Math.round(nettSales * (0.95 + Math.random() * 0.05));
      }

      let status = 'delivered';
      let notes = '';
      let flag = '';
      if (isReturn) {
        qty = -randomInt(1, 2);
        nettSales = qty * unitPrice;
        sales = qty * unitPrice;
        status = 'returned';
        notes = RETURN_REASONS[randomInt(0, RETURN_REASONS.length - 1)];
        flag = 'EXCLUDE TRANSACTION';
      }

      const mult = raMultipliers[raName][month];
      const monthlyTarget = Math.round(sd.baseTarget * mult);

      const isGwp = Math.random() < 0.08 ? 'TRUE' : 'FALSE';
      const isBogo = Math.random() < 0.04 ? 'TRUE' : 'FALSE';

      const orderNum = nextOrderNum();
      const positionLabel = `${sd.label} Sales Employee`;

      const row = {
        LOCATION: site.loc,
        SITE_NAME: site.name,
        SUB_DISTRICT: sd.code,
        REGIONAL_AREA: region.regional,
        INVOICE_NUMBER: nextInvoice(site.loc, month),
        ORDER_NUMBER: orderNum,
        ORIGINAL_ORDER_NUMBER: orderNum,
        ORDER_NUMBER_RELATION: orderNum,
        SKU_NUMBER: product.sku,
        SKU_NAME: product.name,
        TOTAL_QTY: qty,
        UNIT_PRICE: unitPrice,
        MP_PRICE: unitPrice,
        NETT_SALES: nettSales,
        SALES: sales,
        ORDER_QTY_NEW: '',
        UNIT_PRICE_NEW: '',
        MP_PRICE_NEW: '',
        LINE_AMOUNT_NEW: '',
        ITEM_GROSS_AMOUNT_NEW: '',
        EMPLOYEE_NUMBER: raId,
        EMPLOYEE_NAME: raName,
        SALES_TARGET: monthlyTarget,
        SALES_TARGET_UNIQ: isReturn ? 0 : monthlyTarget,
        POSITION: positionLabel,
        IS_STORE_LEAD: storeLeads.has(raName) ? 'TRUE' : 'FALSE',
        CHANNEL_CODE: channel.code,
        CHANNEL_NAME: channel.name,
        STATUS: status,
        NOTES: notes,
        FLAG: flag,
        ORDER_ITEM_ID: randomInt(27000000, 29999999),
        DIST_CHANNEL_CODE: distChannel.code,
        DIST_CHAN_DESC: distChannel.name,
        SHIPPING_DATE: randomDate(month),
        MATL_TYPE_DESC: matType.name,
        MATL_TYPE: matType.code,
        MGH_1: catalog.mgh1,
        MGH_2: catalog.mgh2,
        MGH_3: category.mgh3,
        MGH_4: product.type,
        PRODUCT_TYPE: productType.name,
        GENDER: gender,
        IS_BOGO: isBogo,
        IS_GWP: isGwp,
        JUMLAH_PEMBAGI: 1,
        JOB_ID: (2.026e13 + randomInt(1, 9999)).toExponential(5),
        PRC_DT: '20260204',
        Column1: '20260113',
      };

      allRows.push(row);
    }
  }

  return allRows;
}

// ─── CSV escaping ──────────────────────────────────────────────────────────────

function escapeCSV(val) {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('Generating full dummy dataset for all regions...\n');

  const allRows = [];
  const stats = {};

  for (const region of REGIONS) {
    for (const sd of region.subDistricts) {
      const rows = generateSubDistrictRows(region, sd);
      allRows.push(...rows);
      stats[sd.code] = rows.length;
      console.log(`  ${sd.code.padEnd(14)} (${sd.label.padEnd(30)}) → ${rows.length} rows  [${sd.sites.length} sites, ${sd.ras.length} RAs]`);
    }
  }

  // Shuffle rows
  for (let i = allRows.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [allRows[i], allRows[j]] = [allRows[j], allRows[i]];
  }

  // Build CSV
  const headerLine = CSV_HEADER.join(',');
  const dataLines = allRows.map(row =>
    CSV_HEADER.map(col => escapeCSV(row[col] !== undefined ? row[col] : '')).join(',')
  );

  const csv = [headerLine, ...dataLines].join('\n');

  const outPath = path.join(__dirname, '..', 'src', 'dummy tagging new.csv');
  fs.writeFileSync(outPath, csv);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Total rows:         ${allRows.length.toLocaleString()}`);
  console.log(`Sub-districts:      ${Object.keys(stats).length}`);
  console.log(`Regions:            ${REGIONS.length}`);
  console.log(`File size:          ${(Buffer.byteLength(csv) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Output:             ${outPath}`);
}

main();
