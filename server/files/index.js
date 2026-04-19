import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

// colored tags
function getGenreColor(genre) {
  const colors = {
    "Fantasy": "#ffcc80",
    "Drama": "#90caf9",
    "Adventure": "#a5d6a7",
    "Animation": "#b39ddb",
    "Family": "#9de8ff",
    "Action": "#ef9a9a",
    "Comedy": "#ffe082",
    "Crime": "#bcaaa4",
    "Documentary": "#c5e1a5",
    "Biography": "#d7ccc8",
    "Film Noir": "#9e9e9e",
    "History": "#ffe0b2",
    "Horror": "#ef9a9a",
    "Music": "#f8bbd0",
    "Musical": "#f48fb1",
    "Mystery": "#b0bec5",
    "Romance": "#f48fb1",
    "Sci-Fi": "#81d4fa",
    "Short Film": "#e0e0e0",
    "Sport": "#aed581",
    "Superhero": "#ff8a65",
    "Thriller": "#90a4ae",
    "War": "#a1887f",
    "Western": "#d7b899"
  };

  return colors[genre] || "darkgray";
}

function appendMovie(movie, element) {
  const article = new ElementBuilder("article").id(movie.imdbID)
    .append(new ElementBuilder("img").with("src", movie.Poster))
    .append(new ElementBuilder("h1").text(movie.Title))
    .append(new ElementBuilder("p")
      .append(new ElementBuilder("button").text("Edit")
        .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
    .append(new ParagraphBuilder().items(
      "Runtime " + formatRuntime(movie.Runtime),
      "\u2022",
      "Released on " + new Date(movie.Released).toLocaleDateString("en-US")
    ));

  // --- GENRES ---
  const genreParagraph = new ElementBuilder("p");
  for (const genre of movie.Genres) {
    genreParagraph.append(
      new ElementBuilder("span")
        .with("class", "genre")
        .with("style", "background-color: " + getGenreColor(genre))
        .text(genre)
    );
  }

  // --- RATINGS ---
  const ratingParagraph = new ElementBuilder("p")
    .text("Metascore: " + movie.Metascore + " | IMDb Rating: " + movie.imdbRating + " / 10");



  article
    .append(ratingParagraph)
    .append(genreParagraph)
    .append(new ElementBuilder("p").text(movie.Plot))
    .append(new ElementBuilder("h2").pluralizedText("Director", movie.Directors))
    .append(new ListBuilder().items(movie.Directors))
    .append(new ElementBuilder("h2").pluralizedText("Writer", movie.Writers))
    .append(new ListBuilder().items(movie.Writers))
    .append(new ElementBuilder("h2").pluralizedText("Actor", movie.Actors))
    .append(new ListBuilder().items(movie.Actors))
    .appendTo(element);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        appendMovie(movie, mainElement)
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  }

  const url = new URL("/movies", location.href)
  /* Task 2.2. Add query parameter to the url if a genre is given */
  if (genre) {
    url.searchParams.set("genre", genre);
  }

  xhr.open("GET", url)
  xhr.send()
}

window.onload = function () {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const listElement = document.querySelector("nav>ul");

    if (xhr.status === 200) {
      /* Task 1.3. Add the genre buttons to the listElement and 
         initialize them with a click handler that calls the 
         loadMovies(...) function above. */
      const genres = JSON.parse(xhr.responseText);

      // --- ALL BUTTON ---
      const allLi = document.createElement("li");
      const allButton = document.createElement("button");
      allButton.textContent = "All";
      allButton.className = "genre-button";
      allButton.style.backgroundColor = "#804a1f";
      allButton.onclick = function () {
        loadMovies();
      };
      allLi.append(allButton);
      listElement.append(allLi);


      // --- GENRE BUTTONS ---
      for (const genre of genres) {
        const li = document.createElement("li");
        const button = document.createElement("button");

        button.textContent = genre;
        button.className = "genre-button";
        button.style.backgroundColor = getGenreColor(genre);

        button.onclick = function () {
          loadMovies(genre);
        };

        li.append(button);
        listElement.append(li);
      }


      /* When a first button exists, we click it to load all movies. */
      const firstButton = document.querySelector("nav button");
      if (firstButton) {
        firstButton.click();
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
};
