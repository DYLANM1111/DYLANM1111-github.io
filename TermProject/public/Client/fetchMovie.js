// fetchMovie.js

async function fetchMovieData() {
  try {
      const response = await fetch('http://localhost:3000/api/all');
      if (!response.ok) {
          throw new Error('Failed to fetch movie data');
      }
      // Group movies by category
      const movies = await response.json();
      return groupMoviesByCategory(movies);
  } catch (error) {
      console.error('Error fetching movie data:', error);
      return null;
  }
}

function groupMoviesByCategory(movies) {
  const categorizedData = {
      categories: []
  };

  // Group movies by category_id
  const groupedMovies = movies.reduce((acc, movie) => {
      if (!acc[movie.category_id]) {
          acc[movie.category_id] = [];
      }
      acc[movie.category_id].push({
          id: movie.id,
          title: movie.title,
          description: movie.description,
          image: movie.imgUrl,  
          price: movie.price,
          genre: movie.genre,
          release_year: movie.release_year
      });
      return acc;
  }, {});

  Object.keys(groupedMovies).forEach(categoryId => {
      categorizedData.categories.push({
          id: parseInt(categoryId),
          name: `Category ${categoryId}`, 
          movies: groupedMovies[categoryId]
      });
  });

  return categorizedData;
}

function createMovieElement(movie) {
  const movieElement = document.createElement('div');
  movieElement.className = 'movie';
  movieElement.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <div class="movie-info">
          <h3>${movie.title}</h3>
          <p class="price">$${movie.price.toFixed(2)}</p>
          <p class="genre">${movie.genre}</p>
          <p class="year">${movie.release_year}</p>
          <a href="details.html?id=${movie.id}">View Details</a>
      </div>
  `;
  return movieElement;
}

function createScrollButton(direction) {
  const button = document.createElement('button');
  button.className = `scroll-btn ${direction}`;
  button.innerHTML = direction === 'left' ? '&#10094;' : '&#10095;';
  return button;
}

function renderMovieCategories(data) {
  const categoriesSection = document.querySelector('.categories');
  if (!categoriesSection) return;

  categoriesSection.innerHTML = '';

  data.categories.forEach(category => {
      const categoryElement = document.createElement('div');
      categoryElement.className = 'category';
      
      const categoryTitle = document.createElement('h2');
      categoryTitle.textContent = category.name;
      categoryElement.appendChild(categoryTitle);

      const rowContainer = document.createElement('div');
      rowContainer.className = 'category-row-container';

      const movieRow = document.createElement('div');
      movieRow.className = 'category-row';

      category.movies.forEach(movie => {
          movieRow.appendChild(createMovieElement(movie));
      });

      rowContainer.appendChild(movieRow);

      if (category.movies.length > 4) {
          const leftButton = createScrollButton('left');
          const rightButton = createScrollButton('right');

          leftButton.addEventListener('click', () => scrollMovies(movieRow, -1));
          rightButton.addEventListener('click', () => scrollMovies(movieRow, 1));

          rowContainer.appendChild(leftButton);
          rowContainer.appendChild(rightButton);
      }

      categoryElement.appendChild(rowContainer);
      categoriesSection.appendChild(categoryElement);
  });
}

function scrollMovies(movieRow, direction) {
  const scrollAmount = direction * movieRow.offsetWidth / 3;
  movieRow.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// Add search functionality
function setupSearch() {
  const searchInput = document.querySelector('.search-bar input');
  searchInput.addEventListener('input', async (e) => {
      if (e.target.value.length >= 2) {
          try {
              const response = await fetch(`http://localhost:3000/api/movies/search?term=${e.target.value}`);
              const searchResults = await response.json();
              renderSearchResults(searchResults);
          } catch (error) {
              console.error('Search error:', error);
          }
      } else if (e.target.value.length === 0) {
          // Reset to normal view
          const movieData = await fetchMovieData();
          if (movieData) {
              renderMovieCategories(movieData);
          }
      }
  });
}

function renderSearchResults(movies) {
  const categoriesSection = document.querySelector('.categories');
  if (!categoriesSection) return;

  categoriesSection.innerHTML = '';
  
  const searchResultsElement = document.createElement('div');
  searchResultsElement.className = 'search-results';
  
  const title = document.createElement('h2');
  title.textContent = 'Search Results';
  searchResultsElement.appendChild(title);

  const movieGrid = document.createElement('div');
  movieGrid.className = 'movie-grid';

  movies.forEach(movie => {
      movieGrid.appendChild(createMovieElement(movie));
  });

  searchResultsElement.appendChild(movieGrid);
  categoriesSection.appendChild(searchResultsElement);
}

document.addEventListener('DOMContentLoaded', async () => {
  setupSearch();
  const movieData = await fetchMovieData();
  if (movieData) {
      renderMovieCategories(movieData);
  }
});