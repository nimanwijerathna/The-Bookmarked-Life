// Copyright © 2025 The Bookmarked Life. 
// This website and template are the property of The Bookmarked Life and its author, Niman Wijerathna.
// Unauthorized copying, distribution, or use of this template is prohibited.
// For permissions, licensing, or inquiries, contact: infothebookmarkedlife@gmail.com

// ====================
// Global Variables
// ====================
let allBooks = [];
const PAGE_SIZE = 12; // Number of books per page
const BOT_USERNAME = "TheBookmarkedLifeBot";
const DEFAULT_IMAGE = "images/logo.png";

// ====================
// Function: Request PDF Access via Telegram Bot
// ====================
function requestPdfAccess(messageId) {
  const url = `https://t.me/${BOT_USERNAME}?start=verify_${messageId}`;
  window.open(url, "_blank");
}

// ====================
// Function: Render Books
// ====================
function renderBooks(books, category = "All Genre", currentPage = 1) {
  const container = document.getElementById("bookshelf-content");

  // Filter books by category
  const filteredBooks = category === "All Genre"
    ? books
    : books.filter(book => {
      if (!book.category) return false;

      let categories = [];
      if (typeof book.category === 'string') {
        categories = book.category.split(',').map(cat => cat.trim().toLowerCase());
      } else if (Array.isArray(book.category)) {
        categories = book.category.map(cat => String(cat).toLowerCase());
      } else {
        return false;
      }
      return categories.includes(category.toLowerCase());
    });

  const totalBooks = filteredBooks.length;
  const totalPages = Math.ceil(totalBooks / PAGE_SIZE);

  // Sanitize current page
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // Slice books for current page
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const booksToShow = filteredBooks.slice(startIndex, endIndex);

  // Generate HTML
  let html = '<div class="row">';

  booksToShow.forEach((book) => {
    let movieHTML = '';
    // Adult badge
    const adultHTML = book.isAdult
      ? `<div class="adult-badge position-absolute top-0 start-0 m-2 px-2 py-1">18+</div>`
      : '';

    // Upcoming badge
    const upcomingHTML = book.isUpcoming
      ? `<div class="upcoming-badge position-absolute bottom-0 start-0 m-2 px-3 py-1">Upcoming Releases</div>`
      : '';

    // Movie badge
    if (book.hasMovie) {
      if (book.movieLinks?.length) {
        // Multiple movie links
        movieHTML = `
      <div class="movie-available mb-2" style="font-size:.8em;">
        🎬 ${book.movieLinks.map((link, i) =>
          `<a href="${link}" target="_blank" rel="noopener" title="Watch the movie ${i + 1}">Movie ${i + 1}</a>`
        ).join(" | ")}
      </div>
    `;
      } else if (book.movieLink) {
        // Single movie link
        movieHTML = `
      <div class="movie-available mb-2" style="font-size:.8em;">
        🎬 <a href="${book.movieLink}" target="_blank" rel="noopener" title="Watch the movie">Movie Available</a>
      </div>
    `;
      }
    }

    // PDF badge (Telegram bot gated)
    const pdfHTML = book.hasPdf && book.telegramMessageId !== undefined
      ? `<div class="pdf-available mb-2" style="font-size:.8em;">
           📄 <a href="#" onclick="requestPdfAccess(${book.telegramMessageId}); return false;" title="Get access to PDF">
             PDF Available
           </a>
         </div>`
      : '';

    html += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex align-items-stretch">
        <div class="card h-100 shadow-sm border rounded product-item p-3 d-flex flex-column position-relative">
          
          <figure class="product-style d-flex justify-content-center align-items-center mb-3 position-relative" style="height:400px;">
            ${adultHTML}
            ${upcomingHTML}
${book.image
        ? `<div class="skeleton">
       <img src="${book.image}" 
            alt="${escapeHtml(book.title)}" 
            class="img-fluid mx-auto d-block" 
            style="display:none;"
            onload="this.style.display='block'; this.parentElement.classList.remove('skeleton');"
            onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'; this.style.display='block'; this.parentElement.classList.remove('skeleton');" />
     </div>`
        : ""}

          </figure>

          <figcaption class="flex-grow-1">
            <h3>${escapeHtml(book.title)}</h3>
            <i class="text-muted d-block mb-1">By ${escapeHtml(book.author)}</i>
            <div class="mb-1">Pages: ${book.pages}</div>
            <div style="color:#f5a623; font-size:1em;" class="mb-1">
              ${"★".repeat(Math.round(book.rating))}${"☆".repeat(5 - Math.round(book.rating))}
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

  // No books found
  if (totalBooks === 0) {
    html += '<div class="col-12 text-center"><p>No books found.</p></div>';
  } else {
    html += `<div class="col-12 text-center mt-4">
      <p class="text-muted">Showing ${startIndex + 1} to ${Math.min(endIndex, totalBooks)} of ${totalBooks} books in "${escapeHtml(category)}"</p>
    </div>`;
  }

  // Pagination
  if (totalPages > 1) {
    html += '<nav aria-label="Page navigation"><ul class="pagination justify-content-center mt-4">';

    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    html += `<li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">Previous</a>
    </li>`;

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

  // Pagination event listeners
  container.querySelectorAll('.pagination a.page-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = Number(e.target.getAttribute('data-page'));
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        renderBooks(books, category, page);
        window.scrollTo({ top: container.offsetTop - 70, behavior: 'smooth' });
      }
    });
  });
}

