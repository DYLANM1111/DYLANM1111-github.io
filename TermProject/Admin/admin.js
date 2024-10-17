async function fetchMovieData() {
    try {
        const response = await fetch('../movies.json');
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
    
    let imagePath = movie.image.replace(/^Admin\//, '');
    if (!imagePath.startsWith('/') && !imagePath.startsWith('./') && !imagePath.startsWith('../')) {
        imagePath = '/images/' + imagePath.replace(/^images\//, '');
    }
    
    movieElement.innerHTML = `
        <img src="${imagePath}" alt="${movie.title}" onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>Price: $${movie.price.toFixed(2)}</p>
            <p class="description">${movie.description || 'No description available'}</p>
        </div>
        <div class="movie-actions">
            <button onclick="editMovie('${movie.title}')">Edit</button>
            <button onclick="archiveMovie('${movie.title}')">Archive</button>
            <button onclick="deleteMovie('${movie.title}')">Delete</button>
        </div>
    `;
    return movieElement;
}

function renderMovies(categories) {
    const moviesSection = document.querySelector('.categories');
    if (!moviesSection) {
        console.error('Movies section not found');
        return;
    }

    moviesSection.innerHTML = '';

    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category';
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category.name;
        categoryElement.appendChild(categoryTitle);

        const movieContainer = document.createElement('div');
        movieContainer.className = 'movie-container';

        category.movies.forEach(movie => {
            movieContainer.appendChild(createMovieElement(movie));
        });

        categoryElement.appendChild(movieContainer);
        moviesSection.appendChild(categoryElement);
    });
}

function filterMovies() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('category-filter')?.value.toLowerCase() || '';
    
    const filteredCategories = movieData.categories.map(category => {
        const filteredMovies = category.movies.filter(movie => 
            (movie.title.toLowerCase().includes(searchTerm) || (movie.description || '').toLowerCase().includes(searchTerm)) &&
            (categoryFilter === '' || category.name.toLowerCase() === categoryFilter)
        );
        return {...category, movies: filteredMovies};
    }).filter(category => category.movies.length > 0);

    renderMovies(filteredCategories);
}

function editMovie(title) {
 
}

function archiveMovie(title) {
   
}

function deleteMovie(title) {

    }


let movieData = {categories: []};

document.addEventListener('DOMContentLoaded', async () => {
    movieData = await fetchMovieData();
    if (movieData && movieData.categories) {
        renderMovies(movieData.categories);
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', filterMovies);
        } else {
            console.warn('Search input not found');
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterMovies);
        } else {
            console.warn('Category filter not found');
        }

        const addMovieBtn = document.getElementById('add-movie-btn');
        if (addMovieBtn) {
            addMovieBtn.addEventListener('click', () => {
                console.log('Add movie button clicked');
            });
        } else {
            console.warn('Add movie button not found');
        }
    } else {
        console.error('Failed to load movie data');
    }
});