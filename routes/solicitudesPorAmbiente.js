const express = require("express");
const router = express.Router();
const { getSolicitudesPorAmbientes } = require("../controllers/solicitudesPorAmbientes"); // Asegúrate de importar con el nombre correcto

// Ruta para obtener las solicitudes por ambiente
router.get("/", getSolicitudesPorAmbientes); // Asegúrate de que el nombre coincida

module.exports = router;