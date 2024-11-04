const countryName = document.querySelector('.country-selector-container .country-name')
const countryCode = document.querySelector('.country-selector-container #country-code')
const countrySearchblock = document.querySelector('.country-selector-container #country-search-bar')
const countrySearchBar = countrySearchblock.firstElementChild
const countryDropdownMenu = document.querySelector('.country-selector-container .dropdown-menu')
const countries = [...document.querySelectorAll('.country-selector-container .dropdown-item')]

countrySearchBar.addEventListener('keydown', function onCountrySearchBarKeydown (event) {
  if (event.keyCode === 13) {
    // press enter
    event.preventDefault()
    event.stopPropagation()
  }
})

countryDropdownMenu.addEventListener('click', function onCountryDropdownMenuClicked (event) {
  if (event.target.className === 'dropdown-item') {
    countryName.textContent = event.target.textContent
    countryCode.value = event.target.dataset.countryCode
  }
})

countrySearchBar.addEventListener('input', function onCountrySearchBarInput (event) {
  const filteredCountries = countries.filter(country => country.textContent.toLowerCase().includes(countrySearchBar.value.toLowerCase().trim()))
  const nodeContainer = document.createElement('div')
  filteredCountries.forEach(country => {
    nodeContainer.appendChild(country)
  })
  const replaceNode = countrySearchblock.nextElementSibling
  countryDropdownMenu.replaceChild(nodeContainer, replaceNode)
})
