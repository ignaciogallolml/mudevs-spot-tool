let monsterData = [];
let mapID = "0";
let spotsList = [];

const monsterInput = document.getElementById('monsterFile');
const mapInput = document.getElementById('mapFile');
const btnContinue = document.getElementById('btn-continue');
const btnText = document.getElementById('btn-text'); // Ahora coincide con el ID del HTML
const monsterSelect = document.getElementById('monsterSelect');

// NOTIFICACIONES
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    let bgClass = type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
    
    toast.className = `flex items-center gap-3 px-5 py-4 border backdrop-blur-md rounded-2xl shadow-2xl ${bgClass} animate-in`;
    toast.innerHTML = `<span class="text-sm font-bold">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// VALIDACIÓN DE ARCHIVOS (Lo que pediste)
function checkFiles() {
    const hasMonster = monsterData.length > 0;
    const hasMap = mapID !== "0";

    if (hasMonster && hasMap) {
        btnContinue.disabled = false;
        btnText.innerText = "CONTINUAR";
    } else if (hasMonster || hasMap) {
        btnContinue.disabled = true;
        btnText.innerText = "FALTA UN ARCHIVO...";
    } else {
        btnContinue.disabled = true;
        btnText.innerText = "SUBE LOS ARCHIVOS PRIMERO";
    }
}

// VISUAL DE CARDS
function updateUploadStatus(type, labelText) {
    const card = document.getElementById(`card-${type}`);
    const icon = document.getElementById(`icon-${type}`);
    const msg = document.getElementById(`msg-${type}`);
    
    card.classList.add('border-emerald-500/50', 'bg-emerald-500/5');
    icon.innerHTML = `<svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>`;
    msg.innerHTML = `<span class="text-emerald-400 font-bold">${labelText}</span>`;
}

// EVENTOS DE CARGA
monsterInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const regex = /<Monster\s+[^>]*Index="(\d+)"\s+[^>]*Name="([^"]+)"/g;
        monsterData = [];
        monsterSelect.innerHTML = "";
        let match;
        while ((match = regex.exec(event.target.result)) !== null) {
            monsterData.push({ id: match[1], name: match[2] });
            let opt = document.createElement("option");
            opt.value = match[1];
            opt.text = `[${match[1]}] ${match[2]}`;
            monsterSelect.add(opt);
        }
        updateUploadStatus('monster', `${monsterData.length} Mobs Listos`);
        checkFiles();
    };
    reader.readAsText(file);
});

mapInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const match = file.name.match(/\d+/);
    mapID = match ? match[0] : "0";
    updateUploadStatus('map', `Mapa ${mapID} Vinculado`);
    checkFiles();
});

btnContinue.addEventListener('click', () => {
    document.getElementById('upload-screen').classList.add('hidden');
    document.getElementById('editor-screen').classList.remove('hidden');
});

// LÓGICA DEL EDITOR
document.getElementById('btn-add').addEventListener('click', () => {
    const mSelect = document.getElementById('monsterSelect');
    if (!mSelect.value) return;
    
    const mName = mSelect.options[mSelect.selectedIndex].text.split('] ')[1];
    const qty = document.getElementById('qty').value;
    const spotType = document.getElementById('spotType').value;
    
    let display = spotType === "normal" ? `${mName} x${qty}` : (spotType === "spot" ? "Spot" : "Hotspot");

    spotsList.push({
        id: mSelect.value, name: mName, displayName: display,
        x1: document.getElementById('x1').value, y1: document.getElementById('y1').value,
        x2: document.getElementById('x2').value, y2: document.getElementById('y2').value,
        qty: qty, dir: document.getElementById('dir').value
    });
    renderSpots();
    showToast(`Añadido: ${mName}`);
});

function removeSpot(index) {
    spotsList.splice(index, 1);
    renderSpots();
    showToast("Eliminado", "error");
}

function renderSpots() {
    const tbody = document.getElementById('spotListBody');
    tbody.innerHTML = "";
    let xml = ""; let mini = "";

    spotsList.forEach((s, i) => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-800/20 transition-all">
                <td class="px-6 py-4 font-mono text-indigo-400 text-xs font-bold">${s.id}</td>
                <td class="px-6 py-4 text-slate-100 font-bold">${s.name}</td>
                <td class="px-6 py-4 text-center text-slate-500 font-mono text-xs italic">(${s.x1},${s.y1}) ➔ (${s.x2},${s.y2})</td>
                <td class="px-6 py-4 text-center font-bold text-white">${s.qty}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="removeSpot(${i})" class="text-[10px] font-black hover:text-red-500">ELIMINAR</button>
                </td>
            </tr>`;
        xml += `<Config Class="${s.id}" Range="30" BeginPosX="${s.x1}" BeginPosY="${s.y1}" EndPosX="${s.x2}" EndPosY="${s.y2}" Direction="${s.dir}" Quantity="${s.qty}" Element="0" />\n`;
        mini += `${mapID}\t0\t0\t${s.x1}\t${s.y1}\t"${s.displayName}"\n`;
    });
    document.getElementById('fullXML').innerText = xml;
    document.getElementById('fullMini').innerText = mini;
}

function copyFull(type, btn) {
    const code = document.getElementById(type === 'xml' ? 'fullXML' : 'fullMini').innerText;
    if(!code) return;
    navigator.clipboard.writeText(code).then(() => {
        const textSpan = btn.querySelector('.btn-text');
        const originalText = textSpan.innerText;
        btn.classList.add('copied');
        textSpan.innerText = "¡COPIADO!";
        setTimeout(() => {
            btn.classList.remove('copied');
            textSpan.innerText = originalText;
        }, 2000);
    });
}