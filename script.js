// === UI Elements Reference ===
const searchInput = document.getElementById('searchInput');
const searchTypeSelect = document.getElementById('searchType');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');
const categoryFilters = document.getElementById('categoryFilters');

const controlsSection = document.getElementById('controlsSection');
const booksGrid = document.getElementById('booksGrid');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

const sectionTitle = document.getElementById('sectionTitle');
const emptyStateMessage = document.getElementById('emptyStateMessage');
const emptyStateSubMessage = document.getElementById('emptyStateSubMessage');

// Header Buttons
const themeToggleBtn = document.getElementById('themeToggleBtn');
const viewFavoritesBtn = document.getElementById('viewFavoritesBtn');
const toastContainer = document.getElementById('toastContainer');

// === Application State ===
let currentQuery = '';
let currentSearchType = 'q';
let currentSubject = '';
let currentPage = 1;
let loadedBooks = []; 
let isFavoritesView = false; // Tracks if we are looking at Favorites

// === Local Storage Access ===
// Load favorites from local storage, default to empty array if none exist
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// === Initialization ===
window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme from LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '☀️'; // Show light mode icon to toggle back
    }

    // 2. Default Initial Fetch
    currentQuery = 'top'; 
    currentSubject = '';
    fetchBooks(true);
});

// === Event Listeners ===

// Search Button
searchBtn.addEventListener('click', executeSearch);

// Search Output on Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
});

// Filter Buttons
categoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        currentSubject = e.target.getAttribute('data-category');
        currentPage = 1;
        fetchBooks(true);
    }
});

// Sort Dropdown
sortSelect.addEventListener('change', () => {
    if (isFavoritesView) {
        sortAndRenderFavorites();
    } else {
        sortAndRenderBooks();
    }
});

// Load More Pagination
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchBooks(false); 
});

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    if (isDark) {
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '🌙';
    }
});

// View Favorites Toggle
viewFavoritesBtn.addEventListener('click', () => {
    // Toggle the view state
    isFavoritesView = !isFavoritesView;
    
    if (isFavoritesView) {
        // Switch to Favorites View
        viewFavoritesBtn.innerHTML = '🔍 Back to Search';
        controlsSection.classList.add('hidden');
        sectionTitle.classList.remove('hidden');
        loadMoreBtn.classList.add('hidden'); // No pagination in favorites
        
        sortAndRenderFavorites();
    } else {
        // Switch to Search View
        viewFavoritesBtn.innerHTML = '❤️ My Favorites';
        controlsSection.classList.remove('hidden');
        sectionTitle.classList.add('hidden');
        
        // Re-render the previously loaded search results
        sortAndRenderBooks();
        
        // Just arbitrarily enable load more if we had books
        if(loadedBooks.length > 0) {
            loadMoreBtn.classList.remove('hidden');
        }
    }
});


// === Core Functions ===

function executeSearch() {
    const query = searchInput.value.trim();
    if (!query && !currentSubject) {
        showToast("Please enter a search term!", "error");
        return;
    }
    currentQuery = query;
    currentSearchType = searchTypeSelect.value;
    currentPage = 1;
    fetchBooks(true);
}

async function fetchBooks(isNewSearch) {
    if (isNewSearch) {
        booksGrid.innerHTML = '';
        loadedBooks = [];
        loadMoreBtn.classList.add('hidden');
    }
    
    loadingIndicator.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    let url = new URL('https://openlibrary.org/search.json');
    if (currentQuery) url.searchParams.append(currentSearchType, currentQuery);
    if (currentSubject) url.searchParams.append('subject', currentSubject);
    url.searchParams.append('page', currentPage);
    url.searchParams.append('limit', 20);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const docs = data.docs;
        
        loadingIndicator.classList.add('hidden');

        if (docs.length === 0 && isNewSearch) {
            showEmptyState("No books found.", "Try refining your search or exploring a different category.");
            return;
        }

        if (isNewSearch) {
            loadedBooks = docs;
        } else {
            loadedBooks = [...loadedBooks, ...docs];
        }

        sortAndRenderBooks();

        if (loadedBooks.length < data.numFound) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }

    } catch (error) {
        console.error("Error fetching books:", error);
        loadingIndicator.classList.add('hidden');
        showEmptyState("Error loading books.", "Please try again later.");
    }
}

function showEmptyState(message, subMessage) {
    emptyStateMessage.innerText = message;
    emptyStateSubMessage.innerText = subMessage;
    emptyState.classList.remove('hidden');
}

/**
 * Normal Sorting and Rendering for Search Results
 */
function sortAndRenderBooks() {
    let booksToSort = [...loadedBooks];
    const sortValue = sortSelect.value;

    if (sortValue === 'titleAsc') {
        booksToSort.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortValue === 'authorAsc') {
        booksToSort.sort((a, b) => {
            const authorA = (a.author_name && a.author_name.length > 0) ? a.author_name[0] : 'z';
            const authorB = (b.author_name && b.author_name.length > 0) ? b.author_name[0] : 'z';
            return authorA.localeCompare(authorB);
        });
    }

    renderBooks(booksToSort, false);
}

/**
 * Sorting and Rendering for Local Favorites
 */
