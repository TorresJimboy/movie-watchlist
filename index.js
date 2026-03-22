const toggleBtn = document.getElementById('theme-toggle');
const body = document.getElementById('body');
const searchResult = document.getElementById('movies-container');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('movie-search');
const moviesData = {};
const apiKey = '15136d50';
const watchList = document.getElementById('watchlist-container');

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    toggleBtn.textContent = 'Dark';
}

// Toggle theme
function toggleTheme() {
    body.classList.toggle('dark-mode');
    if (toggleBtn.textContent === 'Light') {
        localStorage.setItem('theme', 'dark');
        toggleBtn.textContent = 'Dark';
    } else {
        localStorage.setItem('theme', 'light');
        toggleBtn.textContent = 'Light';
    }
}

if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);

// Show notification (centered)
function showNotification(message, type = "success") {
    const notif = document.createElement('div');
    notif.className = `notification ${type === 'already' ? 'already' : ''}`;
    notif.textContent = message;
    document.body.appendChild(notif);

    // Trigger animation
    setTimeout(() => notif.classList.add('show'), 10);

    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 1500);
}

// Render search results
function renderSearchResults(results) {
    const holder = document.getElementById('holder');
    if (holder) holder.hidden = true;
    searchResult.innerHTML = '';

    results.forEach(fullData => {
        searchResult.innerHTML += `
            <div class="movie">
                <img class="poster" src="${fullData.Poster}">
                <div class="description">
                    <div class="desc-top">
                        <h2 class="title">${fullData.Title}</h2>
                        <p class="rating">⭐ ${fullData.imdbRating}</p>  
                    </div>
                    <div class="desc-mid">
                        <p class="duration">${fullData.Runtime}</p>
                        <p class="genre">${fullData.Genre}</p>
                        <button class="add-movie" data-id="${fullData.imdbID}">
                            <img src="images/plus-icon.png" class="add-icon">
                            Watchlist
                        </button>
                    </div>
                    <div class="desc-end">
                        <p class="plot">${fullData.Plot}</p>
                    </div>
                </div>
            </div>
        `;
        moviesData[fullData.imdbID] = fullData;
    });
}

// Search function
function searchMovie() {
    const searched = searchInput.value.trim();
    if (!searched) return;

    const title = searched.charAt(0).toUpperCase() + searched.slice(1).toLowerCase();
    searchInput.value = "";

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${title}`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === "True") {
                const moviePromises = data.Search.map(movie =>
                    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`).then(res => res.json())
                );

                Promise.all(moviePromises).then(fullDataArray => {
                    // Render and save to localStorage for persistence
                    renderSearchResults(fullDataArray);
                    localStorage.setItem('lastSearch', JSON.stringify({
                        term: title,
                        results: fullDataArray
                    }));
                });
            } else {
                const holder = document.getElementById('holder');
                if (holder) holder.hidden = true;
                searchResult.innerHTML = `
                    <div class="not-found">
                        <h2>No results found</h2>
                        <p>Try searching for something else 🎬</p>
                    </div>
                `;
                localStorage.removeItem('lastSearch'); // clear last search if nothing found
            }
        });
}

// Restore last search on page load
window.addEventListener('load', () => {
    const lastSearch = JSON.parse(localStorage.getItem('lastSearch'));
    if (lastSearch && lastSearch.results.length > 0) {
        searchInput.value = lastSearch.term;
        renderSearchResults(lastSearch.results);
    }
});

// Event listeners for search
if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', searchMovie);
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') searchMovie();
    });
}

// Add to Watchlist
if (searchResult) {
    searchResult.addEventListener('click', function (e) {
        if (e.target.closest('.add-movie')) {
            const button = e.target.closest('.add-movie');
            const movieId = button.dataset.id;
            const movieData = moviesData[movieId];

            const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
            const alreadyAdded = watchlist.some(movie => movie.imdbID === movieId);

            if (!alreadyAdded) {
                watchlist.push(movieData);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                showNotification("Added to Watchlist ✅");
            } else {
                showNotification("Movie already in Watchlist ⚠️", "already");
            }
        }
    });
}

// Watchlist Page
if (watchList) {
    function renderWatchlist() {
        const storedMovies = JSON.parse(localStorage.getItem('watchlist')) || [];
        if (storedMovies.length === 0) {
            watchList.innerHTML = ` 
                <div class="watchlist-inner">
                    <h2 class="empty">Your watchlist is looking a little empty...</h2>
                    <div class="more-vids">
                        <a class="add-container" href="index.html">
                            <img src="images/plus-icon.png" class="add-icon">
                            Let's add some movies!
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        watchList.innerHTML = '';
        storedMovies.forEach(movieData => {
            watchList.innerHTML += `
                <div class="movie">
                    <img class="poster" src="${movieData.Poster}">
                    <div class="description">
                        <div class="desc-top">
                            <h2 class="title">${movieData.Title}</h2>
                            <p class="rating">⭐ ${movieData.imdbRating}</p>  
                        </div>
                        <div class="desc-mid">
                            <p class="duration">${movieData.Runtime}</p>
                            <p class="genre">${movieData.Genre}</p>
                            <button class="remove-movie" data-id="${movieData.imdbID}">
                                Remove
                            </button>
                        </div>
                        <div class="desc-end">
                            <p class="plot">${movieData.Plot}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    watchList.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-movie')) {
            const movieId = e.target.dataset.id;
            let storedMovies = JSON.parse(localStorage.getItem('watchlist')) || [];
            storedMovies = storedMovies.filter(movie => movie.imdbID !== movieId);
            localStorage.setItem('watchlist', JSON.stringify(storedMovies));
            renderWatchlist();
        }
    });

    renderWatchlist();
}