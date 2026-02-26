const toggleBtn = document.getElementById('theme-toggle')
const body = document.getElementById('body')
const empty = document.querySelector('.empty')
const addLink = document.querySelector('.add-container')
const addIcon = document.getElementById('add-icon')
const apiKey = '15136d50'
const searchResult = document.getElementById('movies-container')
const movies = document.getElementById('movies')
const moviesData = {}

const isIndex = window.location.pathname.endsWith('index.html')
const isWatchlist = window.location.pathname.endsWith('watchlist.html')

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark') {
    body.classList.add('dark-mode')
    toggleBtn.textContent = 'Dark'

    // if (isWatchlist) {
    //     empty.style.color = '#787878'
    //     addLink.style.color = '#ffffff'
    //     addIcon.src = '/images/add-icon2.png'
    //     addIcon.style.background = '#ffffff'
    // }
}

// Toggle theme function
function toggleTheme() {
    body.classList.toggle('dark-mode')

    if (toggleBtn.textContent === 'Light') {
        localStorage.setItem('theme', 'dark')
        toggleBtn.textContent = 'Dark'

        // if (isWatchlist) {
        //     empty.style.color = '#787878'
        //     addLink.style.color = '#ffffff'
        //     addIcon.src = '/images/add-icon2.png'
        //     addIcon.style.background = '#ffffff'
        // }
    } else {
        localStorage.setItem('theme', 'light')
        toggleBtn.textContent = 'Light'

        // if (isWatchlist) {
        //     empty.style.color = '#DFDDDD'
        //     addLink.style.color = 'black'
        //     addIcon.src = '/images/plus-icon.png'
        //     addIcon.style.background = ''
        // }
    }
}

toggleBtn.addEventListener('click', toggleTheme)

// Api functions
const searchBtn = document.getElementById('search-btn')
const searchInput = document.getElementById('movie-search')

function searchMovie() {
    const searched = searchInput.value
    const holder = document.getElementById('holder')
    const title = searched.charAt(0).toUpperCase() + searched.slice(1).toLowerCase()
    searchInput.value = ""
    
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${title}`)
    .then(res => res.json())
    .then(data => {
        if (data.Response === "True") {

            holder.hidden = true
            searchResult.innerHTML = ""

            data.Search.forEach(movie => {

                // Fetch full details per movie
                fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
                    .then(res => res.json())
                    .then(fullData => {
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
                                    <p class="plot">
                                        ${fullData.Plot}
                                    </p>
                                </div>
                            </div>
                        </div>
                        `

                        moviesData[fullData.imdbID] = fullData;
                    })
            })

        } else {
            console.log('Not found!')
        }
    })
}

if (isIndex) {
    //Search Button Submit
    searchBtn.addEventListener('click', searchMovie)    
    // Enter to submit
    searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        searchMovie()
    }
    })
    //Add to Watchlist
    searchResult.addEventListener('click', function(e) {
    if (e.target.closest('.add-movie')) {

        const button = e.target.closest('.add-movie')
        const movieId = button.dataset.id

        const movieData = moviesData[movieId]

        // Get existing watchlist (or empty array)
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || []

        // Prevent duplicates
        const alreadyAdded = watchlist.some(movie => movie.imdbID === movieId)

        if (!alreadyAdded) {
            watchlist.push(movieData)
            localStorage.setItem('watchlist', JSON.stringify(watchlist))
            console.log("Added to watchlist:", movieData)
        } else {
            console.log("Movie already in watchlist")
        }
    }
})
}

if (isWatchlist) {
    const watchList = document.getElementById('watchlist-container')

    function renderWatchlist() {
        
        const storedMovies = JSON.parse(localStorage.getItem('watchlist')) || []
        if (storedMovies.length === 0) {
            watchList.innerHTML = ` 
            <div class="watchlist-inner" id="watchlist-inner">
                <h2 class="empty">Your watchlist is looking a little empty...</h2>
                <div class="more-vids">
                    <a class="add-container" id="add-movies" href="index.html" >
                    <img src="images/plus-icon.png" class="add-icon" id="add-icon">
                    Let's add some movies!</a>
                </div>
            </div>
            `
            return
        }

        watchList.innerHTML = '' 

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
                            <p class="plot">
                                ${movieData.Plot}
                            </p>
                        </div>
                    </div>
                </div>
            `
        })
    }
        watchList.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-movie')) {
                const movieId = e.target.dataset.id

                let storedMovies = JSON.parse(localStorage.getItem('watchlist')) || []

                // remove the movie
                storedMovies = storedMovies.filter(movie => movie.imdbID !== movieId)

                // save updated array
                localStorage.setItem('watchlist', JSON.stringify(storedMovies))

                // re-render UI
                renderWatchlist()
            }
        })
        renderWatchlist()
}




