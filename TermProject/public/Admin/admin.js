"use strict";
const imageSelector = document.getElementById('imageSelector');
const trailerSelector = document.getElementById('trailerSelector');
const imgUrlInput = document.getElementById('imgUrl');
const trailerUrlInput = document.getElementById('trailer_url');
function createMovieElement(movie) {
    const movieElement = document.createElement('div');
    movieElement.className = 'movie';
    
    let imagePath = movie.imgUrl;
    if (!imagePath.startsWith('/') && !imagePath.startsWith('./') && !imagePath.startsWith('../')) {
        imagePath = `../client/${imagePath}`;
    }

    movieElement.innerHTML = `
        <img src="${imagePath}" alt="${movie.title}" onerror="this.onerror=null; this.src='../client/Images/placeholder.jpg';">
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>Price: $${movie.price.toFixed(2)}</p>
            <p>Director: ${movie.director || 'Not specified'}</p>
            <p>Genre: ${movie.genre || 'Not specified'}</p>
            <p class="description">${movie.description || 'No description available'}</p>
        </div>
        <div class="movie-actions">
            <button onclick="editMovie('${movie.id}')">Edit</button>
            <button onclick="deleteMovie(${movie.id})">Delete</button>
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
            (movie.title.toLowerCase().includes(searchTerm) || 
             (movie.description || '').toLowerCase().includes(searchTerm) ||
             (movie.director || '').toLowerCase().includes(searchTerm) ||
             (movie.genre || '').toLowerCase().includes(searchTerm)) &&
            (categoryFilter === '' || category.name.toLowerCase() === categoryFilter)
        );
        return {...category, movies: filteredMovies};
    }).filter(category => category.movies.length > 0);

    renderMovies(filteredCategories);
}

async function fetchMovieData() {
    try {
        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        const categories = await categoriesResponse.json();
        
        const moviesResponse = await fetch('http://localhost:3000/api/all');
        const movies = await moviesResponse.json();
        
        return {
            categories: categories.map(category => ({
                ...category,
                movies: movies.filter(movie => movie.category_id === category.id)
            }))
        };
    } catch (error) {
        console.error('Error:', error);
        return { categories: [] };
    }
}

async function editMovie(id) {
    try {
        window.location.href = `product-edit.html?id=${id}`;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function populateCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/categories');
        const categories = await response.json();
        const categoryInput = document.getElementById('category_id');
        
        if (categoryInput) {
            const select = document.createElement('select');
            select.id = 'category_id';
            select.name = 'category_id';
            select.required = true;
            
            select.innerHTML = `
                <option value="">Select a category</option>
                ${categories.map(category => 
                    `<option value="${category.id}">${category.name}</option>`
                ).join('')}
            `;
            
            categoryInput.parentNode.replaceChild(select, categoryInput);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}


if (imageSelector) {
    imageSelector.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            // Ensure consistent path format
            imgUrlInput.value = `images/${fileName.toLowerCase()}`.replace('Images/', 'images/');
            
            // Show preview
            const previewContainer = document.getElementById('currentImage');
            previewContainer.innerHTML = `
                <div class="preview-container">
                    <p>Selected image:</p>
                    <img src="../client/images/${fileName}" alt="Preview" 
                         onerror="this.src='../client/images/placeholder.jpg';">
                </div>
            `;
        }
    });
}

if (trailerSelector) {
    trailerSelector.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            trailerUrlInput.value = `videos/${fileName}`;
            
            // Show file name
            const previewContainer = document.getElementById('currentTrailer');
            previewContainer.innerHTML = `
                <div class="preview-container">
                    <p>Selected video: ${fileName}</p>
                </div>
            `;
        }
    });
}

// Modified populateEditForm to handle file previews
async function populateEditForm(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`);
        const movie = await response.json();
        
        // Populate basic fields
        const fields = [
            'title', 'description', 'price', 'category_id', 
            'release_year', 'is_featured', 'director', 'genre',
            'rating', 'time', 'subtitles', 'language', 'staring'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                if (field === 'is_featured') {
                    element.checked = movie[field];
                } else {
                    element.value = movie[field] || '';
                }
            }
        });

        // Handle image
        if (movie.imgUrl) {
            imgUrlInput.value = movie.imgUrl;
            const imgPreview = document.getElementById('currentImage');
            imgPreview.innerHTML = `
                <div class="preview-container">
                    <p>Current image:</p>
                    <img src="../client/${movie.imgUrl}" alt="Current movie image" 
                         onerror="this.src='../client/images/placeholder.jpg';">
                </div>
            `;
        }
        
        // Handle trailer
        if (movie.trailer_url) {
            trailerUrlInput.value = movie.trailer_url;
            const trailerPreview = document.getElementById('currentTrailer');
            trailerPreview.innerHTML = `
                <div class="preview-container">
                    <p>Current trailer: ${movie.trailer_url}</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error loading movie data:', error);
        alert('Error loading movie data: ' + error.message);
    }
}

// Modified saveMovie function
async function saveMovie(formData) {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const method = movieId ? 'PUT' : 'POST';
    const url = movieId ? 
        `http://localhost:3000/api/movies/${movieId}` : 
        'http://localhost:3000/api/movies';

    // Debug: Log the form data before conversion
    console.log('Raw FormData values:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    // Convert FormData to JSON
    const jsonData = {};
    formData.forEach((value, key) => {
        if (key === 'is_featured') {
            jsonData[key] = value === 'on';
        } else if (value !== '') {
            jsonData[key] = value;
        }
        // Debug: Log each conversion
        console.log(`Converting ${key}: ${value} to ${jsonData[key]}`);
    });

    // Debug: Log final JSON
    console.log('Final JSON data:', jsonData);

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save movie');
        }
        
        // Debug: Log response
        const responseData = await response.json();
        console.log('Server response:', responseData);
        
        alert('Movie saved successfully');
       // window.location.href = 'admin-products.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save movie: ' + error.message);
    }
}

async function deleteMovie(id) {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/movies/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete movie');
        
        movieData = await fetchMovieData();
        renderMovies(movieData.categories);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete movie: ' + error.message);
    }
}

let movieData = { categories: [] };





  

  







// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're on the products list page
    if (document.querySelector('.categories')) {
        document.getElementById('search-input')?.addEventListener('input', filterMovies);
        document.getElementById('category-filter')?.addEventListener('change', filterMovies);
        movieData = await fetchMovieData();
        renderMovies(movieData.categories);
    }
    
    // Check if we're on the edit page
    const editForm = document.getElementById('editProductForm');
    if (editForm) {
        await populateCategories();
        
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        if (movieId) {
            await populateEditForm(movieId);
        }

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveMovie(new FormData(e.target));
        });
       ;
// admin.js




    }
    
});