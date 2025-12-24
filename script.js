const input = document.getElementById('CariData');

input.addEventListener('input', () => {
    searchJSONToTable('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', 'dataMakanan');
});

window.addEventListener('DOMContentLoaded', () => {
    loadJSONToTable('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', 'dataMakanan');
});

function loadatapublik(){
    const table = document.getElementById('dataMakanan');
    const headers = table.querySelectorAll('th');
    const search = document.getElementById('CariData').value;
    headers.forEach((header) => {
        header.innerText = header.innerText.replace(/\s[▲▼]$/, '');});

    if (search!=""){
        searchJSONToTable('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', 'dataMakanan');
    }
    else{
    loadJSONToTable('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', 'dataMakanan');
    }
}

// --------------------- Helper to create table row ---------------------
function createTableRow(item) {
    const now = Date.now();
    const exp = new Date(item.tanggal_kedaluwarsa).getTime();
    let isExpired = false;
    const diffInMs = exp - now;
    let labelexp;

    // Calculations
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365);

    // Furthest Time Logic
    if (years >= 1) {
        labelexp = years === 1 ? "1 tahun tersisa" : years + " tahun tersisa";
    } else if (months >= 1) {
        labelexp = months === 1 ? "1 bulan tersisa" : months + " bulan tersisa";
    } else if (weeks >= 1) {
        labelexp = weeks === 1 ? "1 minggu tersisa" : weeks + " minggu tersisa";
    } else if (days >= 1) {
        labelexp = days === 1 ? "1 hari tersisa" : days + " hari tersisa";
    } else {
        isExpired = true;
        labelexp = "Kedaluwarsa segera";
    }
   

    const tr = document.createElement('tr');
    tr.classList.add("barisMakanan");

    tr.innerHTML = `
        <td class="databaris" id="nama_makanan">${item.nama_makanan}</td>
        <td class="databaris" id="tanggal_kedaluwarsa">${item.tanggal_kedaluwarsa}</td>
        <td style="text-align: center;">
            <button onclick="tombolHapusData(this)">Hapus</button>
            <button onclick="tombolOpsiUbahData(this)">Ubah</button>
            <button onclick="tombolBuatMarker(this)">Marker</button>
            <button onclick="tombolKirimUbah(this)" class="opsiUbah" style="display: none;">Simpan</button>
            <button onclick="tombolBatalUbah(this)" class="opsiUbah" style="display: none;">Batal</button>
            <span class="wrapper" style="display: none;position: relative;"><div class="loader"></div></span>
        </td>
                <td class="databaris" id="status" style="background:${isExpired ? 'red' : 'greenyellow'}">
            ${labelexp}
        </td>
    `;
    return tr;
}

// --------------------- Toggle row visibility ---------------------
function tombolMuncul(tombol, id) {
    const target = document.getElementById(id);

    // Save original text once
    if (!tombol.dataset.originalText) {
        tombol.dataset.originalText = tombol.innerText;
    }

    if (target.style.display === "none" || target.style.display === "") {
        target.style.display = "table-row";
        tombol.innerText = "Sembunyikan " + tombol.dataset.originalText;
    } else {
        target.style.display = "none";
        tombol.innerText = tombol.dataset.originalText;
    }
}


