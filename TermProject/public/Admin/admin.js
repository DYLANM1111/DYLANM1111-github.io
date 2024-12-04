"use strict";

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

async function populateEditForm(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`);
        const movie = await response.json();
        
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

        // Show current image preview
        if (movie.imgUrl) {
            const imgPreview = document.createElement('div');
            imgPreview.className = 'preview-container';
            imgPreview.innerHTML = `
                <p>Current image:</p>
                <img src="../client/${movie.imgUrl}" alt="Current movie image" style="max-width: 200px;">
            `;
            document.getElementById('imgUrl').parentNode.appendChild(imgPreview);
        }
        
        // Show current trailer info
        if (movie.trailer_url) {
            const trailerPreview = document.createElement('div');
            trailerPreview.className = 'preview-container';
            trailerPreview.innerHTML = `
                <p>Current trailer: ${movie.trailer_url}</p>
            `;
            document.getElementById('trailer_url').parentNode.appendChild(trailerPreview);
        }

    } catch (error) {
        console.error('Error loading movie data:', error);
    }
}

async function saveMovie(formData) {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const method = movieId ? 'PUT' : 'POST';
    const url = movieId ? `http://localhost:3000/api/movies/${movieId}` : 'http://localhost:3000/api/movies';

    const jsonData = {};
    formData.forEach((value, key) => {
        if (key === 'is_featured') {
            jsonData[key] = value === 'on';
        } else if ((key === 'imgUrl' || key === 'trailer_url') && value instanceof File) {
            if (value.size > 0) {
                jsonData[key] = value;
            }
        } else if (value !== '') {
            jsonData[key] = value;
        }
    });

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });
        
        if (!response.ok) throw new Error('Failed to save movie');
        
        alert('Movie saved successfully');
        window.location.href = 'admin-products.html';
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
        document.getElementById('editProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const movieId = new URLSearchParams(window.location.search).get('id');
            const url = movieId ? 
                `http://localhost:3000/api/movies/${movieId}` : 
                'http://localhost:3000/api/movies';
        
            try {
                const response = await fetch(url, {
                    method: movieId ? 'PUT' : 'POST',
                    body: formData
                });
        
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Server error');
                }
        
                const result = await response.json();
                alert('Movie saved successfully');
                window.location.href = 'admin-products.html';
            } catch (error) {
                console.error('Error details:', error);
                alert('Error saving movie: ' + error.message);
            }
        });
// admin.js
// Handle form submission
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('myFile');
    const file = fileInput.files[0];

    // Validate file type and existence
    if (!file || !file.name.toLowerCase().endsWith('.json')) {
        alert('Please select a valid JSON file');
        return;
    }

    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Uploading...';

    try {
        // Read file content and parse JSON
        const data = await readFile(file);

        // Upload JSON data to the server
        await uploadBulkData(data);

        alert('Upload successful');
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});

// Read the JSON file
async function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                resolve(jsonData);
            } catch (parseError) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = (e) => reject(new Error('File reading error'));
        reader.readAsText(file);
    });
}

// Upload JSON data to the server
async function uploadBulkData(data) {
    const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        console.error('Error response:', await response.text());
        throw new Error(await response.text());
    }

    return response.json();
}

// Handle image file preview
const imgInput = document.getElementById('imgUrl');
if (imgInput) {
    imgInput.addEventListener('change', function (e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const previewContainer = document.querySelector('.preview-container img');

                if (previewContainer) {
                    // Update existing preview
                    previewContainer.src = e.target.result;
                } else {
                    // Create new preview
                    const newPreview = document.createElement('div');
                    newPreview.className = 'preview-container';
                    newPreview.innerHTML = `
                        <p>New image preview:</p>
                        <img src="${e.target.result}" style="max-width: 200px;">
                    `;
                    imgInput.parentNode.appendChild(newPreview);
                }
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
}

    }
    
});