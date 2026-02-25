const toggleBtn = document.getElementById('theme-toggle')
const body = document.getElementById('body')
const empty = document.querySelector('.empty')
const addLink = document.querySelector('.add-container')
const addIcon = document.getElementById('add-icon')
const apiKey = '15136d50'
const searchResult = document.getElementById('movies-container')

const isIndex = window.location.pathname.endsWith('index.html')
const isWatchlist = window.location.pathname.endsWith('watchlist.html')

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark') {
    body.classList.add('dark-mode')
    toggleBtn.textContent = 'Dark'

    if (isWatchlist) {
        empty.style.color = '#787878'
        addLink.style.color = '#ffffff'
        addIcon.src = '/images/add-icon2.png'
        addIcon.style.background = '#ffffff'
    }
}

// Toggle theme function
function toggleTheme() {
    body.classList.toggle('dark-mode')

    if (toggleBtn.textContent === 'Light') {
        localStorage.setItem('theme', 'dark')
        toggleBtn.textContent = 'Dark'

        if (isWatchlist) {
            empty.style.color = '#787878'
            addLink.style.color = '#ffffff'
            addIcon.src = '/images/add-icon2.png'
            addIcon.style.background = '#ffffff'
        }
    } else {
        localStorage.setItem('theme', 'light')
        toggleBtn.textContent = 'Light'

        if (isWatchlist) {
            empty.style.color = '#DFDDDD'
            addLink.style.color = 'black'
            addIcon.src = '/images/plus-icon.png'
            addIcon.style.background = ''
        }
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

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${title}`)
        .then(res => res.json())
        .then(data => {
            if(data.Response === "True") {
                holder.hidden = true
                searchResult.innerHTML += `
                <div class="movie">
                    <img class="poster" src="${data.Poster}">
                    <div class="description">
                        <div class="desc-top">
                            <h2 class="title">${data.Title}</h2>
                            <p class="rating">⭐ ${data.imdbRating}</p>  
                        </div>
                        <div class="desc-mid">
                            <p class="duration">${data.Runtime}</p>
                            <p class="genre">${data.Genre}</p>
                            <button class="add-movie"><img src="/images/plus-icon.png" class="add-icon">Watchlist</button>
                        </div>
                        <div class="desc-end">
                            <p class="plot">
                                ${data.Plot}
                            </p>
                        </div>
                    </div>
                </div>
                `
            } else {
                console.log('Not found!')
            }
        })
}

if (isIndex) {
    //Search Button
    searchBtn.addEventListener('click', searchMovie)    
    // Enter to submit
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        searchMovie()
    }
})
}


