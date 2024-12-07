// Single utility function for query params
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch and display movie details
async function loadMovieDetails() {
    const movieId = getQueryParam("id");
    if (!movieId) {
        document.querySelector(".product-details-container").innerHTML = "<p>Invalid movie ID.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch movie details.");
        }

        const movie = await response.json();
        console.log("Fetched movie data:", movie); // Debug log
        populateMovieDetails(movie);
        setupTrailerModal(movie.trailer_url);
        setupCartFunctionality(movie);
    } catch (error) {
        console.error("Error loading movie:", error);
        document.querySelector(".product-details-container").innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function populateMovieDetails(movie) {
    // Handle product image
    const productImage = document.querySelector(".product-image img");
    if (productImage) {
        productImage.src = movie.imgUrl;
        productImage.alt = movie.title;
    }

    // Update title and price
    document.querySelector(".product-info h1").textContent = movie.title;
    document.querySelector(".price").textContent = `$${movie.price.toFixed(2)}`;

    // Update movie meta information with icons
    document.querySelector(".movie-meta .rating").innerHTML = 
        `<i class="fas fa-star"></i> ${movie.rating || 'N/A'}`;
    document.querySelector(".movie-meta .duration").innerHTML = 
        `<i class="fas fa-clock"></i> ${movie.time || 'N/A'}`;
    document.querySelector(".movie-meta .year").textContent = movie.release_year;
    document.querySelector(".movie-meta .genre").textContent = movie.genre || "N/A";

    // Update description
    document.querySelector(".description").textContent = movie.description || "No description available.";

    // Update movie details section
    const detailsHTML = `
        <h3>Movie Details</h3>
        <p><strong>Director:</strong> <span id="movieDirector">${movie.director || "Unknown"}</span></p>
        <p><strong>Starring:</strong> <span id="movieStarring">${movie.staring || "N/A"}</span></p>
        <p><strong>Language:</strong> <span id="movieLanguage">${movie.language || "N/A"}</span></p>
        <p><strong>Subtitles:</strong> <span id="movieSubtitles">${movie.subtitles || "N/A"}</span></p>
    `;
    document.querySelector(".details").innerHTML = detailsHTML;
}

function setupTrailerModal(trailerUrl) {
    const productImage = document.querySelector('.product-image');
    const modal = document.getElementById('trailerModal');
    const closeBtn = document.querySelector('.close');
    const trailerVideo = document.getElementById('trailerVideo');

    if (!modal || !trailerVideo) return;

    function openModal() {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        trailerVideo.innerHTML = `
            <video width="100%" height="auto" controls>
                <source src="${trailerUrl}" type="video/mp4">
            </video>
        `;
        setTimeout(() => {
            const video = trailerVideo.querySelector('video');
            if (video) video.play();
        }, 300);
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            trailerVideo.innerHTML = '';
        }, 300);
    }

    productImage.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
}

function setupCartFunctionality(movie) {
    console.log("Setting up cart functionality"); // Debug log
    
    const addToCartButton = document.querySelector('.add-to-cart');
    console.log("Add to cart button:", addToCartButton); // Debug log
    
    if (!addToCartButton) {
        console.error("Add to cart button not found!");
        return;
    }

    // Remove any existing listeners
    const newButton = addToCartButton.cloneNode(true);
    addToCartButton.parentNode.replaceChild(newButton, addToCartButton);

    newButton.addEventListener('click', function() {
        console.log("Add to cart clicked"); // Debug log
        
        try {
            // Get existing cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Create cart item
            const cartItem = {
                id: movie.id,
                title: movie.title,
                price: movie.price,
                imgUrl: movie.imgUrl,
                quantity: 1
            };
            
            console.log("Adding to cart:", cartItem); // Debug log
            
            // Add to cart
            cart.push(cartItem);
            
            // Save cart
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = cart.length;
            }
            
            // Show success message
            alert('Movie added to cart!');
            
            console.log("Cart updated:", cart); // Debug log
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert('Failed to add movie to cart');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded"); // Debug log
    loadMovieDetails();
});

// Export functions if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getQueryParam,
        loadMovieDetails,
        populateMovieDetails,
        setupTrailerModal,
        setupCartFunctionality
    };
}