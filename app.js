const research = document.querySelector(".fa-magnifying-glass");
const filters = document.querySelectorAll(".filters button");
let filterOn = false; // Indicates if a filter is active or not
let filterType = ""; // i or c or a or s by default
let filterName = ""; // Selected filter name
let search = ""; // Search term (recipe or filter)

// Autocompletion
document
  .querySelector(".search-input")
  .addEventListener("input", autoCompletion);

function autoCompletion() {
  const input = document.querySelector(".search-input");
  const list = document.querySelector(".search-box .list");
  list.style.display = "block";
  let options = [];
  let optionsImg = [];
  let recipe = input.value;
  let typeUrl = "";
  if (filterOn) {
    typeUrl = "filter";
    search = filterName;
  } else {
    typeUrl = "search";
    filterType = "s";
    search = recipe;
  }
  // If we have chosen a filter or if we have started writing in the input
  if (filterOn || recipe !== "") {
    const url = `https://www.themealdb.com/api/json/v1/1/${typeUrl}.php?${filterType}=${search}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.meals) {
          options = [];
          optionsImg = [];
          options = data.meals.map((meal) => meal.strMeal); // Array with name of all returned recipes 
          optionsImg = data.meals.map((meal) => meal.strMealThumb); // Array with image of all returned recipes
          list.innerHTML = "";
          for (let i = 0; i < options.length; i++) {
            const container = document.createElement("div");
            const img = document.createElement("img");
            const div = document.createElement("div");
            div.innerText = options[i];
            img.src = optionsImg[i];
            if (i === 0) {
              container.classList.add("active");
            }
            container.setAttribute("onclick", "chosenRecipe(this)");
            container.classList.add("container");
            container.appendChild(div);
            container.appendChild(img);
            list.appendChild(container);
          }
        } else {
          list.innerHTML = "";
        }
      });
  } else {
    list.innerHTML = "";
  }
}

// Autocompletion of the clicked filter values
filters.forEach((filter) => {
  filter.addEventListener("click", (event) => {
    filters.forEach((filter) => {
      filter.classList.remove("focus");
    });
    event.target.classList.add("focus");
    const list = event.target.parentElement.querySelector(".list");
    list.style.display = "block";
    let url = "";
    let typeFetch = "";
    if (event.target.innerText === "main ingredient") {
      url = `https://www.themealdb.com/api/json/v1/1/list.php?i=list`;
      typeFetch = "Ingredient";
    } else if (event.target.innerText === "category") {
      url = `https://www.themealdb.com/api/json/v1/1/list.php?c=list`;
      typeFetch = "Category";
    } else if (event.target.innerText === "area") {
      url = `https://www.themealdb.com/api/json/v1/1/list.php?a=list`;
      typeFetch = "Area";
    }
    if (url !== "") {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          let options = [];
          options = data.meals.map((meal) => meal[`str${typeFetch}`]);
          list.innerHTML = "";
          const div = document.createElement("div");
          div.setAttribute("onclick", "chosenFilter(this)");
          div.innerText = "no filter";
          list.appendChild(div);
          for (let option of options) {
            const div = document.createElement("div");
            div.innerText = option;
            div.setAttribute("onclick", "chosenFilter(this)");
            list.appendChild(div);
          }
        });
    }
    // Remove autocompletion of the filters
    document.addEventListener("click", (e) => {
      if (e.target !== list && e.target !== event.target) {
        list.style.display = "none";
        event.target.classList.remove("focus");
      }
    });
  });
});

// Remove autocompletion of the input
document.addEventListener("click", (event) => {
  const input = document.querySelector(".search-input");
  const list = document.querySelector(".search-box .list");
  const listFilters = document.querySelectorAll(".filter .list");
  if (
    event.target !== input &&
    event.target !== list &&
    event.target.parentElement !== listFilters[0] &&
    event.target.parentElement !== listFilters[1] &&
    event.target.parentElement !== listFilters[2]
  ) {
    list.style.display = "none";
  }
});

// Put the chosen recipe in the input
function chosenRecipe(container) {
  const input = document.querySelector(".search-input");
  const recipe = container.querySelector("div").innerText;
  input.value = recipe;
  const list = document.querySelector(".search-box .list");
  list.innerHTML = "";
  list.innerHTML = `<div>${recipe}</div>`;
}