function sortAndRenderFavorites() {
    loadingIndicator.classList.add('hidden'); // Fast local render, no loader needed
    
    if (favorites.length === 0) {
        booksGrid.innerHTML = '';
        showEmptyState("No favorites yet.", "Search for books and click the heart icon to save them.");
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    // Sort local favorites array
    let booksToSort = [...favorites];
    const sortValue = sortSelect.value;
    
    if (sortValue === 'titleAsc') {
        booksToSort.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortValue === 'authorAsc') {
        booksToSort.sort((a, b) => (a.author_name || 'z').localeCompare(b.author_name || 'z'));
    }

    renderBooks(booksToSort, true);
}


/**
 * Generates HTML markup for each book card and injects it into the DOM
 * @param {Array} booksArray - Array of book doc objects
 * @param {boolean} isRenderingFavorites - Flag to know if we render out of `loadedBooks` or `favorites` array formats
 */
function renderBooks(booksArray, isRenderingFavorites) {
    booksGrid.innerHTML = '';

    booksArray.forEach(book => {
        // Depending on if object came from API or is already formatted in local storage
        let bookId, title, author, category, coverHtml;

        if (isRenderingFavorites) {
            // It's coming from local storage, data is already flattened
            bookId = book.id;
            title = book.title;
            author = book.author;
            category = book.category;
            coverHtml = book.coverHtml;
        } else {
            // It's coming fresh from the Open Library API
            bookId = book.key;
            title = book.title || "Unknown Title";
            author = (book.author_name && book.author_name.length > 0) ? book.author_name[0] : "Unknown Author";
            category = (book.subject && book.subject.length > 0) ? book.subject[0] : "General";

            // Generate Cover HTML wrapper
            coverHtml = `<div class="placeholder-cover">No Cover Available</div>`;
            if (book.cover_i) {
                const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
                coverHtml = `<img src="${coverUrl}" alt="Cover of ${title}" class="book-cover" loading="lazy">`;
            } else if (book.isbn && book.isbn.length > 0) {
                const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
                coverHtml = `<img src="${coverUrl}" alt="Cover of ${title}" class="book-cover" loading="lazy">`;
            }
        }

        // Check if this book exists in flavors to style the button
        const isFav = favorites.some(fav => fav.id === bookId);
        
        let favBtnHtml = '';
        if (isRenderingFavorites || isFav) {
            // In favorites view, or it IS already favorited, button handles "Removal"
            favBtnHtml = `<button class="fav-btn added remove-fav-btn" onclick="toggleFavorite('${bookId}', '${title.replace(/'/g, "\\'")}', '${author.replace(/'/g, "\\'")}', '${category.replace(/'/g, "\\'")}', '${encodeURIComponent(coverHtml)}')"><span>❌ Remove</span></button>`;
        } else {
            // Normal Search View - Add Button
            favBtnHtml = `<button class="fav-btn" onclick="toggleFavorite('${bookId}', '${title.replace(/'/g, "\\'")}', '${author.replace(/'/g, "\\'")}', '${category.replace(/'/g, "\\'")}', '${encodeURIComponent(coverHtml)}')"><span>❤️ Add</span></button>`;
        }

        // Build Card HTML
        const cardHtml = `
            <article class="book-card" id="card-${bookId.replace(/[^a-zA-Z0-9]/g, '')}">
                <div class="card-image-wrapper">
                    ${coverHtml}
                </div>
                <div class="card-content">
                    <h3 class="book-title">${title}</h3>
                    <p class="book-author">By ${author}</p>
                    <div class="card-footer">
                        <span class="book-category">${category}</span>
                        ${favBtnHtml}
                    </div>
                </div>
            </article>
        `;

        // Append to Grid
        booksGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// === Favorites Local Storage Logic ===

/**
 * Toggles a book in and out of the Local Storage Favorites
 * This function is called globally via inline onclick handler on the buttons
 */
window.toggleFavorite = (bookId, title, author, category, encodedCover) => {
    // Reconstruct the Book object we might save
    // Decode the HTML string safely
    const coverHtml = decodeURIComponent(encodedCover);
    
    // Check if the book is already in favorites
    const bookIndex = favorites.findIndex(fav => fav.id === bookId);
    const cardElement = document.getElementById(`card-${bookId.replace(/[^a-zA-Z0-9]/g, '')}`);
    const btn = cardElement ? cardElement.querySelector('.fav-btn') : null;

    if (bookIndex > -1) {
        // REMOVE FROM FAVORITES
        favorites.splice(bookIndex, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        showToast(`Removed "${title}" from Favorites`);
        
        if (isFavoritesView) {
            // Re-render favorites view to make it disappear instantly
            sortAndRenderFavorites();
        } else if (btn) {
            // Just update the button visually back to "Add"
            btn.className = 'fav-btn';
            btn.innerHTML = '<span>❤️ Add</span>';
        }
    } else {
        // ADD TO FAVORITES
        const newFavorite = {
            id: bookId,
            title: title,
            author: author,
            category: category,
            coverHtml: coverHtml
        };
        
        favorites.push(newFavorite);
        
        // Use JSON.stringify() to save arrays in localStorage 
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        showToast(`Added "${title}" to Favorites`, "success");

        // Update Button Visually + Animate Heart
        if (btn) {
            btn.className = 'fav-btn added remove-fav-btn animate-heart';
            btn.innerHTML = '<span>❌ Remove</span>';
            // Remove animation class after it plays
            setTimeout(() => { btn.classList.remove('animate-heart'); }, 300);
        }
    }
};

// === Toast Notification System ===

function showToast(message, type = "success") {
    // Create new toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    const icon = type === "success" ? "✅ " : "ℹ️ ";
    toast.innerHTML = `${icon} ${message}`;
    
    // Append to container
    toastContainer.appendChild(toast);
    
    // Trigger slide-in animation
    setTimeout(() => { toast.classList.add('show'); }, 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        // Wait for CSS transition to finish before removing from DOM
        setTimeout(() => {
            if (toast.parentNode) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}
