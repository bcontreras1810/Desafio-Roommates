import express from "express"
import fs from "fs"
import { v4 as uuid } from "uuid"
import fetch from "node-fetch"
import { fileURLToPath } from "url"
import { dirname } from "path"

const app = express();
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname (__filename)

app.use(express.json())

// Ruta para la pagina de inicio
app.get("/", (req, res) => {
    // Envia un archivo HTML como respuesta
    res.sendFile(__dirname + "/index.html");
});


// Ruta para insertar un nuevo usuario (roommate)
app.post("/roommate", async (req, res) => {
    try {
        const response = await fetch("https://randomuser.me/api/");
        const { results } = await response.json();
        const { name } = results[0];
        const apellido = name.last;
        const roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf8"));       
        // Verifica si existe la propiedad "roommates" en el objeto JSON
        if (!roommatesJSON.roommates) {
            roommatesJSON.roommates = [];
        }
        // Genera un nuevo roommate con datos aleatorios
        const nuevoRoommate = { 
            id: uuid().slice(0, 6), 
            nombre: `${name.first} ${apellido}`,
            debe: Math.floor(Math.random() * 50 + 1) * 1000,
            recibe: Math.floor(Math.random() * 50 + 1) * 1000
        };
        // Agrega el nuevo roommate al arreglo de roommates
        roommatesJSON.roommates.push(nuevoRoommate);
        // Escribe el archivo JSON actualizado
        fs.writeFileSync("roommates.json", JSON.stringify(roommatesJSON, null, 2));

        res.send("Roommate agregado con éxito");
    } catch (error) {
        console.error("Error al agregar roommate:", error);
        res.status(500).send("Error al agregar roommate");
    }
});

// Ruta para obtener todos los roommates almacenados
app.get("/roommates", (req, res) => {
    try {
        const data = fs.readFileSync("roommates.json", "utf8");
        const roommates = JSON.parse(data)
        res.send(roommates);
    } catch (error) {
        console.error("Error al obtener roommates:", error);
    }
});


//Devuelve el historial con todos los gastos registrados.
app.get("/gastos", (req, res) => {
    try {        
        const data = fs.readFileSync("gastos.json", "utf8");
        const gastos = JSON.parse(data);
        res.send(gastos);
    } catch (error) {
        console.error("No se pueden obtener los gastos.")
    }

});

//Almacena un nuevo roommate ocupando random user.
app.post("/gasto", (req, res) => {
    const { roommate, descripcion, monto } = req.body;
    
    // Registra los datos recibidos desde el formulario
    console.log("Datos recibidos del formulario:");
    console.log("Nombre del roommate:", roommate);
    console.log("Descripción:", descripcion);
    console.log("Monto:", monto);

    const gasto = { id: uuid().slice(30), roommate, descripcion, monto};
    const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    const gastos = gastosJSON.gastos;
    gastos.push(gasto);

    // Registra los datos antes de guardarlos en el archivo gastos.json
    console.log("Datos a guardar en gastos.json:");
    console.log("Nuevo gasto:", gasto);

    fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 2));
    res.send("Gasto agregado con éxito");
});


// Edita los datos de un gasto.

app.put("/gasto/:id", (req, res) => {
    const { id } = req.params; 
    const { descripcion, monto } = req.body;
    try {
        const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
        const gastoIndex = gastosJSON.gastos.findIndex(g => g.id === id);
        if (gastoIndex !== -1) {
            gastosJSON.gastos[gastoIndex] = { ...gastosJSON.gastos[gastoIndex], descripcion, monto };
            fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 2));
            res.send("Gasto modificado con éxito");
        } else {
            res.status(404).send("No se encontró el gasto con el ID proporcionado");
        }
    } catch (error) {
        console.error("Error al modificar el gasto:", error);      
    }
  });


// Elimina un gasto del historial.
app.delete("/gasto", (req, res) => {
    const { id } = req.query;
    const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    gastosJSON.gastos = gastosJSON.gastos.filter((g) => g.id !== id);
    fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 2));
    res.send("Gasto eliminado con éxito");
});

app.listen(3000, () => console.log("Servidor encendido!"))