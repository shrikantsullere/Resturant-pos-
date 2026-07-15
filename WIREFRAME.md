# 🏨 Hospitality Operations — Wireframe Architecture

---

## 🧭 Unified Main Layout

---

| Sidebar (RBAC)  | Top Navbar (Global Alerts + Profile) |
|                 -------------------------------------
|                 | Main Operational Content Area       |
|                 |                                     |
-------------------------------------------------------

---

## 📊 Executive Dashboard (Command Center)

---

| Revenue Summary | Occupancy Rate | Kitchen Load | Active Staff |
| ₹45,200 (+12%)  | 85% (32/40)   | Medium       | 12 Online    |

---

| Revenue Heatmap (7D) | Departmental Performance |
| [ Bar Chart ]        | [ Progress Bars ]        |
-------------------------------------------------------

---

## 🛌 Hospitality Desk (Room Grid)

---

---------------- PROPERTY VIEW ----------------

[ RM-101 🟢 ] [ RM-102 🔴 ] [ RM-103 🟡 ]
[ RM-201 🔴 ] [ RM-202 🟢 ] [ RM-203 🔵 ]

Legend:
🟢 Available  🔴 Occupied  🟡 Reserved  🔵 Cleaning

---

Room Detail (RM-102):
Guest: Alexander Wright
Folio Balance: ₹12,500

[ Post Charge ] [ Manage Folio ] [ Request Service ]

---

## 🧾 Smart POS Screen (Restaurant)

---

| CATEGORIES (Tabs) | MENU GRID          | ACTIVE CART (Drawer) |
| [ Pizza ]         | [ Item Card ]      | [ Selected Items ]   |
| [ Drinks ]        | [ Item Card ]      | [ Qty Controls ]     |

| Checkout Options:                                    |
| [ Cash ] [ Card ] [ UPI ] [ **ROOM SERVICE** ]       |

---

## 👨‍🍳 Kitchen Display (KDS)

---

| Ticket #8821      | Ticket #8822       |
| Room 102          | Table 05           |
| [!] VIP GUEST     | Standard           |
| Pizza x2          | Burger x1          |
| Status: COOKING   | Status: PENDING    |
-----------------------------------------------

---

## 💬 Concierge Messaging (Staff View)

---

| GUEST LIST (Left) | CHAT WINDOW (Center)               |
| [ Guest Name ]    | [ Message Bubble ]                 |
| [ Room Number ]   | [ Reply Box + Actions ]            |

---

## 📦 Inventory Management

---

| Item       | Dept    | Stock | Level     |
| Salmon     | Kitchen | 5kg   | [ LOW ]   |
| Towels     | House   | 150u  | [ GOOD ]  |

---

## 🧾 Guest Folio (Billing Detail)

---

Guest: Alexander Wright (RM-102)
-----------------------------------------------
| Description      | Dept    | Date   | Amount  |
| Deluxe Suite     | Room    | 05-07  | ₹8,500  |
| Seafood Grill    | POS     | 05-07  | ₹3,200  |
| Laundry Service  | House   | 05-07  | ₹800    |
-----------------------------------------------
Total Balance: ₹12,500

[ Generate Invoice ] [ Process Settlement ]

---

## 📱 Guest Portal (Mobile Experience)

---

[ WELCOME GUEST ]
-----------------
[ Order Dining ]
[ Message Desk ]
[ My Services  ]
[ View My Bill ]
-----------------

---

## 📲 Smart QR Workflow

Scan Room QR (e.g., RM-102)
↓
Auto-set Context (Room Service)
↓
Guest Menu
↓
Order Placed
↓
Ticket to Kitchen (Tagged: Room 102)
↓
Automated Charge to Folio RM-102
