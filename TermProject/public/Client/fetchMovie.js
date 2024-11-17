async function fetchMovieData() {
    try {
      const response = await fetch('movies.json');
      if (!response.ok) {
        throw new Error('Failed to fetch movie data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching movie data:', error);
      return null;
    }
  }
  
  function createMovieElement(movie) {
    const movieElement = document.createElement('div');
    movieElement.className = 'movie';
    movieElement.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>$${movie.price.toFixed(2)}</p>
        <a href="#">View Details</a>
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
  
  document.addEventListener('DOMContentLoaded', async () => {
    const movieData = await fetchMovieData();
    if (movieData) {
      renderMovieCategories(movieData);
    }
  });