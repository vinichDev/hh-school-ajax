const searchMovie = document.getElementById('search-movie');
const movieInfo = document.querySelector('.movie-info');
const searchResult = document.querySelector('.search-result');
const searchResultItemNoSuggest = document.querySelector('.search-result__item_no-suggest');
const searchResultItemsSuggest = document.querySelectorAll('.search-result__item_suggest');
const recentSearchResultMovies = document.querySelectorAll('.recent-search-results__movie');
const movieInfoListLength = 10;

window.onload = () => {
    if (localStorage.getItem('movies') == null) {
        localStorage.setItem('movies', JSON.stringify([]));
    }

    if (localStorage.getItem('recent-movies') == null) {
        localStorage.setItem('recent-movies', JSON.stringify([{}, {}, {}]));
    }

    showRecentSearchResultList(getRecentSearchResultList());
}

window.addEventListener('storage', () => {
    showRecentSearchResultList(getRecentSearchResultList());
});

searchResult.onselectstart = () => {
    return false
};

searchMovie.addEventListener('input', () => {
    const inputText = searchMovie.value;
    if (inputText.length) {
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=8c194573f6b2dd3faef281bdca514cbc&query=${inputText}&language=ru&include_adult=false`)
            .then(response => response.json())
            .then(response => addMovieToResultList(response.results))
            .catch(e => console.error(e.message));
    } else {
        clearSearchResultItemsSuggest();
    }
});

const addMovieToResultList = (foundResults) => {
    clearSearchResultItemsSuggest();

    if (!foundResults.length) {
        searchResultItemNoSuggest.style.display = 'block';
        return;
    }

    const searchResultItemSuggestIter = searchResultItemsSuggest.values();

    const movieInfoLocalStorageResultList = findResultsInLocalStorage();
    console.log(123);
    for (const movie of movieInfoLocalStorageResultList) {
        const searchResultItemSuggest = searchResultItemSuggestIter.next().value;
        searchResultItemSuggest.children[0].style.color = 'DarkViolet';
        searchResultItemSuggest.children[0].innerHTML = movie.title;
        searchResultItemSuggest.style.display = 'block';
        searchResultItemSuggest.dataset.movieId = movie.id;
    }

    const movieInfoSearchResultList = foundResults.slice(0, movieInfoListLength - movieInfoLocalStorageResultList.length);
    for (const movie of movieInfoSearchResultList) {
        const searchResultItemSuggest = searchResultItemSuggestIter.next().value;
        searchResultItemSuggest.children[0].style.color = '#000';
        searchResultItemSuggest.children[0].innerHTML = movie.title;
        searchResultItemSuggest.style.display = 'block';
        searchResultItemSuggest.dataset.movieId = movie.id;
    }
}

const clearSearchResultItemsSuggest = () => {
    searchResultItemNoSuggest.style.display = 'none';
    searchResultItemsSuggest.forEach((searchResultItemSuggest) => {
        searchResultItemSuggest.style.display = 'none';
    });
}

const findResultsInLocalStorage = () => {
    const inputText = searchMovie.value;
    let moviesLocalStorage;
    try {
        moviesLocalStorage = JSON.parse(localStorage.getItem('movies'));
    } catch (e) {
        console.error(e.message);
    }
    return moviesLocalStorage
        .filter(movie => movie.title.toLowerCase().indexOf(inputText.toLowerCase()) !== -1)
        .slice(0, 5);
}

searchResultItemsSuggest.forEach((searchResultItemSuggest) => {
    searchResultItemSuggest.addEventListener('click', () => {
        clearSearchResultItemsSuggest();

        const movieId = searchResultItemSuggest.dataset.movieId;
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=8c194573f6b2dd3faef281bdca514cbc&language=ru`)
            .then(response => response.json())
            .then(response => {
                selectSuggestItem(response)
            })
            .catch(e => console.error(e.message));
    });
});

const selectSuggestItem = (response) => {
    showMovieInfo(response);

    addMovieToLocalStorage(response);

    const recentSearchResultList = getRecentSearchResultList()

    updateRecentSearchResultList(recentSearchResultList, response);
    showRecentSearchResultList(recentSearchResultList);
}

const showMovieInfo = ({title, original_title, release_date, genres, overview}) => {
    movieInfo.innerHTML = `
        <h2 class="title">${title}</h2>
        <p class="detailed">${original_title}, ${release_date.substring(0, 4)}</p>
        <p class="Genres">Жанр: ${genres.map((genre) => genre.name).join(', ')}</p>
        <p class="overview">${overview || "Нет описания"}</p>
    `;
}

const addMovieToLocalStorage = ({id, title}) => {
    let moviesLocalStorage;
    try {
        moviesLocalStorage = JSON.parse(localStorage.getItem('movies'));
    } catch (e) {
        console.error(e.message);
    }


    if (!moviesLocalStorage.find(movie => movie.id === id)) {
        moviesLocalStorage.push({
            "id": id,
            "title": title
        });
    }

    localStorage.setItem('movies', JSON.stringify(moviesLocalStorage));
}

const getRecentSearchResultList = () => {
    let recentSearchResultList;
    try {
        recentSearchResultList = JSON.parse(localStorage.getItem('recent-movies'));
    } catch (e) {
        console.error(e.message);
    }
    return recentSearchResultList;
}

const updateRecentSearchResultList = (recentSearchResultList, {id, title}) => {
    recentSearchResultList.pop();
    recentSearchResultList.unshift({
        "id": id,
        "title": title
    });
    localStorage.setItem('recent-movies', JSON.stringify(recentSearchResultList));
    return recentSearchResultList;
}

const showRecentSearchResultList = (recentSearchResultList) => {
    for (let i = 0; i < 3; i++) {
        recentSearchResultMovies[i].innerHTML = recentSearchResultList[i].title || '';
    }
}



