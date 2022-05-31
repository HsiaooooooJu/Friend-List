// axios api
const baseUrl = "https://rickandmortyapi.com/api";
const indexUrl = baseUrl + "/character/";

const characters = JSON.parse(localStorage.getItem('favCharacters')) || []
const numOfPagesFromAPI = 3
const cardPerPage = 12

const dataPanel = document.querySelector(".data-panel");
const paginator = document.querySelector('#paginator');

// 搜尋功能
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('#search-form')
let filterCharacters = []  // 搜尋結果存進此陣列


// function
// 名字太長的話，後面以...顯示
function trimLongName(name) {
  let longName = name.slice(0, 15); // 顯示前個字母
  if (name.length > 15) {
    longName += "...";
  }
  return longName;
}

// 渲染所有角色
function renderCharacter(data) {
  let rawHTML = "";
  data.forEach((characters) => {
    rawHTML += `
      <div class="col-auto m-2" style="width: 14rem;">
        <div class="card">
          <img src="${characters.image}" class="card-img-top" alt="...">
          <div class="card-img-overlay text-end">
            <i class="fas fa-heart fa-lg" data-id="${characters.id}"></i>
          </div>
          <div class="card-body">
            <h5 class="card-title">${trimLongName(characters.name)}</h5>
            <button type="button" class="btn btn-about" data-bs-toggle="modal" data-bs-target="#character-modal" data-id="${characters.id}">
              About
            </button>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// 跳出視窗 顯示更多資料
function showCharacterModal(id) {
  const modalTitle = document.querySelector("#character-name");
  const modalSpecies = document.querySelector("#character-species");
  const modalStatus = document.querySelector("#character-status");
  const modalGender = document.querySelector("#character-gender");

  axios.get(indexUrl + id).then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name;
    modalGender.innerText = `Gender : ${data.gender}`;
    modalSpecies.innerText = "Species : " + data.species;
    modalStatus.innerText = "Status : " + data.status;
  });
}

// 製作分頁，讓每頁只有 cardPerPage 的數量
function getCharactersByPage(page) {
  const startIndex = (page - 1) * cardPerPage
  const data = filterCharacters.length ? filterCharacters : characters
  return data.slice(startIndex, startIndex + cardPerPage)
}

// 渲染分頁器
function renderPaginator(amount) {
  const numOfPages = Math.ceil(amount / cardPerPage)
  let rawHTML = ''

  for (let page = 1; page <= numOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 從 favorite 移除
function removeFromFav(id) {
  const characterIndex = characters.findIndex((character) => character.id === id)
  characters.splice(characterIndex, 1)

  // 在 favorite 搜尋後，想移除當前頁面的 character
  const filterCharactersIndex = filterCharacters.findIndex((character) => character.id === id)
  filterCharacters.splice(filterCharactersIndex, 1)

  localStorage.setItem('favCharacters', JSON.stringify(characters))
  renderCharacter(getCharactersByPage(1))
  renderPaginator(characters.length)
}

// EventListener
// show modal, remove from favorite
dataPanel.addEventListener("click", function clickDataPanel(event) {
  if (event.target.matches(".btn-about")) {
    showCharacterModal(event.target.dataset.id);
  }
  if (event.target.matches(".fas.fa-heart")) {
    removeFromFav(Number(event.target.dataset.id))
  }
});

// 搜尋功能
searchForm.addEventListener('submit', function onSearchSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterCharacters = characters.filter((character) => character.name.toLowerCase().includes(keyword))
  if (filterCharacters.length === 0) {
    return swal(`Search ${keyword} not found.`)
  }
  renderCharacter(getCharactersByPage(1))
  renderPaginator(filterCharacters.length)
})

// 點擊的頁數對應該頁數內容
paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderCharacter(getCharactersByPage(page))
})

renderCharacter(getCharactersByPage(1))
renderPaginator(characters.length)