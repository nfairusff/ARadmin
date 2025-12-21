let idmakanan;
function tombolBuatMarker(p){
    const sebaris = p.parentElement.parentElement
    const inputData = sebaris.getElementsByClassName("databaris")
    for (let i = 0; i < inputData.length; i++){
        const dataLalu = inputData[i].textContent;
        if (i===0){
            idmakanan = dataLalu;
        }
}
const container = document.getElementById("qrCanvas");
container.innerHTML = "";

generateImageQR(idmakanan, '2.png', 1, 93);

 // Show modal
 document.getElementById("qrModal").style.display = "block";
}

// Close modal
function closeModal() {
    document.getElementById("qrModal").style.display = "none";
  }
  
  // Close modal if user clicks outside the modal content
  window.onclick = function(event) {
    const modal = document.getElementById("qrModal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  function generateImageQR(data, borderImgSrc, borderScale = 0.8, margin = 10) {
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    // Create QR first
    const qr = QRCode.create(data, { errorCorrectionLevel: 'H' });
    const modules = qr.modules;
    const moduleCount = modules.size;

    // We'll draw QR centered before loading the image
    const qrSize = canvas.width * borderScale - 2 * margin;
    const moduleSize = qrSize / moduleCount;
    const qrOffset = (canvas.width - qrSize) / 2;

    // Draw QR code (background layer)
    for (let y = 0; y < moduleCount; y++) {
        for (let x = 0; x < moduleCount; x++) {
            ctx.fillStyle = modules.get(x, y) ? '#000' : '#fff';
            ctx.fillRect(
                qrOffset + x * moduleSize,
                qrOffset + y * moduleSize,
                moduleSize,
                moduleSize
            );
        }
    }

    // Load image on top
    const img = new Image();
    img.src = borderImgSrc;

    img.onload = () => {
        const imgSize = canvas.width * borderScale;
        const borderX = (canvas.width - imgSize) / 2;
        const borderY = (canvas.height - imgSize) / 2;

        ctx.globalAlpha = 0.5;
        // Draw image LAST (top layer)
        ctx.drawImage(img, borderX, borderY, imgSize, imgSize);

        ctx.globalAlpha = 1;
    };

    img.onerror = () => console.warn('Image not found:', borderImgSrc);
}
