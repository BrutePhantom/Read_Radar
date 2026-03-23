# Read_Radar
A smart book discovery website that lets users search books by title, author, category, or even a line from the book using Open Library APIs.

Here’s your updated **README.md** with the Open Library APIs properly added in a clean, professional way 👇

---

# 📚 BookVerse – Smart Book Collection Website

## 🚀 Project Overview

**BookVerse** is a web application designed to help users explore, search, and organize a collection of books efficiently. The platform allows users to browse books by different filters such as author, category, and more.

This project is built as part of a **Web Application Programming (WAP)** course by a first-year university student.

---

## ✨ Features

### 🔍 Smart Book Search

* Search books by title, author, or keywords
* **Unique feature:** Find a book by typing a *line from the book*

### 📂 Sorting & Filtering

* Sort books by:

  * Author
  * Title
  * Popularity (optional)
* Filter by:

  * Categories (Fiction, Non-fiction, Sci-Fi, etc.)
  * Authors

### 📖 Book Details

* View detailed information:

  * Title
  * Author
  * Category
  * Description
  * Ratings (optional)

### ❤️ User-Friendly UI

* Clean and responsive design
* Easy navigation

---

## 🌐 APIs Used

This project uses the **Open Library APIs** to fetch real-time book data.

### 📚 Core APIs

* **Book Search API**
  → Search results for books, authors, and more

* **Search Inside API**
  → Search for matching text within millions of books (used for line-based search feature)

* **Covers API**
  → Fetch book covers using ISBN or Open Library ID

---

### 👤 User & Lists APIs

* **Your Books API**
  → Retrieve books from a user's public reading log

* **Lists API**
  → Create, modify, and read custom book lists

---

### 🔎 Data Retrieval APIs

* **Work & Edition APIs**
  → Get detailed info about specific books or editions

* **Authors API**
  → Fetch author details and their works

* **Subjects API**
  → Browse books by categories/genres

---

### 🔄 System API

* **Recent Changes API**
  → Access updates and changes across Open Library

---

### ⚙️ API Type

* RESTful APIs (JSON-based responses)

---

## 💡 Additional Features (Optional Enhancements)

* 🔖 Bookmark/Favorite books
* 🌙 Dark mode
* ⭐ User ratings & reviews
* 📊 Trending or recommended books
* 🔐 User login/signup system
* 📥 Add your own books (admin feature)

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend (optional):** Node.js / Express
* **APIs:** Open Library APIs
* **Database (optional):** MongoDB / Firebase

---

## ⚙️ How It Works

1. User enters a search query (title, author, or book line).
2. The app sends a request to Open Library APIs.
3. Data is fetched and processed.
4. Results are displayed with sorting and filtering options.

---

## 🔎 Example Use Case

* User types:
  `"It was the best of times"`
* The system searches using **Search Inside API** and returns matching books.

---

## 🎯 Learning Objectives

* Work with REST APIs
* Handle asynchronous JavaScript (fetch API)
* Implement search & filtering logic
* Build responsive UI

---

## 📌 Future Improvements

* AI-based book recommendations
* Advanced full-text search
* Personal dashboards
* Mobile app version

---

## 🙌 Acknowledgment

* Data provided by **Open Library**
* Built for academic learning (WAP course)
