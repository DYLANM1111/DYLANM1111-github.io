document.addEventListener('DOMContentLoaded', function() {
    const productImage = document.querySelector('.product-image');
    const modal = document.getElementById('trailerModal');
    const closeBtn = document.querySelector('.close');
    const trailerVideo = document.getElementById('trailerVideo');

    const trailerUrl = 'images/wonder.mp4';

    productImage.addEventListener('click', function() {
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    function openModal() {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        trailerVideo.innerHTML = `<video width="100%" height="auto" controls>
                                    <source src="${trailerUrl}" type="video/mp4">
                                  </video>`;
        setTimeout(() => {
            trailerVideo.querySelector('video').play();
        }, 300);
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            trailerVideo.innerHTML = '';
        }, 300);
    }
});
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
// Utility function to extract query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch and display movie details
async function loadMovieDetails() {
    const movieId = getQueryParam("id"); // Extract 'id' from the URL
    if (!movieId) {
        document.querySelector(".product-details-container").innerHTML = "<p>Invalid movie ID.</p>";
        return;
    }

    try {
        // Fetch movie details from the backend API
        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch movie details.");
        }

        const movie = await response.json();
        populateMovieDetails(movie);
    } catch (error) {
        document.querySelector(".product-details-container").innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function populateMovieDetails(movie) {
    console.log("this is the movie,", movie)
    document.querySelector(".product-image img").src = movie.imgUrl;
    document.querySelector(".product-image img").alt = movie.title;
    document.querySelector(".product-info h1").textContent = movie.title;
    document.querySelector(".price").textContent = `$${movie.price.toFixed(2)}`;
    document.querySelector(".movie-meta .rating").innerHTML = `<i class="fas fa-star"></i> ${movie.rating}`;
    document.querySelector(".movie-meta .duration").innerHTML = `<i class="fas fa-clock"></i> ${movie.duration}`;
    document.querySelector(".movie-meta .year").textContent = movie.release_year;
    document.querySelector(".movie-meta .genre").textContent = movie.genre || "N/A";
    document.querySelector(".description").textContent = movie.description || "No description available.";

    const detailsHTML = `
        <p><strong>Director:</strong> ${movie.director || "Unknown"}</p>
        <p><strong>Starring:</strong> ${movie.starring || "N/A"}</p>
        <p><strong>Language:</strong> ${movie.language || "N/A"}</p>
        <p><strong>Subtitles:</strong> ${movie.subtitles || "N/A"}</p>
    `;
    document.querySelector(".details").innerHTML = `<h3>Movie Details</h3>${detailsHTML}`;
}

document.addEventListener("DOMContentLoaded", loadMovieDetails);
document.getElementById("movieImage").src = movie.imgUrl;
document.getElementById("movieImage").alt = movie.title;
document.getElementById("movieTitle").textContent = movie.title;
