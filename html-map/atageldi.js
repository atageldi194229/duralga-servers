// document.querySelector('#one-bus-star').addEventListener('click', () => {
//     document.querySelector('.bx-star').classList.toggle('bxs-star');
// });
// document.querySelector('#belle').addEventListener('click', () => {
//     document.querySelector('.bx-star').classList.toggle('bxs-star');
// });

const close_btns = document.querySelectorAll(".close_btn");
const open_sidebar = document.querySelector(".open_sidebar");
const buses_list = document.querySelectorAll(".buses_list");
const back_button = document.querySelector(".back_btn");

function handleCloseButton() {
  document.querySelector(".right_side_bar").style.right = "-31rem";
  document.querySelector(".open_sidebar").style.left = "-3rem";
  document.querySelector(".open_sidebar").classList.remove("diactivated");
}

function handleOpenSidebar() {
  document.querySelector(".right_side_bar").style.right = "0";
  document.querySelector(".open_sidebar").style.left = "1rem";
  document.querySelector(".open_sidebar").classList.add("diactivated");
}

function handleBusClick() {
  document.querySelector(".bus_list_container").style.marginLeft = "35rem";
  document.querySelector(".busstops_container").style.top = "0";
}

function handleBackButtonClick() {
  document.querySelector(".bus_list_container").style.marginLeft = "0";
  document.querySelector(".busstops_container").style.top = "100%";
}

document.body.addEventListener("click", function (event) {
  const runIfIn = (f, ...elements) => {
    elements.forEach((el) => {
      if (el.contains(event.target)) f(el);
    });
  };

  runIfIn(handleCloseButton, ...close_btns);
  runIfIn(handleOpenSidebar, open_sidebar);
  runIfIn(handleBusClick, ...buses_list);
  runIfIn(handleBackButtonClick, back_button);
});
