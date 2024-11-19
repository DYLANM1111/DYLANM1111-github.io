async function fetchMovieData() {
  try {
      const response = await fetch('http://localhost:3000/api/all');
      if (!response.ok) {
          throw new Error('Failed to fetch movie data');
      }
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

  const groupedMovies = movies.reduce((acc, movie) => {
      if (!acc[movie.category_id]) {
          acc[movie.category_id] = [];
      }
      acc[movie.category_id].push({
          id: movie.id,
          title: movie.title,
          description: movie.description,
          imgUrl: movie.imgUrl,  // Changed this to match the property name
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
      <img src="${movie.imgUrl}" alt="${movie.title}">
      <div class="movie-info">
          <h3>${movie.title}</h3>
          <p class="price">$${movie.price.toFixed(2)}</p>
          <p class="genre">${movie.genre || ''}</p>
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

function setupSearch() {
  const searchInput = document.querySelector('.search-bar input');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
          if (e.target.value.length >= 2) {
              try {
                  const response = await fetch(`http://localhost:3000/api/movies/search?term=${e.target.value}`);
                  const searchResults = await response.json();
                  renderSearchResults(searchResults);
              } catch (error) {
                  console.error('Search error:', error);
              }
          } else if (e.target.value.length === 0) {
              const movieData = await fetchMovieData();
              if (movieData) {
                  renderMovieCategories(movieData);
              }
          }
      }, 300); // Debounce search for better performance
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

  if (movies.length === 0) {
      movieGrid.innerHTML = '<p class="no-results">No movies found</p>';
  } else {
      movies.forEach(movie => {
          const movieElement = document.createElement('div');
          movieElement.className = 'movie';
          movieElement.innerHTML = `
              <img src="${movie.imgUrl}" alt="${movie.title}">
              <div class="movie-info">
                  <h3>${movie.title}</h3>
                  <p class="price">$${movie.price.toFixed(2)}</p>
                  <p class="genre">${movie.genre || ''}</p>
                  <p class="year">${movie.release_year}</p>
                  <a href="details.html?id=${movie.id}">View Details</a>
              </div>
          `;
          movieGrid.appendChild(movieElement);
      });
  }

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