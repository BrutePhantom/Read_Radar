// === UI Elements Reference ===
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const booksGrid = document.getElementById('booksGrid');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const emptyStateMessage = document.getElementById('emptyStateMessage');
const emptyStateSubMessage = document.getElementById('emptyStateSubMessage');

// === Event Listeners ===
searchBtn.addEventListener('click', executeSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
});

// === Core Functions ===
function executeSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showEmptyState("Please enter a search term.", "We need something to look for!");
        return;
    }
    fetchBooks(query);
}

async function fetchBooks(query) {
    // Reset UI before fetch
    booksGrid.innerHTML = '';
    loadingIndicator.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Construct the API URL for search
    const url = new URL('https://openlibrary.org/search.json');
    url.searchParams.append('q', query);
    url.searchParams.append('limit', 20); // Keep payload small and clean

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const docs = data.docs;
        
        loadingIndicator.classList.add('hidden');

        // Handle case where no books are returned
        if (docs.length === 0) {
            showEmptyState("No books found.", "Try another keyword, title, or author.");
            return;
        }

        renderBooks(docs);

    } catch (error) {
        console.error("Error fetching books:", error);
        loadingIndicator.classList.add('hidden');
        showEmptyState("Error loading books.", "Please try searching again later.");
    }
}

function showEmptyState(message, subMessage) {
    emptyStateMessage.innerText = message;
    emptyStateSubMessage.innerText = subMessage;
    emptyState.classList.remove('hidden');
    booksGrid.innerHTML = '';
}

function renderBooks(booksArray) {
    booksGrid.innerHTML = ''; // Ensure grid is empty before rendering new items

    booksArray.forEach(book => {
        // Fallbacks for missing data
        const title = book.title || "Unknown Title";
        const author = (book.author_name && book.author_name.length > 0) ? book.author_name[0] : "Unknown Author";
        const category = (book.subject && book.subject.length > 0) ? book.subject[0] : "General";

        // Extract Cover URL safely or show placeholder
        let coverHtml = `<div class="placeholder-cover">No Cover Available</div>`;
        if (book.cover_i) {
            const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
            coverHtml = `<img src="${coverUrl}" alt="Cover of ${title}" class="book-cover" loading="lazy">`;
        } else if (book.isbn && book.isbn.length > 0) {
            const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
            coverHtml = `<img src="${coverUrl}" alt="Cover of ${title}" class="book-cover" loading="lazy">`;
        }

        // Generate the HTML per card
        const cardHtml = `
            <article class="book-card">
                <div class="card-image-wrapper">
                    ${coverHtml}
                </div>
                <div class="card-content">
                    <h3 class="book-title">${title}</h3>
                    <p class="book-author">By ${author}</p>
                    <div class="card-footer">
                        <span class="book-category">${category}</span>
                    </div>
                </div>
            </article>
        `;

        // Append to the UI
        booksGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}
