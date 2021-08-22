let search_input = document.getElementsByClassName("input-search");
let search_bar = document.getElementById("search_bar");

let input = search_input[0];
input.addEventListener('focus', (event) => {
    alert('focus');
}, true);