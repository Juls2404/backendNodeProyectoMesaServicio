const PDFDocument = require('pdfkit');
const { fetchSolicitudesPorMes } = require('../SolicitudesPDF');
const { drawTable } = require('../PDF/tablaPDF');
const path = require('path'); // Para manejar rutas de archivos

async function buildPDF(dataS, endS) {
    const doc = new PDFDocument();

    doc.on('data', dataS);
    doc.on('end', endS);

    try {
        const { totalPorMes, allSolicitudes } = await fetchSolicitudesPorMes();

        // Crear tabla para los detalles de cada solicitud
        const tableSolicitudes = {
            title: 'Solicitudes realizadas',
            headers: ['Codigo Caso', 'Usuario', 'Ambiente', 'Descripción', 'Estado', 'Fecha', 'Técnico'],
            rows: allSolicitudes.map(solicitud => [
                solicitud.codigoCaso,
                solicitud.usuario ? solicitud.usuario.nombre : 'Sin nombre',
                solicitud.ambiente ? solicitud.ambiente.nombre : 'Sin nombre',
                solicitud.descripcion,
                solicitud.estado,
                new Date(solicitud.fecha).toLocaleDateString(),
                solicitud.tecnico ? solicitud.tecnico.nombre : 'Sin nombre'
            ])
        };

        // Centrar el texto inicial
        doc.fontSize(20)
            .text('Solicitudes realizadas', {
                align: 'center',
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right
            })
            .moveDown(1);

        
        drawTable(doc, tableSolicitudes, { width: 500 });

        const currentY = doc.y;

       
        const imageSENA = path.join(__dirname, '../PDF/images/logo SENA.png');

       
        doc.fontSize(20)
            .text('Mesa de servicio', {
                align: 'center',
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right
            })
            .moveDown(1); 

        // Calcular la posición para centrar la imagen
        const pageWidth = doc.page.width;
        const imageWidth = 50; 
        const imageHeight = 50; 
        const x = (pageWidth - imageWidth) / 2;

        // Aquí añado la imagen centrada
        doc.image(imageSENA, x, doc.y, {
            fit: [imageWidth, imageHeight]
        });

    } catch (error) {
        doc.fontSize(12).text('Error al generar el PDF: ' + error.message);
        console.error('Error al generar el PDF:', error); 
    }

    doc.end();
}

module.exports = { buildPDF };
