const express = require('express');
const connectDb = require('../db/db');
var app = express();

const cors = require('cors');

app.use(cors());

app.listen(3001, () => {
    console.log('server is live on port 3001');
});

app.get('/', (req, res) => {
    res.send('<h1> API REDIS GEO</h1>');
})


//endpoint para agregar grupo de interes 
app.get('/add-group', async (req, res) => {
    try {
        const con = await connectDb();
        const nameGroup = req.query.nameGroup;
        const longitude = req.query.longitude;
        const latitude = req.query.latitude;
        const name = req.query.name;
        await con.geoAdd(nameGroup, { longitude, latitude, member: name });
        res.status(200).send({ message: 'Grupo agregado exitosamente.' });
    } catch (error) {
        throw new Error("Error to add group: " + error.message);
    }
});


//obtener las coordenadas de un lugar específico del grupo de interes
app.get('/get-cordinates', async (req, res) => {
    try {
        const con = await connectDb();

        const nameGroup = req.query.nameGroup;
        const name = req.query.name;

        const result = await con.geoPos(nameGroup, name);

        res.status(200).send({ message: result });
    } catch (error) {
        throw new Error("Error to get cordinates: " + error.message);
    }
});


app.get('/get-place-within-radius', async (req, res) => {
    try {
        const con = await connectDb();
        const nameGroup = req.query.nameGroup
        const longitude = req.query.longitude;
        const latitude = req.query.latitude;
        const result = await con.geoRadius(nameGroup, { longitude, latitude }, 5, 'km', 'WITHCOORD');
        res.status(200).send({ message: result });
    } catch (error) {
        throw new Error("Error to get place: " + error.message);
    }
});
app.get('/get-distance', async (req, res) => {
    try {
        const con = await connectDb();

        const nameGroup = req.query.nameGroup;
        const name = req.query.name;
        const longitude = req.query.longitude;
        const latitude = req.query.latitude;
        const user = await con.geoAdd(nameGroup, { longitude, latitude, member: 'usuario' });
        if (user) {
            const result = await con.geoDist(nameGroup, name, 'usuario', 'km');
            const distance = Math.round(result);
            res.status(200).send({ message: `Distancia entre  el usuario y ${name}: ${distance.toString()}km` });
            con.zRem(nameGroup, 'usuario');
        }
    } catch (error) {
        throw new Error("Error to get distance: " + error.message);
    }
});

