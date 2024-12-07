// TMDb API details
const apiKey = '3b7904bda21c31da8f40d1c0f61aaed7'; // Replace with your TMDb API key
const apiUrl = 'https://api.themoviedb.org/3/search/movie';

// Add event listener for the search button
document.getElementById('searchButton').addEventListener('click', searchMovie);

async function searchMovie() {
  const movieTitle = document.getElementById('movieSearch').value.trim();
  
  // Validate input
  if (!movieTitle) {
    alert('Please enter a movie title!');
    return;
  }

  try {
    // Fetch data from TMDb API
    const response = await fetch(`${apiUrl}?api_key=${apiKey}&query=${encodeURIComponent(movieTitle)}`);
    const data = await response.json();

    // Handle no results
    if (data.results.length === 0) {
      alert('No movies found!');
      return;
    }

    // Display the first movie result
    displayMovieDetails(data.results[0]);
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Failed to fetch movie data.');
  }
}

function displayMovieDetails(movie) {
  const movieDetailsDiv = document.getElementById('movieDetails');
  
  // Create the movie card HTML
  const movieCard = `
    <div class="movie-card">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <div class="movie-info">
        <h2>${movie.title}</h2>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}/10</p>
        <p><strong>Overview:</strong> ${movie.overview}</p>
      </div>
    </div>
  `;

  // Inject the movie card into the page
  movieDetailsDiv.innerHTML = movieCard;
}
