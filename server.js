require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de la API
app.get('/api/rates', async (req, res) => {
    try {
        const apiKey = process.env.FREE_CURRENCY_API_KEY || 'cJheOUf4ZX9Ja7hmkZdbY9Y7m5i0hCcg';
        const response = await axios.get(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`);
        
        if (response.data) {
            res.json(response.data);
        } else {
            throw new Error("Respuesta de API vacía");
        }
    } catch (error) {
        console.log("AVISO: Usando datos de respaldo (API offline o sin Key)");
        // DATOS DE RESPALDO (Si la API falla, enviamos esto para que no se rompa la app)
        res.json({
            data: {
                "DOP": 59.25, "USD": 1, "EUR": 0.92, "GBP": 0.79, 
                "JPY": 150.20, "BRL": 4.95, "MXN": 17.05
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`>>> TERMINAL CORRIENDO EN: http://localhost:${PORT}`);
});