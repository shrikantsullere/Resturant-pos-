# 🏨 Hospitality Operations — Project Details

---

## 🧩 Project Type

Full Property Management System (PMS) + Restaurant POS + Guest Experience Platform.

---

## 🏗️ Modules Included

### 🛌 Hospitality
* **Rooms & Reservations**: Management of room inventory and booking lifecycle.
* **Guest Folios**: Unified billing for rooms, F&B, and concierge services.
* **Concierge messaging**: Real-time guest messaging system.
* **Services & Transport**: Booking engine for extra-property activities.

### 🍽️ Restaurant
* **Smart POS**: Order processing with size/modifier support.
* **Kitchen (KDS)**: Tablet-based kitchen display system.
* **Table Management**: Real-time floor occupancy tracking.
* **Inventory**: Stock management for F&B and housekeeping.

### 📊 Operations
* **Executive Dashboard**: Command center for property-wide analytics.
* **Duty Board**: Staff task management and shift tracking.
* **Notifications**: departmental alerts and guest triggers.

---

## 👥 Roles

* **Admin / Owner**: Full oversight and configuration.
* **Reception / Concierge**: Guest check-in, billing, and services.
* **Waiter / Room Service**: F&B orders and guest delivery.
* **Chef / Store Manager**: Kitchen operations and inventory.
* **Customer / Guest**: Self-service ordering and requests.

---

## 🛠️ Tech Stack (Current)

### Frontend
* **Core**: React.js (Vite)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **State**: React Context API
* **Persistence**: LocalStorage (Session-aware)

---

## 🔗 Core Operations Flow

### 1. The Guest Cycle
Reservation → Check-In → Open Folio → Room Occupied.

### 2. The Integrated F&B Cycle
Guest Scans QR (Table/Room) → Order Placed → Ticket to KDS → Charge Posted to Folio.

### 3. The Operational Cycle
Staff Assigned Task → Task Completion → Automatic Notification to Manager/Guest.

---

## 📂 Project Architecture

* **src/context/**: Master state (Hospitality, Orders, Menu, Communication).
* **src/pages/**: departmental dashboards (Dashboard, Concierge, Inventory, etc.).
* **src/layouts/**: Unified Sidebar/Layout system with RBAC.
* **src/utils/**: Helper functions for billing, formatting, and constants.

---

## 🗄️ Master Data Schemas

* **rooms**: ID, name, status, type, price.
* **reservations**: guestName, roomID, dates, status.
* **folios**: guestID, itemsList (Charges), totalBalance, status.
* **orders**: customer, table/room, items, paymentStatus.
* **inventory**: itemName, stockLevel, department, cost.
* **tasks**: description, assignedTo, priority, status.

---

## ⚡ Key Differentiators

* **Single Source of Truth**: F&B charges sync instantly with room folios.
* **Guest First**: Full self-service capabilities via QR and Portal.
* **Operational Precision**: Shift-based task tracking and inventory alerts.
* **Premium Aesthetic**: High-end glassmorphic design for luxury properties.

---

## 🚀 Vision

Build a unified hospitality ecosystem that eliminates the silos between front-desk, kitchen, and guests, driving efficiency and revenue through integrated automation.
