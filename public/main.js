const API_URL = '/api/rates';
const currencies = [
    { code: 'USD', name: 'Dólar US', flag: 'us' },
    { code: 'EUR', name: 'Euro UE', flag: 'eu' },
    { code: 'GBP', name: 'Libra Est.', flag: 'gb' },
    { code: 'JPY', name: 'Yen Jap.', flag: 'jp' },
    { code: 'BRL', name: 'Real Br.', flag: 'br' },
    { code: 'MXN', name: 'Peso Mex.', flag: 'mx' }
];

let ratesInDOP = {};
let chart;

async function init() {
    try {
        const res = await fetch(API_URL);
        const json = await res.json();
        
        if (!json.data) throw new Error("Datos corruptos");

        const data = json.data;
        const usdToDop = data['DOP'] || 59.20;

        // Calcular tasas relativas a DOP
        currencies.forEach(c => {
            if (c.code === 'USD') {
                ratesInDOP['USD'] = usdToDop;
            } else {
                ratesInDOP[c.code] = usdToDop / (data[c.code] || 1);
            }
        });

        renderCards();
        populateSelect();
        updateConversion();
        initChart('USD');
    } catch (e) {
        console.error("Error cargando frontend:", e);
        document.getElementById('cardsGrid').innerHTML = "<p class='text-red-500'>Error al conectar con el servidor.</p>";
    }
}

function renderCards() {
    const grid = document.getElementById('cardsGrid');
    grid.innerHTML = currencies.map(c => `
        <div class="cyber-card p-6 rounded-xl cursor-pointer" onclick="updateChart('${c.code}')">
            <div class="flex justify-between items-start mb-4">
                <img src="https://flagcdn.com/w80/${c.flag}.png" class="w-8">
                <span class="orbitron text-xs text-cyan-400">${c.code}</span>
            </div>
            <p class="text-[9px] text-gray-500 font-bold uppercase">${c.name}</p>
            <div class="text-2xl font-bold text-white mt-1">
                <span class="text-xs text-purple-500">RD$</span> ${ratesInDOP[c.code].toFixed(2)}
            </div>
        </div>
    `).join('');
}

function populateSelect() {
    const sel = document.getElementById('fromCurrency');
    sel.innerHTML = currencies.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
}

function updateConversion() {
    const val = parseFloat(document.getElementById('calcInput').value) || 0;
    const code = document.getElementById('fromCurrency').value;
    const total = val * ratesInDOP[code];
    document.getElementById('calcResult').innerText = `RD$ ${total.toLocaleString('en-US', {minimumFractionDigits:2})}`;
}

function initChart(code) {
    const options = {
        series: [{ name: 'Valor', data: Array.from({length:7}, () => ratesInDOP[code] + (Math.random()-0.5)) }],
        chart: { type: 'area', height: 300, toolbar: {show:false}, foreColor: '#00f2ff' },
        colors: ['#bc13fe'],
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
        grid: { borderColor: '#111' },
        xaxis: { categories: ['LUN','MAR','MIE','JUE','VIE','SAB','DOM'] }
    };
    if(chart) chart.destroy();
    chart = new ApexCharts(document.querySelector("#mainChart"), options);
    chart.render();
}

function updateChart(code) {
    document.getElementById('chartBadge').innerText = `${code} / DOP`;
    chart.updateSeries([{ name: 'Valor', data: Array.from({length:7}, () => ratesInDOP[code] + (Math.random()-0.5)) }]);
}

function toggleModal() {
    document.getElementById('bioModal').classList.toggle('hidden');
}

document.getElementById('calcInput').addEventListener('input', updateConversion);
document.getElementById('fromCurrency').addEventListener('change', updateConversion);

init();