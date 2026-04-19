function setMovie(movie) {

  for (const element of document.forms[0].elements) {
    const name = element.id;
    const value = movie[name];
    
    if (name === "Genres") {
      const options = element.options;
      for (let index = 0; index < options.length; index++) {
        const option = options[index];
        option.selected = value.indexOf(option.value) >= 0;
      }
    } else {
      element.value = value;
    }
  }
}

function getMovie() {
  const movie = {};

  const elements = Array.from(document.forms[0].elements).filter(element => element.id)

  for (const element of elements) {
    const name = element.id;

    let value;

    if (name === "Genres") {
      value = [];
      const options = element.options;
      for (let index = 0; index < options.length; index++) {
        const option = options[index];
        if (option.selected) {
          value.push(option.value);
        }
      }
    } else if (name === "Metascore" || name === "Runtime" || name === "imdbRating") {
        value = Number(element.value);
    } else if (name === "Actors" || name === "Directors" || name === "Writers") {
      value = element.value.split(",").map((item) => item.trim());
    } else {
      value = element.value;
    }

    movie[name] = value;
  }

  return movie;
}

function isFormValid() {
  const title = document.getElementById("Title").value.trim();
  const released = document.getElementById("Released").value.trim();
  const runtime = document.getElementById("Runtime").value.trim();
  const plot = document.getElementById("Plot").value.trim();
  const poster = document.getElementById("Poster").value.trim();
  const metascore = document.getElementById("Metascore").value.trim();
  const imdbRating = document.getElementById("imdbRating").value.trim();
  const directors = document.getElementById("Directors").value.trim();
  const writers = document.getElementById("Writers").value.trim();
  const actors = document.getElementById("Actors").value.trim();
  const genres = document.getElementById("Genres");

  const selectedGenres = Array.from(genres.options).filter(option => option.selected);

  if (title === "") return false;
  if (released === "") return false;
  if (runtime === "" || Number(runtime) <= 0) return false;
  if (plot === "") return false;
  if (poster === "") return false;
  if (metascore === "" || Number(metascore) < 0 || Number(metascore) > 100) return false;
  if (imdbRating === "" || Number(imdbRating) < 0 || Number(imdbRating) > 10) return false;
  if (directors === "") return false;
  if (writers === "") return false;
  if (actors === "") return false;
  if (selectedGenres.length === 0) return false;

  return true;
}

function validateForm() {
  let valid = true;

  const title = document.getElementById("Title");
  const released = document.getElementById("Released");
  const runtime = document.getElementById("Runtime");
  const plot = document.getElementById("Plot");
  const poster = document.getElementById("Poster");
  const metascore = document.getElementById("Metascore");
  const imdbRating = document.getElementById("imdbRating");
  const genres = document.getElementById("Genres");
  const directors = document.getElementById("Directors");
  const writers = document.getElementById("Writers");
  const actors = document.getElementById("Actors");

  const fields = [
    title, released, runtime, plot, poster,
    metascore, imdbRating, directors, writers, actors, genres
  ];

  for (const field of fields) {
    field.classList.remove("invalid");
  }

  if (title.value.trim() === "") {
    title.classList.add("invalid");
    valid = false;
  }

  if (released.value.trim() === "") {
    released.classList.add("invalid");
    valid = false;
  }

  if (runtime.value.trim() === "" || Number(runtime.value) <= 0) {
    runtime.classList.add("invalid");
    valid = false;
  }

  if (plot.value.trim() === "") {
    plot.classList.add("invalid");
    valid = false;
  }

  if (poster.value.trim() === "") {
    poster.classList.add("invalid");
    valid = false;
  }

  if (metascore.value.trim() === "" || Number(metascore.value) < 0 || Number(metascore.value) > 100) {
    metascore.classList.add("invalid");
    valid = false;
  }

  if (imdbRating.value.trim() === "" || Number(imdbRating.value) < 0 || Number(imdbRating.value) > 10) {
    imdbRating.classList.add("invalid");
    valid = false;
  }

  if (directors.value.trim() === "") {
    directors.classList.add("invalid");
    valid = false;
  }

  if (writers.value.trim() === "") {
    writers.classList.add("invalid");
    valid = false;
  }

  if (actors.value.trim() === "") {
    actors.classList.add("invalid");
    valid = false;
  }

  const selectedGenres = Array.from(genres.options).filter(option => option.selected);
  if (selectedGenres.length === 0) {
    genres.classList.add("invalid");
    valid = false;
  }

  return valid;
}

function showError(message) {
  let box = document.querySelector(".error-box");

  if (!box) {
    box = document.createElement("div");
    box.className = "error-box";
    document.body.append(box);
  }

  box.textContent = message;
}

function hideError() {
  const box = document.querySelector(".error-box");
  if (box) {
    box.remove();
  }
}

function updateSaveButton() {
  const saveButton = document.getElementById("saveButton");
  if (!saveButton) return;

  const isValid = validateForm();
  saveButton.disabled = !isValid;

  if (isValid) {
    hideError();
  } else {
    showError("Please fill in all required fields correctly.");
  }
}

function putMovie() {
  const isValid = validateForm();

  if (!isValid) {
    showError("Please fix the highlighted fields before saving.");
    return;
  }

  hideError();
  
  const movie = getMovie();

  const xhr = new XMLHttpRequest()
  xhr.onload = function() {
    if (xhr.status == 200 || xhr.status === 204 || xhr.status === 201) {
      location.href = 'index.html'
    } else {
      alert("Saving of movie data failed. Status code was " + xhr.status)
    }
  }
  
  xhr.open("PUT", "/movies/" + movie.imdbID)
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send(JSON.stringify(movie))
}

/** Loading and setting the movie data for the movie with the passed imdbID */
const imdbID = new URLSearchParams(window.location.search).get("imdbID");

const xhr = new XMLHttpRequest();
xhr.open("GET", "/movies/" + imdbID);
xhr.onload = function() {
  if (xhr.status === 200) {
    setMovie(JSON.parse(xhr.responseText));
    updateSaveButton();
  } else {
    alert("Loading of movie data failed. Status was " + xhr.status + " - " + xhr.statusText);
  } 
}

xhr.send()

window.addEventListener("DOMContentLoaded", function () {
  const formElements = Array.from(document.forms[0].elements).filter(element => element.id);

  for (const element of formElements) {
    element.addEventListener("input", updateSaveButton);
    element.addEventListener("change", updateSaveButton);
  }
});