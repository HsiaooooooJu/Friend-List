// axios api
const baseUrl = "https://rickandmortyapi.com/api";
const indexUrl = baseUrl + "/character/";

const characters = [];
const numOfPagesFromAPI = 3
const cardPerPage = 12

const dataPanel = document.querySelector(".data-panel");
const paginator = document.querySelector('#paginator');

// 搜尋功能
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('#search-form')
let filterCharacters = []  // 搜尋結果存進此陣列

// 收藏功能
const favList = JSON.parse(localStorage.getItem('favCharacters')) || []

// 只取前面 60 筆資料
for (let page = 1; page <= numOfPagesFromAPI; page++) {
  axios
    .get(`${indexUrl}?page=${page}`)
    .then(response => {
      characters.push(...response.data.results);
      renderCharacter(getCharactersByPage(1))
      renderPaginator(characters.length)
    })
    .catch(function (error) {
      console.log(error);
    });
}

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
            <i class="far fa-heart fa-lg" data-id="${characters.id}"></i>
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
  const favBtns = document.querySelectorAll(".fa-heart")
  setFavBtn(favBtns)
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

// 讀取已在最愛清單內的人物，原預設的愛心為空心 變更為實心
function setFavBtn(btn) {
  const favListIds = favList.map(item => item.id) // 回傳陣列： favList 裡的物件的 id
  btn.forEach(heartBtn => {
    if (favListIds.includes(Number(heartBtn.dataset.id))) {  // 如果 favListIds 陣列裡有 剛剛加進 favList 的物件的 id
      heartBtn.classList.add("fas")
    }
  })
}

// EventListener
// show modal
dataPanel.addEventListener("click", function clickDataPanel(event) {
  if (event.target.matches(".btn-about")) {
    showCharacterModal(Number(event.target.dataset.id));
  }
});

// toggle favorite character
dataPanel.addEventListener("click", function toggleFav(event) {
  if (event.target.matches(".fa-heart")) {
    // 存取 點擊到的人物的 heart icon 的 id
    const id = Number(event.target.dataset.id)
    // 點擊到的 id 對應到 characters 總表的 id，把總表的 人物資料 存起來
    const character = characters.find((character) => character.id === id)
    // 該人物的 heart icon toggle
    event.target.classList.toggle("fas");

    // 檢查 favList 裡是否已經有這個角色 (在 favList 裡找它的 id 後記下它的位置)
    const characterIndex = favList.findIndex((character) => character.id === id)

    // 如果在 favList 裡 找不到 (回傳值 -1)，就把角色加進 favList
    // 如果在 favList 裡 有找到 (回傳值 index 數字)，就把角色從 favList 移除
    characterIndex === -1 ? favList.push(character) : favList.splice(characterIndex, 1)

    // 將結果存進 localStorage
    localStorage.setItem('favCharacters', JSON.stringify(favList))
  }
})

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

paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderCharacter(getCharactersByPage(page))
})

/*
// // 新增到 favorite 頁面
// function addToFav(id) {
//   const character = characters.find((character) => character.id === id)
//   if (favList.some((character) => character.id === id)) return
//   else {
//     favList.push(character)
//     localStorage.setItem('favCharacters', JSON.stringify(favList))
//   }
// }
// // 從 favorite 移除
// function removeFromFav(id) {
//   const characterIndex = characters.findIndex((character) => character.id === id)
//   favList.splice(characterIndex, 1)
//   localStorage.setItem('favCharacters', JSON.stringify(characters))
//   renderCharacter(getCharactersByPage(1))
// }
*/