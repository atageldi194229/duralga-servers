// constants
const transitionDuration = 500;
const textColor = "#61ff2f";

// init body element
const body = document.querySelector(".logger");
body.style.position = "relative";

// create logger element
logger_el = document.createElement("pre");
logger_el.style.backgroundColor = "#343131ce";
logger_el.style.color = textColor;
logger_el.style.height = "100%";
logger_el.style.width = "30%";
logger_el.style.overflowY = "scroll";
logger_el.style.position = "absolute";
logger_el.style.top = "0";
logger_el.style.right = "0";
logger_el.style.padding = "3px";
logger_el.style.zIndex = "10000";
logger_el.style.transitionDuration = transitionDuration / 1000 + "s";

function toggleDisplay(element, display, after_time = 0, cb = () => {}) {
  setTimeout(() => {
    display = display ? "block" : "none";
    element.style.display = display;
    cb();
  }, after_time);
}

function onKeyPress(event) {
  if (event.shiftKey === true && event.key === " ") {
    if (logger_el.style.opacity === "0") {
      toggleDisplay(logger_el, true, 0, () => {
        logger_el.style.opacity = "1";
      });
    } else {
      logger_el.style.opacity = "0";
      toggleDisplay(logger_el, false, transitionDuration);
    }
  }
}

function debug(...args) {
  const hr = document.createElement("hr");
  hr.style.backgroundColor = textColor;
  hr.style.margin = "10px 0px";
  hr.style.border = "none";
  hr.style.height = "2px";

  logger_el.prepend(hr);

  for (let i = args.length - 1; i >= 0; i--) {
    logger_el.prepend(args[i]);
    logger_el.prepend(" ");
  }

  // let text = args.join(' ') + "\n\n";
  // logger_el.prepend(text);
}

function createButton(name, callback) {
  const button = document.createElement("button");
  button.addEventListener("click", callback);
  button.textContent = name;
  button.style.padding = "0px 3px";
  button.style.background = "none";
  button.style.border = "#3ee903 solid 2px";
  button.style.color = "#3ee903";

  return button;
}

if (body) {
  // Append logger element to body
  body.appendChild(logger_el);

  // Add event listener on keypress
  document.addEventListener("keypress", onKeyPress, false);

  window.logger = {
    debug: debug,
    button: createButton,
  };
}