// ====================
// Utility: Escape HTML
// ====================
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ====================
// Category Tabs
// ====================
function addTabListeners() {
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderBooks(allBooks, tab.textContent.trim(), 1);
      document.getElementById('book-search-input').value = '';
    });
  });
}

// ====================
// Search Functionality
// ====================
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('book-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.trim().toLowerCase();
      if (searchTerm === '') {
        renderBooks(allBooks, getCurrentSelectedCategory(), 1);
        return;
      }

      const filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        (book.description && book.description.toLowerCase().includes(searchTerm))
      );

      renderBooks(filteredBooks, 'All Genre', 1);
    });
  }

  function getCurrentSelectedCategory() {
    const activeTab = document.querySelector('.tabs .tab.active');
    return activeTab ? activeTab.textContent.trim() : 'All Genre';
  }
});

// ====================
// Load Books & Initialize
// ====================
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
      console.error('Error loading books:', error);
      const container = document.getElementById('bookshelf-content');
      container.innerHTML = '<p class="text-danger">Error loading books. Please try again later.</p>';
    });
});

if (sessionStorage.getItem('seenWelcome') !== 'true') {
  document.getElementById('welcomeModal').style.display = 'flex';
  sessionStorage.setItem('seenWelcome', 'true');
}

//Privacy Policy Modal
document.addEventListener('DOMContentLoaded', function () {
  const privacyModalEl = document.getElementById('privacyModal');
  if (privacyModalEl) {
    const myModal = new bootstrap.Modal(privacyModalEl);

    const openBtn = document.getElementById('openPrivacyModal');
    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        myModal.show();
      });
    }
  }
});

// Terms and Conditions Modal
document.addEventListener('DOMContentLoaded', function () {
  const termsModalEl = document.getElementById('termsModal');
  if (termsModalEl) {
    const myModal = new bootstrap.Modal(termsModalEl);
    const openBtn = document.getElementById('openTermsModal');
    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        myModal.show();
      });
    }
  }
});

//Donation Modal
document.addEventListener('DOMContentLoaded', function () {
  const donateModalEl = document.getElementById('donationsModal');
  if (donateModalEl) {
    const myModal = new bootstrap.Modal(donateModalEl);
    const openBtn = document.getElementById('openDonationsModal');
    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        myModal.show();
      });
    }
  }
});

