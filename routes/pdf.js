const { Router } = require('express');
const router = Router();
const { buildPDF } = require('../controllers/PDF/pdf'); // Cambié `import` por `require`

// Define tus rutas aquí
// http://localhost:3010/pdf
router.get('/pdf', (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/pdf", 
        "Content-Disposition": "inline; filename=mipdf.pdf" // Corregí la sintaxis de "Content-Disposition"
    });

    const Stream = res; // Defino el Stream para utilizarlo en el buildPDF

    buildPDF(
        (data) => Stream.write(data),
        () => Stream.end()
    );
});

module.exports = router;