// Places the filter in the button name and changes the API settings.
function chosenFilter(filter) {
  const button = filter.parentElement.parentElement.querySelector("button");
  filterName = filter.innerText;
  document.querySelectorAll(".filter button").forEach((button) => {
    button.innerText = button.innerText.split(":")[0];
  });
  if (filter.innerText !== "no filter") {
    if (button.innerText === "main ingredient") {
      filterType = "i";
    } else if (button.innerText === "category") {
      filterType = "c";
    } else if (button.innerText === "area") {
      filterType = "a";
    }
    button.innerText += ": " + filter.innerText;
    filterOn = true;
    document.querySelector(".search-input").placeholder =
      "Typing does not change the autocompletion when filtering.";
    autoCompletion();
  } else {
    document.querySelector(".search-input").placeholder = "Enter a new recipe";
    filterOn = false;
    filterType = "s";
  }
}

//Magnifier is clicked
research.addEventListener("click", recipeWithName);

// Enter touched, if there are many answer, enter will just set the first result in the input
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const recipe = document.querySelector(".search-input").value;
    fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipe}`
    ).then((response) =>
      response.json().then((data) => {
        if (data.meals.length > 1) {
          const recipeActive =
            document.querySelector(".list .active").innerText;
          const input = document.querySelector(".search-input");
          const list = document.querySelector(".search-box .list");
          list.innerHTML = "";
          input.value = recipeActive;
        } else if (recipe !== "") {
          recipeWithName();
        }
      })
    );
  }
});

// Fetch data with the name of the recipe
function recipeWithName() {
  const recipe = document.querySelector(".search-input").value;
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipe}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setInfo(data);
      const list = document.querySelector(".search-box .list");
      list.style.display = "none";
      const input = document.querySelector(".search-input");
      input.value = "";
    });
}

// Random recipe
document.querySelector(".random-recipe").addEventListener("click", () => {
  const url = "https://www.themealdb.com/api/json/v1/1/random.php";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setInfo(data);
    });
});

// Display information about the recipe
function setInfo(data) {
  let recipeInfo = document.querySelector(".recipe-info-wrapper");
  recipeInfo.innerHTML = "";
  if (data.meals) {
    recipeInfo.innerHTML = `
      <h1>${data.meals[0].strMeal}</h1>
      <div>
        <img src="${data.meals[0].strMealThumb}" alt="${data.meals[0].strMeal}">
        <div class="rightImg">
          <div class="categoryAndArea">
            <div class="category">${data.meals[0].strCategory}
              <span class="tooltiptext">Category</span>
            </div>
            
            <div class="area">${data.meals[0].strArea}
              <span class="tooltiptext">Area</span>
            </div>
          
          </div>
        </div>
      </div>
      
       `;
    let rightImg = document.querySelector(".rightImg");
    let tags = [];
    if (data.meals[0].strTags) {
      tags = data.meals[0].strTags.split(",");
      if (tags.indexOf(data.meals[0].strCategory) !== -1) {
        tags.splice(tags.indexOf(data.meals[0].strCategory), 1);
      }
      rightImg.innerHTML += `<div class="tags"></div>`;

      let tagsHtml = document.querySelector(".tags");

      for (let i = 0; i < tags.length; i++) {
        if (tags[i] !== "") {
          tagsHtml.innerHTML += `<div>${tags[i]}</div>`;
        }
      }
    }
    let ingredients = [];
    let measures = [];
    for (let i = 1; i <= 20; i++) {
      if (
        data.meals[0][`strIngredient${i}`] &&
        data.meals[0][`strIngredient${i}`] !== ""
      ) {
        ingredients.push(data.meals[0][`strIngredient${i}`]);
      }
      if (
        data.meals[0][`strMeasure${i}`] &&
        data.meals[0][`strMeasure${i}`].replace(/\s/g, "") !== ""
      ) {
        measures.push(data.meals[0][`strMeasure${i}`]);
      }
    }
    recipeInfo.innerHTML += "<div class='ingredientsAndMeasures'></div>";
    let ingredientsAndMeasures = document.querySelector(
      ".ingredientsAndMeasures"
    );
    for (let i = 0; i < ingredients.length; i++) {
      ingredientsAndMeasures.innerHTML += `<div class="container">
      <div class="measures">${measures[i]}</div>
      <div class="ingredients">${ingredients[i]}</div>
      </div>`;
    }
    let instructions = [];
    instructions = data.meals[0].strInstructions.split(".");

    let instructionsList = document.querySelector(".instructions");
    instructionsList.innerHTML = "";
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i].replace(/\s/g, "") !== "") {
        instructionsList.innerHTML += `<li>${instructions[i]}.</li>`;
      }
    }
  } else {
    recipeInfo.innerHTML =
      "<div class='not-found'><span>No recipe found.</span></div>";
  }
}