//Copywrite Modal
document.addEventListener('DOMContentLoaded', function () {
  const copywriteModalEl = document.getElementById('dmcaModal');
  if (copywriteModalEl) {
    const myModal = new bootstrap.Modal(copywriteModalEl);
    const openBtn = document.getElementById('openDMCAmodal');
    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        myModal.show();
      });
    }
  }
});

$('.main-slider').slick({
  dots: true,
  infinite: true,
  speed: 500,
  fade: true,
  cssEase: 'linear',

  // --- Add this line to remove the arrows ---
  arrows: false,
  // ------------------------------------------

  // Other autoplay options
  autoplay: true,
  autoplaySpeed: 4500,
  pauseOnHover: true
});

document.addEventListener('DOMContentLoaded', function () {
  new Swiper('.authors-slider', {
    loop: true,
    spaceBetween: 20,
    slidesPerView: 1,
    centeredSlides: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      // Mobile
      576: {
        slidesPerView: 2,
      },
      // Tablet
      768: {
        slidesPerView: 3,
      },
      // Desktop
      992: {
        slidesPerView: 4,
      },
      // Large desktop
      1200: {
        slidesPerView: 5,
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  // === ALWAYS USE THE MOST RECENT FRIDAY ===
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

  // Calculate days to subtract to get to last Friday
  // If today is Friday → 0 days back
  // If today is Saturday → 1 day back
  // If today is Sunday → 2 days back
  // ...
  // If today is Thursday → 6 days back
  const daysSinceFriday = (dayOfWeek + 2) % 7; // Because Friday is 5, and (5 + 2) % 7 = 0
  const fridayDate = new Date(now);
  fridayDate.setDate(now.getDate() - daysSinceFriday);

  const year = fridayDate.getFullYear();
  const month = String(fridayDate.getMonth() + 1).padStart(2, '0');
  const day = String(fridayDate.getDate()).padStart(2, '0');

  // Update title
  const titleEl = document.querySelector('#epaper .section-title');
  if (titleEl) {
    titleEl.textContent = `Tharuni E-Paper • ${day}/${month}/${year}`;
  }

  // ✅ CORRECT URL — NO SPACES
  const baseUrl = `https://epaper.tharunie.lk/News/${year}/${month}/${day}/pg`;

  const wrapper = document.querySelector('.epaper-slider .swiper-wrapper');
  if (!wrapper) return;

  const maxPages = 30;
  for (let i = 1; i <= maxPages; i++) {
    const pageNum = String(i).padStart(2, '0');
    const imgSrc = `${baseUrl}${pageNum}.jpg`;

    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <div class="author-card" data-src="${imgSrc}">
        <img src="${imgSrc}" alt="Page ${i}" class="author-image">
      </div>
    `;
    wrapper.appendChild(slide);
  }

  // Swiper
  new Swiper('.epaper-slider', {
    loop: false,
    spaceBetween: 10,
    slidesPerView: 2,
    navigation: {
      nextEl: '.epaper-slider .swiper-button-next',
      prevEl: '.epaper-slider .swiper-button-prev',
    },
    breakpoints: {
      576: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
      992: { slidesPerView: 5 },
      1200: { slidesPerView: 6 }
    }
  });

  // Fullscreen click
  document.addEventListener('click', function (e) {
    const card = e.target.closest('.author-card');
    if (!card) return;

    const imgSrc = card.getAttribute('data-src');
    const fullImg = document.createElement('img');
    fullImg.src = imgSrc;
    fullImg.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      object-fit: contain; background: black;
      z-index: 999999; cursor: zoom-out;
    `;
    document.body.appendChild(fullImg);
    document.body.style.overflow = 'hidden';

    const close = () => {
      document.body.removeChild(fullImg);
      document.body.style.overflow = '';
    };
    fullImg.addEventListener('click', close);
    const esc = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
  });

  console.log(`✅ Loaded e-paper for Friday: ${year}-${month}-${day}`);
});