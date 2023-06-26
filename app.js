const express = require('express');
const {Client} = require('@elastic/elasticsearch');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

// Membuat koneksi dengan Elasticsearch
const elasticClient = new Client({node: 'http://127.0.0.1:9200'});
app.get('/', async (req, res) => {
    try {
        const result = await elasticClient.search({
            index: 'customer',
            body: {
                query: {
                    match_all: {} // Menggunakan kueri match_all untuk mencocokkan semua dokumen
                }
            }
        });

        return res.status(200).json({
            message: 'Data berhasil ditemukan',
            data: result.hits.hits
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Data tidak ditemukan',
            detail: error.meta.body.error.reason
        });
    }
});

app.post('/customer', async (req, res) => {
    try {
        const result = await elasticClient.index({
            index: "customer", // Nama indeks Elasticsearch yang ditargetkan
            body: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
            }
        });
        console.log('Data berhasil dikirim ke Elasticsearch:', result);
        return res.status(200).json({
            message: 'Data berhasil dikirim ke Elasticsearch'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Data gagal dikirim ke Elasticsearch',
            detail: error.meta.body.error.reason
        });
    }
});

// Endpoint untuk melakukan pencarian
app.get('/search', async (req, res) => {
    try {
        // Membuat permintaan pencarian ke Elasticsearch
        const result = await elasticClient.search({
            index: 'customer',
            body: {
                query: {
                    match: {
                        firstname: req.query.firstname
                    }
                }
            }
        });

        if (result.hits.total.value > 0) {
             return res.status(200).json({
                    message: 'Data berhasil ditemukan',
                    data: result.hits.hits
             });
        } else {
            return res.status(404).json({
                message: 'Data tidak ditemukan',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Data tidak ditemukan',
            detail: error.meta.body.error.reason
        });
    }
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
