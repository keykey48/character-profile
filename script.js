"use strict";

const STORAGE_KEY = "characterProfileData";
const COLOR_KEY = "characterProfileColors";
const root = document.documentElement;
const editableItems = [...document.querySelectorAll("[data-editable]")];

const editButton = document.getElementById("editButton");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const colorInputs = [...document.querySelectorAll("[data-color]")];
const imageInput = document.getElementById("profileImageInput");
const imagePreview = document.getElementById("profilePreview");

const defaultColors = {
    main: "#8172c5",
    sub: "#efecfa",
    background: "#f7f6fa",
    text: "#34313e"
};

let savedTextSnapshot = [];
let currentImageUrl = null;

function setEditing(enabled) {
    document.body.classList.toggle("editing", enabled);

    editableItems.forEach((item) => {
        item.contentEditable = String(enabled);
        item.setAttribute("aria-label", enabled ? "수정할 프로필 내용" : "");
    });

    editButton.hidden = enabled;
    saveButton.hidden = !enabled;
    cancelButton.hidden = !enabled;
}

function saveProfile() {
    const content = editableItems.map((item) => item.innerHTML);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

function loadProfile() {
    try {
        const content = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(content) && content.length === editableItems.length) {
            editableItems.forEach((item, index) => {
                item.innerHTML = content[index];
            });
        }
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function applyColors(colors) {
    root.style.setProperty("--main-color", colors.main);
    root.style.setProperty("--sub-color", colors.sub);
    root.style.setProperty("--background-color", colors.background);
    root.style.setProperty("--text-color", colors.text);

    colorInputs.forEach((input) => {
        input.value = colors[input.dataset.color] || defaultColors[input.dataset.color];
    });
}

function loadColors() {
    try {
        const colors = JSON.parse(localStorage.getItem(COLOR_KEY));
        applyColors({ ...defaultColors, ...colors });
    } catch {
        applyColors(defaultColors);
    }
}

editButton.addEventListener("click", () => {
    savedTextSnapshot = editableItems.map((item) => item.innerHTML);
    setEditing(true);
});

saveButton.addEventListener("click", () => {
    saveProfile();
    setEditing(false);
});

cancelButton.addEventListener("click", () => {
    editableItems.forEach((item, index) => {
        item.innerHTML = savedTextSnapshot[index];
    });
    setEditing(false);
});

colorInputs.forEach((input) => {
    input.addEventListener("input", () => {
        const colors = {};
        colorInputs.forEach((colorInput) => {
            colors[colorInput.dataset.color] = colorInput.value;
        });
        applyColors(colors);
        localStorage.setItem(COLOR_KEY, JSON.stringify(colors));
    });
});

document.getElementById("resetColors").addEventListener("click", () => {
    applyColors(defaultColors);
    localStorage.setItem(COLOR_KEY, JSON.stringify(defaultColors));
});

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("이미지 파일을 선택해 주세요.");
        imageInput.value = "";
        return;
    }

    if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = URL.createObjectURL(file);
    imagePreview.src = currentImageUrl;
});

loadProfile();
loadColors();
setEditing(false);
