const spinnerCat = document.querySelector('#spinnerCat');
const categories = document.querySelector('#categories');
const selectedCat = document.querySelector('#selectedCat');
const spinnerMovies = document.querySelector('#spinnerMovies');
const movieCards = document.querySelector('#movieCards');
const trailerModalEl = document.querySelector('#trailerModal');
const trailerModalTitle = document.querySelector('#trailerModalTitle');
const trailerSpinner = document.querySelector('#trailerSpinner');
const trailerModalVideo = document.querySelector('#trailerModalVideo');
// Intercetto la modale come BootStrap Element in modo da avere a disposizione i metodi nativi delle modali di BootStrap
const trailerModal = new bootstrap.Modal(trailerModalEl);
// Con i tipi consolido la definizione degli array myCategories e myMovies
/** @type {Array<Object>} */
let myCategories = [];
/** @type {Array<Object>} */
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

// Imposto gli elementi della modale quando non è aperta
// Quando arriva il video nascondo lo spinner
trailerModalVideo.addEventListener('load', () => {
	trailerSpinner.classList.add('hide');
});

// Quando chiudo la modale svuoto l'src del video
trailerModalEl.addEventListener('hidden.bs.modal', () => {
	trailerModalVideo.setAttribute('src', '');
});

document.addEventListener('DOMContentLoaded', catSearch); // Al caricamento della pagina popola la combo con le categorie dei film

async function catSearch() {
	try {
		const response = await fetch(`${API_URL}genres`, options);
		const myData = await response.json(); // console.log per controllare la risposta
		myCategories = myData.results;
		// Ordinamento alfabetico della risposta
		myCategories.sort((a, b) => {
			// Matto tutto in maiuscolo, rendo i parametri facolativi con il ? e prevedo l'undefined con le virgolette vuote; questo perché il sort se uno dei parametri non arriva darà Typeerror in console
			const newCatA = a.genre?.toUpperCase() || '';
			const newCatB = b.genre?.toUpperCase() || '';
			if (newCatA === newCatB) return 0;
			return newCatA < newCatB ? -1 : 1;
		});
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

// Cerca i film della categoria selezionata
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
		// Se non trova film nella categoria mostra un messaggio all'utente
		if (myMovies.length === 0) {
			spinnerMovies.classList.remove('visible');
			spinnerMovies.classList.add('hide');
			const msg = document.createElement('h3');
			msg.textContent = 'Non ci sono film nella categoria selezionata';
			movieCards.appendChild(msg);
			return;
		}
		printMovies();
	} catch (err) {
		console.error(err);
	}
}

// Per ogni film trovato genera un'istanza di classe e la passa alla funzione printHTML che genera la card di ogni singolo film
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

// Generazione delle cards
function printHTML(movie) {
	// Colonna
	const newCol = document.createElement('div');
	newCol.classList.add('col-12', 'col-md-6', 'col-lg-4');
	// Card
	const newCard = document.createElement('div');
	newCard.classList.add('card', 'mb-3');
	// Immagine
	const newImg = document.createElement('img');
	newImg.classList.add('card-img-top');
	newImg.setAttribute('src', movie.image_url);
	// Intercetto eventuali immagini che non si caricano e le sostituisco con un placeholder
	newImg.addEventListener('error', () => {
		const imgError = document.createElement('div');
		imgError.classList.add('card-img-top', 'imgError');
		imgError.textContent = 'Immagine non disponibile';
		newImg.replaceWith(imgError);
	});
	newCard.appendChild(newImg);
	// Corpo card
	const newBody = document.createElement('div');
	newBody.classList.add('card-body');
	const newTitle = document.createElement('h5');
	newTitle.textContent = movie.title;
	const newText = document.createElement('p');
	newText.textContent = movie.year;
	const newLink = document.createElement('a');
	newLink.classList.add('btn', 'btn-primary');
	newLink.setAttribute('href', 'javascript:void(0);');
	newLink.textContent = 'Guarda il trailer';
	// Avvio della modale con il trailer
	newLink.addEventListener('click', () => {
		trailerModalTitle.textContent = movie.title;
		trailerSpinner.classList.remove('hide');
		trailerModalVideo.setAttribute('src', movie.trailer);
		trailerModal.show();
	});
	// Costruzione della card
	newBody.appendChild(newTitle);
	newBody.appendChild(newText);
	newBody.appendChild(newLink);
	newCard.appendChild(newBody);
	newCol.appendChild(newCard);
	movieCards.appendChild(newCol);
}
