const searchMovie = document.getElementById('search-movie');
const movieInfo = document.querySelector('.movie-info');
const searchResult = document.querySelector('.search-result');
const searchResultItemNoSuggest = document.querySelector('.search-result__item_no-suggest');
const searchResultItemsSuggest = document.querySelectorAll('.search-result__item_suggest');
const movieInfoListLength = 10;

searchResult.onselectstart = () => {return false};

searchMovie.addEventListener('input', () => {
    const inputText = searchMovie.value;
    if (inputText.length) {
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=8c194573f6b2dd3faef281bdca514cbc&query=${inputText}&language=ru&include_adult=false`)
            .then(response => response.json())
            .then(response => addMovieToResultList(response.results))
    }
    else {
        clearSearchResultItemsSuggest();
    }
});

const addMovieToResultList = (foundResults) => {
    clearSearchResultItemsSuggest();

    if (!foundResults.length) {
        searchResultItemNoSuggest.style.display = "block";
        return;
    }

    const movieInfoList = foundResults.slice(0, movieInfoListLength);
    const searchResultItemSuggestIter = searchResultItemsSuggest.values();

    for (const movie of movieInfoList) {
        const searchResultItemSuggest = searchResultItemSuggestIter.next().value;
        searchResultItemSuggest.children[0].innerHTML = movie.title;
        searchResultItemSuggest.style.display = "block";
        searchResultItemSuggest.dataset.movieId = movie.id;
    }
}

const clearSearchResultItemsSuggest = () => {
    searchResultItemNoSuggest.style.display = "none";
    searchResultItemsSuggest.forEach((searchResultItemSuggest) => {
        searchResultItemSuggest.style.display = "none";
    });
}
searchResultItemsSuggest.forEach((searchResultItemSuggest) => {
    searchResultItemSuggest.addEventListener('click', event => {
        clearSearchResultItemsSuggest();
        const movieId = searchResultItemSuggest.dataset.movieId;
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=8c194573f6b2dd3faef281bdca514cbc&language=ru`)
            .then(response => response.json())
            .then(response => {
                console.log(response.genres);
                movieInfo.innerHTML = `
                        <h2 class="title">${response.title}</h2>
                        <p class="detailed">${response.original_title}, ${response.release_date.substring(0, 4)}</p>
                        <p class="Genres">Жанры: ${response.genres.map((genre) => genre.name).join(', ')}</p>
                        <p class="overview">${response.overview || "Нет описания"}</p>
                    `;
            })
    });
});



