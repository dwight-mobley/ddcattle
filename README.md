# ddcattle

A modern ranch management platform built with **Ruby on Rails**, **Inertia.js**, **React**, **Neon Postgres**, **Cloudflare R2**, **Pagy**, and **React Toastify**.

## 🚀 Tech Stack

- Ruby on Rails
- Inertia.js
- React
- Neon Postgres
- Cloudflare R2
- Pagy
- React Toastify

## 📦 Installation

### Clone the repository
git clone https://github.com/yourname/ddcattle.git
cd ddcattle

### Install Ruby gems
bundle install

### Install JavaScript dependencies
npm install

### Environment variables
Create a `.env` file with:

DATABASE_URL=postgres://...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET=ddcattle
CLOUDFLARE_R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com

## 🗄 Database Setup

rails db:create
rails db:migrate
rails db:seed

## 🧭 Run Development Server

bin/dev

## 📜 License

MIT License
