const express = require("express");
const router = express.Router();
const { getSolicitudesPorAmbientes } = require("../controllers/graficaSolicitudesPorAmbiente"); 



/*  Ruta para obtener las solicitudes por ambiente
 http://localhost:3010/api/solicitudesPorAmbientes 


 Ruta para obtener la grafica
 http://localhost:3010/solicitudesPorAmbientes.html  */
 

router.get("/", getSolicitudesPorAmbientes); 

module.exports = router;