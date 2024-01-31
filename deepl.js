document.addEventListener("DOMContentLoaded", async function () {
  // Получение языка из куки (если куки lang существует)
  let currentLanguage = getCookie("lang") || "en";
  let languageMenu = document.querySelector(".user-menu__language-menu");
  let preloader = document.getElementById("preloader");

  // Получение тега script с атрибутом data-page-name
  let scriptTag = document.getElementById("deepl");
  let jsonString = scriptTag.getAttribute("data-page-name");
  let jsonParse = JSON.parse(jsonString);
  let pageName = jsonParse[0];

  // Получение переводов из базы данных
  let response = await fetch("../include/translator.php", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonParse),
  });

  // Получение тега script с атрибутом data-page-name
  let scriptTag = document.getElementById("deepl");
  let jsonString = scriptTag.getAttribute("data-page-name");
  let pageName = JSON.parse(jsonString);
  pageName.push("header_footer");

  async function fetchTranslations(pageName) {
    let translations = [];

    for (let page of pageName) {
      try {
        // Загрузка JSON-файла с переводами для каждой страницы
        let response = await fetch(`../translations/lark_lang_${page}.json`);

        // Проверяем, что ответ был успешным
        if (!response.ok) {
          console.error(`An error occurred: ${response.statusText}`);
          continue;
        }

        let data = await response.json();
        translations = translations.concat(data);
      } catch (error) {
        console.error(`Failed to fetch translation for page ${page}: ${error}`);
        // Просто продолжаем, если файл не был найден
      }
    }

    return translations;
  }

  let deepl = await fetchTranslations(pageName);
  console.log(deepl);
  let url = new URL(window.location.href);
  jsTraslator(url.searchParams.get("lang") ?? currentLanguage);

  // Переключатель языка
  if (languageMenu) {
    document
      .querySelector(".user-menu__language-menu")
      .addEventListener("click", (event) => {
        // Исключение если событие нажатия было не элементом списка
        if (!event.target.matches("li")) return;

        // Получение имени языка
        let targetLanguage = event.target.innerText.toLowerCase();
        let currentLanguage = getCookie("lang") || "en";

        // Исключение когда был выбран тот же язык, что и установленный
        if (currentLanguage === targetLanguage) return;

        // Перевод на выбранный язык
        jsTraslator(targetLanguage, currentLanguage);

        // Установка языка в куки
        setCookie("lang", targetLanguage);
      });
  }

  // Функция для перевода в цикле всех элементов с классом deepl
  function jsTraslator(targetLanguage, currentLanguage = "en") {
    // Исключение если был выбран тот же язык, что и установленный
    if (currentLanguage === targetLanguage) {
      hideLoader();
      return;
    } else {
      showLoader();
    }

    // Обработка элементов с классом .deepl
    let $deepl = document.querySelectorAll(".deepl");
    for (let i = 0; i < $deepl.length; i++) {
      Object.values(deepl).forEach((translation) => {
        if (
          removeSpecialChars($deepl[i].innerText.toLowerCase()) ===
          removeSpecialChars(translation[currentLanguage].toLowerCase())
        ) {
          $deepl[i].innerHTML = translation[targetLanguage];
        }
      });
    }

    // Обработка элементов с атрибутом placeholder
    let $placeholders = document.querySelectorAll("[placeholder]");
    for (let i = 0; i < $placeholders.length; i++) {
      Object.values(deepl).forEach((translation) => {
        if (
          removeSpecialChars(
            $placeholders[i].getAttribute("placeholder").toLowerCase()
          ) === removeSpecialChars(translation[currentLanguage].toLowerCase())
        ) {
          $placeholders[i].setAttribute(
            "placeholder",
            translation[targetLanguage]
          );
        }
      });
    }

    hideLoader();
  }

  // Получение значения cookie с заданным именем
  function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    return parts.length === 2 ? parts.pop().split(";").shift() : null;
  }

  // Получение значения cookie с заданным именем
  function setCookie(name, value) {
    document.cookie =
      `${name}=${value}; expires=` +
      new Date(Date.now() + 3600 * 1000).toUTCString() +
      "; path=/";
  }

  // Функция для отображения загрузчика
  function showLoader() {
    if (!preloader) return;
    preloader.style.display = "flex";
  }

  // Функция для скрытия загрузчика
  function hideLoader() {
    if (!preloader) return;
    preloader.style.display = "none";
  }

  async function phpTraslator(pageName) {
    let svg =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" stroke="#ccc" stroke-width="4"></circle><path d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z" /></svg>';

    // Добавление стилей в тег <head> документа
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "../css/deepl.css";
    document.head.appendChild(link);

    // Проверка на существование базы данных
    let response = await fetch("../include/exist.php", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pageName[0]),
    });
    let exist = await response.json();

    // Родительский блок
    let setting = document.createElement("div");
    setting.id = "deepl-setting";

    // Кнопка Deepl
    let button = document.createElement("button");
    button.classList.add("button");
    button.insertAdjacentHTML("beforeend", `${svg}\n<span>DeepL</span>`);
    button.addEventListener("click", () => {
      button.firstChild.style.display = "block";

      let $deepl =
        pageName[0] != select.value
          ? document.querySelectorAll(`.${select.value}.no-deepl .deepl`)
          : document.querySelectorAll(".deepl:not(.no-deepl .deepl)");
      let $placeholders =
        pageName[0] != select.value
          ? document.querySelectorAll(
              `.${select.value} [placeholder].no-deepl .deepl`
            )
          : document.querySelectorAll(
              "[placeholder]:not(.no-deepl [placeholder])"
            );

      //let dbdrope = ()
      let dbpageName = pageName[0] != select.value ? select.value : pageName[0];
      let dbcontentArray = [];

      // Добавление значений из элементов с классом .deepl в dbcontentArray
      for (let x = 0; x < $deepl.length; x++) {
        dbcontentArray[x] = $deepl[x].innerText;
      }

      // Добавление значений из атрибутов placeholder в dbcontentArray
      for (let y = 0; y < $placeholders.length; y++) {
        dbcontentArray.push($placeholders[y].getAttribute("placeholder"));
      }

      let data = {
        pageName: dbpageName,
        contentArray: dbcontentArray,
      };

      fetch("../include/deepl.php", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(() => {
        fetch("../include/update.php", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then(() => {
          window.location.reload();
        });
      });
    });

    let page = document.createElement("div");
    page.classList.add("page");
    let tableName = document.querySelector("span");
    tableName.innerText = `Table: `;
    let select = document.createElement("select");

    for (let i = 0; i < pageName.length; i++) {
      let option = document.createElement("option");
      option.value = pageName[i];
      option.text = `lark_lang_${pageName[i]}`;
      select.appendChild(option);
    }
    page.appendChild(tableName);
    page.appendChild(select);
    setting.appendChild(page);

    let input = document.createElement("input");
    input.classList.add("table");
    page.appendChild(input);

    async function tableExist(exist, pageName) {
      if (!exist) {
        if (document.querySelector(".truncate-table"))
          document.querySelector(".truncate-table").remove();

        if (pageName != select.value) {
          tableName.innerText = "Table: ";
          input.style.display = "block";
          input.value = pageName != null ? `lark_lang_${pageName}` : null;
        }

        if (!document.querySelector(".create-table")) {
          let createTable = document.createElement("button");
          createTable.classList.add("button", "create-table");

          createTable.insertAdjacentHTML("afterbegin", svg);
          createTable.insertAdjacentHTML(
            "beforeend",
            `<span>Create table</span>`
          );
          setting.appendChild(createTable);

          createTable.addEventListener("click", async () => {
            createTable.firstChild.style.display = "block";
            await fetch("../include/create.php", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(pageName),
            });
            setTimeout(() => window.location.reload(), 500);
          });
        }
      } else {
        if (document.querySelector(".create-table"))
          document.querySelector(".create-table").remove();

        if (!document.querySelector(".truncate-table")) {
          let truncateTable = document.createElement("button");
          truncateTable.classList.add("button", "truncate-table");
          truncateTable.setAttribute("disabled", "true");

          truncateTable.insertAdjacentHTML("afterbegin", svg);
          truncateTable.insertAdjacentHTML(
            "beforeend",
            `<span>Clear table</span>`
          );
          setting.appendChild(truncateTable);

          truncateTable.addEventListener("click", () => {
            truncateTable.firstChild.style.display = "block";
            fetch("../include/truncate.php", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(select.value),
            })
              .then((response) => response.json())
              .then((result) => {
                setTimeout(() => {
                  truncateTable.firstChild.style.display = "none";
                  let p = document.createElement("p");
                  if (result.message) {
                    p.innerHTML = `<b>⚠️ WARNING: </b>${result.message}`;
                  } else {
                    p.innerHTML = `<b>✅ OK: </b>${result.message}`;
                  }
                  log.appendChild(p);
                }, 500);
              });
          });
        }
      }
    }

    let total = document.createElement("span");
    total.classList.add("total");
    let deeplLength = document.querySelectorAll(
      ".deepl:not(.no-deepl .deepl)"
    ).length;
    let placeholderLength = document.querySelectorAll(
      "[placeholder]:not(.no-deepl [placeholder])"
    ).length;
    total.innerText = `Total classes: [${deeplLength + placeholderLength}]`;

    let log = document.createElement("div");
    log.classList.add("log");

    let missingElements = getMissingElements();
    let missing = document.createElement("span");
    missing.classList.add("missing");
    missing.innerText = `Missing: [${missingElements.length}]`;

    setting.appendChild(total);
    setting.appendChild(missing);
    setting.appendChild(button);
    setting.appendChild(log);
    document.body.appendChild(setting);

    document.addEventListener("click", async (e) => {
      let targetElement = e.target.closest("*");
      if (targetElement) {
        if (pageName[0] != select.value) {
          let deeplLength = document.querySelectorAll(
            `.${select.value}.no-deepl .deepl`
          ).length;
          let placeholderLength = document.querySelectorAll(
            `.${select.value} [placeholder].no-deepl .deepl`
          ).length;
          total.innerText = `Total classes: [${
            deeplLength + placeholderLength
          }]`;

          let missingElements = getMissingElements();
          missing.innerText = `Missing: [${missingElements.length}]`;

          let response = await fetch("../include/exist.php", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(select.value),
          });
          let exist = await response.json();
          tableExist(exist, select.value);
        } else {
          let deeplLength = document.querySelectorAll(
            ".deepl:not(.no-deepl .deepl)"
          ).length;
          let placeholderLength = document.querySelectorAll(
            "[placeholder]:not(.no-deepl [placeholder])"
          ).length;
          total.innerText = `Total classes: [${
            deeplLength + placeholderLength
          }]`;
        }
      }
    });

    function getMissingElements() {
      let $deepl = document.querySelectorAll(".deepl:not(.no-deepl .deepl)");
      let $placeholders = document.querySelectorAll(
        "[placeholder]:not(.no-deepl [placeholder])"
      );

      let isElementMissing = (element, type) => {
        let elementText;
        if (type === "deepl") {
          elementText = element.innerText;
        } else if (type === "placeholder") {
          elementText = element.getAttribute("placeholder");
        }

        if (!elementText.trim()) {
          return false;
        }

        return !deepl.some((translation) => {
          return Object.values(translation).some(
            (value) =>
              removeSpecialChars(value.toLowerCase()) ===
              removeSpecialChars(elementText.toLowerCase())
          );
        });
      };

      let missingDeeplElements = Array.from($deepl).filter((element) =>
        isElementMissing(element, "deepl")
      );
      let missingPlaceholderElements = Array.from($placeholders).filter(
        (element) => isElementMissing(element, "placeholder")
      );

      let missingElements = missingDeeplElements.concat(
        missingPlaceholderElements
      );

      if (missingElements.length != 0) {
        missingElements.forEach((element, index) => {
          let p = document.createElement("p");
          let a = document.createElement("a");
          element.id = `log-${index}`;

          // Определение типа элемента (deepl или placeholder)
          let elementType = element.classList.contains("deepl")
            ? "deepl"
            : "placeholder";

          // Добавление содержимого в элемент <p> в зависимости от типа элемента
          if (elementType === "deepl") {
            p.insertAdjacentHTML(
              "beforeend",
              `<b>${index}. </b>${element.innerHTML}`
            );
          } else if (elementType === "placeholder") {
            p.insertAdjacentHTML(
              "beforeend",
              `<b>${index}. </b>placeholder: ${element.getAttribute(
                "placeholder"
              )}`
            );
          }

          a.href = `#log-${index}`;
          a.appendChild(p);
          log.appendChild(a);
        });
      } else {
        log.style.display = "none";
      }

      return missingElements;
    }

    tableExist(exist, pageName);
    setTimeout(() => (setting.style.transform = "translateY(0)"), 100);
  }

  function removeSpecialChars(str) {
    var temp = document.createElement("div");
    temp.innerHTML = str;
    return temp.innerText
      .replace(/[\n\r\t\f\v ]+/g, "") // удаляем пробелы и управляющие символы
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // удаляем знаки препинания и спецсимволы
      .replace(/[“”‘’«»""'']/g, ""); // удаляем кавычки разного вида
  }

  // Вызов тулбара с настройками
  document.addEventListener("keydown", async function (event) {
    let setting = document.getElementById("deepl-setting");

    if (event.shiftKey && event.code === "KeyD") {
      if (setting) {
        setting.style.transform = "translateY(125%)";
        setTimeout(() => setting.remove(), 200);
        setCookie("deepl-setting", "off");
      } else {
        await phpTraslator(pageName);
        setting = document.getElementById("deepl-setting");
        setCookie("deepl-setting", "on");
      }
    }
  });

  if (getCookie("deepl-setting") == "on") {
    await phpTraslator(pageName);
  }
});
