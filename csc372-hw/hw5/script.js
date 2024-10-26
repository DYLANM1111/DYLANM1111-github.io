const DEFAULT_USERNAME = 'DYLANM1111';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    
    card.innerHTML = `
        <div class="repo-name">
            <i class="fas fa-book"></i>
            <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        </div>
        <div class="repo-description">
            ${repo.description || 'No description available'}
        </div>
        <div class="repo-stats">
            <span><i class="fas fa-code-branch"></i> ${repo.default_branch}</span>
            <span><i class="fas fa-eye"></i> ${repo.watchers_count}</span>
        </div>
        <div class="repo-dates">
            <div>Created: ${formatDate(repo.created_at)}</div>
            <div>Updated: ${formatDate(repo.updated_at)}</div>
        </div>
    `;

    
    if (repo.language) {
        const languages = document.createElement('div');
        languages.className = 'repo-languages';
        const languageTag = document.createElement('span');
        languageTag.className = 'language-tag';
        languageTag.textContent = repo.language;
        languages.appendChild(languageTag);
        card.appendChild(languages);
    }

    return card;
}

async function fetchRepositories() {
    const username = document.getElementById('username').value || DEFAULT_USERNAME;
    const gallery = document.getElementById('repo-gallery');
    
    gallery.innerHTML = ''; 
    
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) {
            throw new Error('User not found');
        }
        
        const repos = await response.json();
        
        repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        repos.forEach(repo => {
            const card = createRepoCard(repo);
            gallery.appendChild(card);
        });
        
    } catch (error) {
        gallery.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchRepositories);