const spinnerCat = document.querySelector('#spinnerCat');
const categories = document.querySelector('#categories');
const selectedCat = document.querySelector('#selectedCat');
const spinnerMovies = document.querySelector('#spinnerMovies');
const movieCards = document.querySelector('#movieCards');
let myCategories = [];
let myMovies = [];

const API_URL = 'https://moviesminidatabase.p.rapidapi.com/';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '2e50c00f75mshfd267fefaec0641p1ad213jsn245f0da85d04',
		'x-rapidapi-host': 'moviesminidatabase.p.rapidapi.com',
		'Content-Type': 'application/json',
	},
};

class Movie {
	constructor(_imdb_id, _title, _year, _trailer, _image_url) {
		this.imdb_id = _imdb_id;
		this.title = _title;
		this.year = _year;
		this.trailer = _trailer;
		this.image_url = _image_url;
	}
}

document.addEventListener('DOMContentLoaded', catSearch); // Al caricamento della pagina popola la combo con le categorie dei film

async function catSearch() {
	try {
		const response = await fetch(`${API_URL}genres`, options);
		const myData = await response.json(); // console.log per controllare la risposta
		myCategories = myData.results;
		myCategories.forEach((category) => {
			const newOption = document.createElement('option');
			newOption.setAttribute('value', category.genre);
			newOption.textContent = `${category.genre}`;
			categories.appendChild(newOption);
		});
		spinnerCat.classList.add('hide');
		categories.classList.remove('hide');
		categories.classList.add('visible');
	} catch (err) {
		console.error(err);
	}
}

// Selezionando una categoria, viene visualizzata la categoria scelta e la parte dedicata dell'HTML si popola con le card con i dettagli dei film trovati
categories.addEventListener('change', function () {
	movieCards.replaceChildren();
	if (categories.value !== '') {
		selectedCat.textContent = `Hai selezionato la categoria ${categories.value}`;
	} else {
		selectedCat.textContent = 'Seleziona una categoria';
		return;
	}
	searchMovies(categories.value);
});

async function searchMovies(category) {
	spinnerMovies.classList.remove('hide');
	spinnerMovies.classList.add('visible');
	try {
		const response = await fetch(
			`${API_URL}movie/byGen/${category}`,
			options,
		);
		const myData = await response.json();
		myMovies = myData.results;
		printMovies();
	} catch (err) {
		console.error(err);
	}
}

function printMovies() {
	myMovies.forEach(async (movie) => {
		const response = await fetch(
			`${API_URL}movie/id/${movie.imdb_id}`,
			options,
		);
		const myData = await response.json();
		const newMovie = new Movie(
			myData.results.imdb_id,
			myData.results.title,
			myData.results.year,
			myData.results.trailer,
			myData.results.image_url,
		);
		// console.log(newMovie);
		printHTML(newMovie);
		spinnerMovies.classList.remove('visible');
		spinnerMovies.classList.add('hide');
	});
}

function printHTML(movie) {
	
}
