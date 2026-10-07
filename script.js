"use strict";

const PROFILE_STORAGE_KEY = "characterProfileData";
const COLOR_STORAGE_KEY = "characterProfileColors";

const root = document.documentElement;
const editableItems = [...document.querySelectorAll("[data-editable]")];

const editButton = document.getElementById("editButton");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const colorInputs = [...document.querySelectorAll("[data-color]")];
const imageInput = document.getElementById("profileImageInput");
const imagePreview = document.getElementById("profilePreview");
const exportButton = document.getElementById("exportButton");

const defaultColors = {
    main: "#8172c5",
    sub: "#efecfa",
    background: "#f7f6fa",
    text: "#34313e"
};

let originalText = [];
let currentImageUrl = null;

function setEditing(enabled) {
    document.body.classList.toggle("editing", enabled);

    editableItems.forEach((item) => {
        item.contentEditable = String(enabled);
        item.setAttribute("role", "textbox");
        item.setAttribute("aria-label", "프로필 내용");
    });

    editButton.hidden = enabled;
    saveButton.hidden = !enabled;
    cancelButton.hidden = !enabled;
}

function saveProfile() {
    const profileText = editableItems.map((item) => item.innerText);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileText));
}

function loadProfile() {
    try {
        const savedText = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY));

        if (Array.isArray(savedText) && savedText.length === editableItems.length) {
            editableItems.forEach((item, index) => {
                item.textContent = savedText[index];
            });
        }
    } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
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
        const savedColors = JSON.parse(localStorage.getItem(COLOR_STORAGE_KEY));
        applyColors({ ...defaultColors, ...savedColors });
    } catch {
        applyColors(defaultColors);
    }
}

editButton.addEventListener("click", () => {
    originalText = editableItems.map((item) => item.innerText);
    setEditing(true);
});

saveButton.addEventListener("click", () => {
    saveProfile();
    setEditing(false);
});

cancelButton.addEventListener("click", () => {
    editableItems.forEach((item, index) => {
        item.textContent = originalText[index];
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
        localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(colors));
    });
});

document.getElementById("resetColors").addEventListener("click", () => {
    applyColors(defaultColors);
    localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(defaultColors));
});

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("이미지 파일을 선택해 주세요.");
        imageInput.value = "";
        return;
    }

    if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
    }

    currentImageUrl = URL.createObjectURL(file);
    imagePreview.src = currentImageUrl;
    imagePreview.alt = `${file.name} 프로필 사진`;
});

exportButton.addEventListener("click", async () => {
    if (typeof window.html2canvas !== "function") {
        alert("PNG 저장 기능을 불러오지 못했어요. 인터넷 연결을 확인하고 페이지를 새로고침해 주세요.");
        return;
    }

    const profileCard = document.querySelector(".profile-card");

    document.body.classList.add("exporting");
    exportButton.disabled = true;
    exportButton.textContent = "PNG 만드는 중…";

    try {
        const canvas = await window.html2canvas(profileCard, {
            backgroundColor: getComputedStyle(profileCard).backgroundColor,
            scale: 2,
            useCORS: true
        });

        const downloadLink = document.createElement("a");
        downloadLink.download = "character-profile.png";
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();
    } catch (error) {
        console.error("PNG 저장 오류:", error);
        alert("PNG 저장 중 문제가 생겼어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
    } finally {
        document.body.classList.remove("exporting");
        exportButton.disabled = false;
        exportButton.textContent = "프로필을 PNG로 저장";
    }
});

loadProfile();
loadColors();
setEditing(false);

window.addEventListener("beforeunload", () => {
    if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
    }
});