// --------------------- Save data ---------------------
async function tombolSimpanData(p) {
    const tombolsebaris = p.parentElement.getElementsByTagName("button");
    const formMakanan = document.getElementById("formMakanan");
    const inputMakanan = formMakanan.getElementsByTagName("input");
    const wrapper = p.parentElement.querySelector(".wrapper");

    let data = { "perm": "masuk" };
    for (let input of inputMakanan) {
        if (!input.value) {
            createModal(`Data ${input.id} belum lengkap`);
            return;
        }
        data[input.id] = input.value;
    }

    for (let btn of tombolsebaris) btn.style.display = "none";
    wrapper.style.display = "inline-block";

    try {
        const response = await fetch('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        createModal(result.data.pesan === "berhasil" ? "Data berhasil disimpan" : "Data gagal disimpan");
        tombolUlangData();
        loadJSONToTable('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', 'dataMakanan');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        wrapper.style.display = "none";
        for (let btn of tombolsebaris) btn.style.display = "inline-block";
    }
}

// --------------------- Reset form ---------------------
function tombolUlangData() {
    const inputMakanan = document.getElementById("formMakanan").getElementsByTagName("input");
    for (let input of inputMakanan) input.value = "";
}

// --------------------- Modal ---------------------
let modalCount = 0;

function createModal(teks) {
    const template = document.getElementById('modalTemplate');
    const container = document.getElementById('modalContainer');
    modalCount++;

    const clone = template.content.cloneNode(true);
    const modal = clone.querySelector('.small-modal');

    modal.style.top = `${30 + modalCount * 10}px`;
    modal.querySelector('p').textContent = teks;

    modal.querySelector('.close').addEventListener('click', () => {
        container.removeChild(modal);
        modalCount--;
    });

    setTimeout(() => {
        if (container.contains(modal)) {
            container.removeChild(modal);
            modalCount--;
        }
    }, 5000);

    container.appendChild(modal);
}

// --------------------- Load JSON ---------------------
async function loadJSONToTable(url, tableid) {
    const wrapper = document.querySelector("#wrapper");
    wrapper.style.display = "block";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();

        const tbody = document.querySelector(`#${tableid} tbody`);
        const fragment = document.createDocumentFragment();
        const barisMakanan = tbody.getElementsByClassName("barisMakanan");

        while (barisMakanan.length > 0) barisMakanan[0].remove();

        for (const item of data.data) {
            fragment.appendChild(createTableRow(item));
        }

        tbody.appendChild(fragment);
    } catch (err) {
        console.error(err);
    } finally {
        wrapper.style.display = "none";
    }
}

// --------------------- Search JSON ---------------------
async function searchJSONToTable(url, tableid) {
    const wrapper = document.querySelector("#wrapper");
    wrapper.style.display = "block";
    const cariData = document.getElementById("CariData").value;

    if (!cariData) {
        loadJSONToTable(url, tableid);
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ nama_makanan: cariData, perm: "cari" })
        });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();

        const tbody = document.querySelector(`#${tableid} tbody`);
        const fragment = document.createDocumentFragment();
        const barisMakanan = tbody.getElementsByClassName("barisMakanan");
        while (barisMakanan.length > 0) barisMakanan[0].remove();

        for (const item of data.data) {
            fragment.appendChild(createTableRow(item));
        }
        tbody.appendChild(fragment);
    } catch (err) {
        console.error(err);
    } finally {
        wrapper.style.display = "none";
    }
}

// --------------------- Delete data ---------------------
async function tombolHapusData(p) {
    const tombolsebaris = p.parentElement.getElementsByTagName("button");
    const wrapper = p.parentElement.querySelector(".wrapper");
    const idMakanan = p.parentElement.parentElement.querySelector("#nama_makanan").innerText;

    for (let btn of tombolsebaris) btn.style.display = "none";
    wrapper.style.display = "inline-block";

    try {
        const response = await fetch('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', {
            method: 'DELETE',
            body: JSON.stringify({ nama_makanan: idMakanan })
        });
        const result = await response.json();
        createModal(result.data.pesan === "berhasil" ? "Data berhasil dihapus" : "Data gagal dihapus");
        if (result.data.pesan === "berhasil") p.parentElement.parentElement.remove();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        wrapper.style.display = "none";
        for (let btn of tombolsebaris) btn.style.display = "inline-block";
    }
}

