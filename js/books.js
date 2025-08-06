let allBooks = [];
const PAGE_SIZE = 12; // Number of books per page

function renderBooks(books, category = "All Genre", currentPage = 1) {
  const container = document.getElementById("bookshelf-content");

  // Filter books by category using splitting for multi-category string
  const filteredBooks = category === "All Genre"
    ? books
    : books.filter(book => {
      if (!book.category) return false;

      // Handle if category is a string
      if (typeof book.category === 'string') {
        // For string, treat as comma-separated or single category
        const categories = book.category.split(',').map(cat => cat.trim().toLowerCase());
        return categories.includes(category.toLowerCase());
      }

      // Handle if category is an array
      else if (Array.isArray(book.category)) {
        const categories = book.category.map(cat => String(cat).toLowerCase());
        return categories.includes(category.toLowerCase());
      }

      // Fallback (unexpected type)
      else {
        return false;
      }
    });

  const totalBooks = filteredBooks.length;
  const totalPages = Math.ceil(totalBooks / PAGE_SIZE);

  // Sanitize currentPage
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // Slice books for the current page
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const booksToShow = filteredBooks.slice(startIndex, endIndex);

  // Generate book cards
  let html = '<div class="row">';
  booksToShow.forEach((book) => {

    // Movie badge and link HTML, conditionally rendered
    const movieHTML = book.hasMovie && book.movieLink
      ? `<div class="movie-available mb-2" style="font-size:.8em;">
         🎬 <a href="${book.movieLink}" target="_blank" rel="noopener" title="Watch the movie">Movie Available</a>
       </div>`
      : '';

    // PDF badge and link HTML, conditionally rendered
    const pdfHTML = book.hasPdf && book.pdfLink
      ? `<div class="pdf-available mb-2" style="font-size:.8em;">
         📄 <a href="${book.pdfLink}" target="_blank" rel="noopener" title="Read the PDF">PDF Available</a>
       </div>`
      : '';

    html += `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex align-items-stretch">
      <div class="card h-100 shadow-sm border rounded product-item p-3 d-flex flex-column">
        <figure class="product-style d-flex justify-content-center align-items-center mb-3" style="height:400px;">
          <img src="${book.image}" alt="${escapeHtml(book.title)}" class="img-fluid mx-auto d-block">
        </figure>
        <figcaption class="flex-grow-1">
          <h3>${escapeHtml(book.title)}</h3>
          <i class="text-muted d-block mb-1">By ${escapeHtml(book.author)}</i>
          <div class="mb-1">Pages: ${book.pages}</div>
          <div style="color:#f5a623; font-size:1em;" class="mb-1">
            ${"★".repeat(book.stars)}${"☆".repeat(5 - book.stars)}
            <span style="font-size:.9em; color:#666;">(${book.rating}/5)</span>
          </div>
          ${movieHTML}
          ${pdfHTML}
          ${book.description ? `<p style="font-size:.8em;">${escapeHtml(book.description)}</p>` : ""}
        </figcaption>
      </div>
    </div>
  `;
  });
  html += '</div>';
  // If no books found, show a message
  if (totalBooks === 0) {
    html += '<div class="col-12 text-center"><p>No books found.</p></div>';
  } else {
    html += `<div class="col-12 text-center mt-4">
      <p class="text-muted">Showing ${startIndex + 1} to ${Math.min(endIndex, totalBooks)} of ${totalBooks} books in "${escapeHtml(category)}"</p>
    </div>`;
  }

  // Add pagination controls (if needed)
  if (totalPages > 1) {
    html += '<nav aria-label="Page navigation"><ul class="pagination justify-content-center mt-4">';

    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    html += `<li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous" tabindex="-1">Previous</a>
    </li>`;

    // Show up to 5 page numbers, centered on current page
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const activeClass = p === currentPage ? 'active' : '';
      html += `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`;
    }

    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    html += `<li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">Next</a>
    </li>`;

    html += '</ul></nav>';
  }

  container.innerHTML = html;

  // Add event listeners to pagination buttons
  const pageLinks = container.querySelectorAll('.pagination a.page-link');
  pageLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = Number(link.getAttribute('data-page'));
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        renderBooks(books, category, page);
        window.scrollTo({ top: container.offsetTop - 70, behavior: 'smooth' });
      }
    });
  });
}

// Utility function: escape HTML for security
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// Manage category tabs
function addTabListeners() {
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderBooks(allBooks, tab.textContent.trim(), 1); // reset to page 1 on tab switch
      // Also clear search input on tab change
      const searchInput = document.getElementById('book-search-input');
      if (searchInput) searchInput.value = '';
    });
  });
}

// On page load
document.addEventListener('DOMContentLoaded', () => {
  fetch('books.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load books.json');
      return response.json();
    })
    .then(books => {
      allBooks = books;
      renderBooks(allBooks, 'All Genre', 1);
      addTabListeners();
    })
    .catch(error => {
      console.error('Error loading books data:', error);
      const container = document.getElementById('bookshelf-content');
      container.innerHTML = `<p class="text-danger">Error loading books data. Please try again later.</p>`;
    });
});

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('book-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const searchTerm = this.value.trim().toLowerCase();

    if (searchTerm === '') {
      renderBooks(allBooks, getCurrentSelectedCategory(), 1);
      return;
    }

    const filteredBooks = allBooks.filter(book => {
      return book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        (book.description && book.description.toLowerCase().includes(searchTerm));
    });

    renderBooks(filteredBooks, 'All Genre', 1);
  });

  // Get the currently active tab's category
  function getCurrentSelectedCategory() {
    const activeTab = document.querySelector('.tabs .tab.active');
    return activeTab ? activeTab.textContent.trim() : 'All Genre';
  }
});

// Newsletter subscription form (simple validation alert)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  if (!form) return;

  const emailInput = form.querySelector('input[name="email"]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    alert(`Thank you for subscribing with: ${email}`);

    form.reset();
    // Add any real backend/email service integration here
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});

// MailerLite Universal script loader (you already have this)
(function (w, d, e, u, f, l, n) {
  w[f] = w[f] || function () { (w[f].q = w[f].q || []).push(arguments); }, l = d.createElement(e), l.async = 1, l.src = u, n = d.getElementsByTagName(e)[0], n.parentNode.insertBefore(l, n);
})(window, document, 'script', 'https://assets.mailerlite.com/js/universal.js', 'ml');
ml('account', '1706999');
