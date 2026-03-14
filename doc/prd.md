# Product Requirements Document (PRD)

## Product Name

**FeatureBoard** *(working name)*

A modern web application for restaurants to plan, manage, and publish rotating menu features and daily specials.

---

# 1. Overview

## Problem

Restaurants commonly manage daily specials and featured menu items using spreadsheets or handwritten notes. This creates several operational problems:

* No shared real-time system for kitchen and front-of-house
* Specials are frequently repeated unintentionally
* Servers lack consistent descriptions of features
* Pricing and food cost tracking is disconnected
* Daily lineup sheets must be recreated manually
* Feature planning history is lost

The **Master Feature Program spreadsheet** was historically used to plan these features but lacks collaboration, automation, and operational integration.

## Solution

Build a **web-based restaurant feature planning platform** that allows chefs and managers to:

* maintain a library of feature items
* schedule features on a calendar
* track pricing and margins
* pair food with wines
* generate daily lineup sheets for staff
* track performance of specials over time

The platform replaces the spreadsheet with a **collaborative, operational planning system.**

---

# 2. Goals

## Primary Goals

1. Replace spreadsheet-based feature planning
2. Provide a centralized system for restaurant specials
3. Improve communication between kitchen and front-of-house
4. Maintain historical records of specials
5. Track feature profitability

## Success Metrics

* 80% of restaurants stop using spreadsheets for specials
* Daily lineup sheets generated from system
* Specials scheduled at least 1 week ahead
* Food cost recorded for at least 60% of features
* Average user session < 60 seconds to view daily specials

---

# 3. Users

## Primary Users

### Executive Chef

Responsibilities:

* create and plan specials
* write descriptions
* manage prep notes
* avoid repeating dishes too often

Needs:

* quick scheduling
* visibility into past features
* margin awareness

---

### General Manager

Responsibilities:

* approve specials
* manage pricing
* ensure servers know features
* monitor profitability

Needs:

* lineup sheets
* mobile view
* cost/margin reporting

---

### Servers / FOH Staff

Responsibilities:

* learn the daily specials
* describe dishes to guests
* upsell wine pairings

Needs:

* simple mobile view
* descriptions
* pairing suggestions
* allergens

---

### Restaurant Owner

Responsibilities:

* ensure specials are profitable
* track sales performance

Needs:

* dashboards
* reporting

---

# 4. Core Features

## Feature Library

### Description

A database of reusable feature items.

### Fields

Feature Item:

* name
* category
* description
* ingredients
* allergens
* prep notes
* plating notes
* cost
* price
* margin %
* image
* tags (seasonal, seafood, vegetarian)

### Categories

Default categories:

* Appetizer
* Soup
* Fish
* Entrée
* Dessert
* Wine

Users may add custom categories.

---

## Feature Scheduling

### Description

Allows restaurants to plan specials by date.

### Interface

Calendar or weekly planner view.

### Capabilities

* assign feature to date
* drag-and-drop scheduling
* duplicate previous week
* reorder features
* publish or draft status

### Fields

Scheduled Feature:

* feature item
* service date
* service period (lunch/dinner)
* notes
* status (draft/published/86'd)

---

## Daily Lineup Page

### Description

A mobile-friendly page showing today's features.

### Designed For

Servers reviewing specials before shift.

### Displays

* feature name
* category
* description
* wine pairing
* allergens
* chef notes

### Access

Read-only.

---

## Wine Pairing System

### Description

Connect food features with recommended wines.

### Fields

Pairing:

* food item
* wine item
* pairing note

Example:

Fish Special → Sauvignon Blanc

---

## Margin Tracking

### Description

Track profitability of specials.

### Inputs

* cost
* selling price

### Outputs

* gross margin
* profit per plate

### Optional

Track units sold.

---

## Feature History

### Description

Allows restaurants to see when features were last used.

### Example

| Feature    | Last Used   |
| ---------- | ----------- |
| Crab Cakes | 2 weeks ago |
| Halibut    | 3 days ago  |

### Purpose

Avoid repeating specials too frequently.

---

## Print Lineup Sheet

### Description

Generate printable sheets for staff meetings.

### Format

Example:

```
Tonight's Features

Appetizer
Crab Cakes
Pan-seared lump crab with lemon aioli

Fish
Halibut
Grilled halibut with beurre blanc

Dessert
Chocolate Lava Cake
Served with vanilla ice cream

Wine Pairing
Pinot Noir
```

Export options:

* PDF
* print page

---

# 5. User Roles

## Admin

Permissions:

* manage users
* configure categories
* system settings

---

## Chef

Permissions:

* create feature items
* schedule features
* edit descriptions

---

## Manager

Permissions:

* approve/publish features
* edit pricing
* view reports

---

## Server

Permissions:

* view lineup page

---

# 6. System Requirements

## Frontend

Recommended stack:

* React
* Next.js
* TypeScript
* TailwindCSS
* shadcn/ui

Key requirements:

* mobile-friendly
* drag-and-drop calendar
* printable pages

---

## Backend

Recommended stack:

* FastAPI or Node/NestJS
* REST API

Endpoints include:

```
GET /features
POST /features
GET /schedule
POST /schedule
GET /today
GET /pairings
GET /reports
```

Authentication:

* JWT

---

## Database

Recommended:
PostgreSQL

Core tables:

* restaurants
* users
* feature_categories
* feature_items
* scheduled_features
* pairings
* performance_records

---

# 7. Data Model (Simplified)

## Feature Item

| Field       | Type    |
| ----------- | ------- |
| id          | uuid    |
| name        | text    |
| category_id | uuid    |
| description | text    |
| cost        | decimal |
| price       | decimal |
| image_url   | text    |
| tags        | json    |
| active      | boolean |

---

## Scheduled Feature

| Field           | Type |
| --------------- | ---- |
| id              | uuid |
| feature_item_id | uuid |
| service_date    | date |
| meal_period     | enum |
| status          | enum |

---

# 8. MVP Scope

The first release should include:

### Must Have

* login
* feature library
* weekly feature schedule
* publish daily lineup
* mobile lineup page
* print lineup sheet

### Not Required for MVP

* POS integration
* sales analytics
* AI recommendations
* inventory tracking

---

# 9. Future Enhancements

## Analytics

Track:

* best selling specials
* highest margin specials
* seasonal performance

---

## POS Integration

Connect to:

* Toast
* Square
* Clover

To automatically record:

* units sold
* revenue

---

## AI Features

Potential AI capabilities:

* generate menu descriptions
* recommend wine pairings
* detect repeated specials
* suggest high-margin specials

---

## Inventory Integration

Tie specials to:

* ingredients
* vendor pricing

---

# 10. Non-Functional Requirements

### Performance

* page load < 2 seconds

### Availability

* 99.9% uptime

### Security

* encrypted authentication
* role-based access

### Usability

Servers should learn the system in **< 2 minutes**.

---

# 11. Competitive Landscape

Existing solutions:

| Product            | Limitation                     |
| ------------------ | ------------------------------ |
| Restaurant365      | Focused on accounting          |
| MarginEdge         | Focused on inventory           |
| Google Sheets      | No collaboration or automation |
| Handwritten boards | No history or planning         |

FeatureBoard focuses specifically on **specials management and service communication**.

---

# 12. Launch Strategy

Initial target:

* chef-driven restaurants
* steakhouses
* independent restaurants
* hospitality groups with multiple locations

Go-to-market ideas:

* free tier for 1 location
* premium analytics
* POS integrations
