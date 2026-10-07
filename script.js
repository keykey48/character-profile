"use strict";

const imageInput = document.getElementById("profileImageInput");
const profilePreview = document.getElementById("profilePreview");

let currentImageUrl = null;

if (imageInput && profilePreview) {
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];

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
        profilePreview.src = currentImageUrl;
        profilePreview.alt = `${file.name} 프로필 사진`;
    });

    window.addEventListener("beforeunload", () => {
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
        }
    });
}