// --------------------- Edit data ---------------------
function tombolOpsiUbahData(p) {
    const baris = p.parentElement;
    const tombolsebaris = baris.getElementsByTagName("button");
    const opsiUbah = baris.getElementsByClassName("opsiUbah");

    for (let btn of tombolsebaris) btn.style.display = "none";

    const inputData = baris.parentElement.getElementsByClassName("databaris");
    for (let i = 0; i < inputData.length; i++) {
        const dataLalu = inputData[i].textContent;

        // Only create input for the columns we want to edit
        if (i === 0) {
            inputData[i].innerHTML = `<input type='text' name='nama_makanan' placeholder='${dataLalu}' value='${dataLalu}'>`;
        } else if (i === 1) {
            inputData[i].innerHTML = `<input type='date' name='tanggal_kedaluwarsa' value='${dataLalu}'>`;
        }
        // Do NOT try to set value for columns without an input
    }

    for (let btn of opsiUbah) btn.style.display = "inline-block";
}


function tombolBatalUbah(p) {
    const baris = p.parentElement;
    const tombolsebaris = baris.getElementsByTagName("button");
    for (let btn of tombolsebaris) btn.style.display = "inline-block";

    const opsiUbah = baris.getElementsByClassName("opsiUbah");
    for (let btn of opsiUbah) btn.style.display = "none";

    loadJSONToTable('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', 'dataMakanan');
}

async function tombolKirimUbah(p) {
    const baris = p.parentElement;
    const inputData = baris.parentElement.getElementsByTagName("input");
    const wrapper = p.parentElement.querySelector(".wrapper");
    const tombolsebaris = baris.getElementsByTagName("button");

    for (let btn of tombolsebaris) btn.style.display = "none";

    let data = {};
    for (let i = 0; i < inputData.length; i++) {
        if (i === 0) data["nama_makananlalu"] = inputData[i].placeholder;
        data[inputData[i].name] = inputData[i].value;
    }

    wrapper.style.display = "inline-block";

    try {
        const response = await fetch('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        createModal(result.data.pesan === "berhasil" ? "Data berhasil diubah" : "Data gagal diubah");
    } catch (err) {
        console.error('Error:', err);
    } finally {
        wrapper.style.display = "none";
        loadJSONToTable('https://jhihbagswdifzwdnkmgi.supabase.co/functions/v1/restapi', 'dataMakanan');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('dataMakanan');
    const headers = table.querySelectorAll('th');
    let sortDirection = {};

    headers.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            sortTableByColumn(table, index);
            updateSortIndicators(index);
        });
    });

    function sortTableByColumn(table, columnIndex) {
        const tbody = table.tBodies[0];
        const rows = Array.from(
            tbody.querySelectorAll('tr.barismakanan, tr.barisMakanan')
        );

        // Toggle direction
        sortDirection[columnIndex] = !sortDirection[columnIndex];

        rows.sort((a, b) => {
            let cellA = a.cells[columnIndex].innerText.trim();
            let cellB = b.cells[columnIndex].innerText.trim();

            if (columnIndex === 1) {
                cellA = new Date(cellA);
                cellB = new Date(cellB);
            } else {
                const numA = parseFloat(cellA);
                const numB = parseFloat(cellB);
                if (!isNaN(numA) && !isNaN(numB)) {
                    cellA = numA;
                    cellB = numB;
                } else {
                    cellA = cellA.toLowerCase();
                    cellB = cellB.toLowerCase();
                }
            }

            if (cellA < cellB) return sortDirection[columnIndex] ? -1 : 1;
            if (cellA > cellB) return sortDirection[columnIndex] ? 1 : -1;
            return 0;
        });

        rows.forEach(row => tbody.appendChild(row));
    }

    function updateSortIndicators(activeIndex) {
        headers.forEach((header, index) => {
            // 1. Remove existing arrows (▲ or ▼) from ALL headers first
            // This regex finds a space followed by an arrow at the end of the string
            header.innerText = header.innerText.replace(/\s[▲▼]$/, '');

            // 2. Add the arrow ONLY to the header that was just clicked
            if (index === activeIndex) {
                const arrow = sortDirection[index] ? ' ▲' : ' ▼';
                header.innerText += arrow;
            }
        });
    }
});
