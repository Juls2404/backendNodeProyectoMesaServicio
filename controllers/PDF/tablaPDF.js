const PDFDocument = require('pdfkit');

function drawTable(doc, table, options = {}) {
    const { width, headerColor = '#9EAB9C', borderColor = 'black', padding = 5, fontSize = 10 } = options;
    const { headers, rows } = table;

    const totalWidth = width || 500;
    const startX = (doc.page.width - totalWidth) / 2; // Aquí centro la tabla
    let y = doc.y;

    // Aquí establezco el ancho de las columnas
    const columnWidth = totalWidth / headers.length;

    // Esta es una funcion para poder dibujar las celdas
    const drawCell = (text, x, y, width, height, align = 'center', backgroundColor = null) => {
        if (backgroundColor) {
            doc.rect(x, y, width, height).fill(backgroundColor).fillColor('black');
        }
        doc.text(text, x + padding, y + padding, { width: width - padding * 2, height: height - padding * 2, align });
    };

    const drawHeader = () => {
        doc.fontSize(fontSize).fillColor('white');
        headers.forEach((header, i) => {
            const headerHeight = doc.heightOfString(header, { width: columnWidth });
            drawCell(header, startX + (i * columnWidth), y, columnWidth, headerHeight + padding * 2, 'center', headerColor);
        });
        y += doc.heightOfString(headers[0], { width: columnWidth }) + padding * 2; // Ajustar y hacia abajo
        doc.moveTo(startX, y).lineTo(startX + totalWidth, y).strokeColor(borderColor).stroke(); // Línea bajo los headers
    };

    const drawRow = (row) => {
        // Calcular la altura máxima de las celdas en la fila actual
        const cellHeights = row.map((cell) => doc.heightOfString(cell, { width: columnWidth - padding * 2 }));
        const rowHeight = Math.max(...cellHeights) + padding * 2; // Altura ajustada con padding

        // Verificar si la fila cabe en la página actual, si no, agregar una nueva página
        if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            y = doc.y; // Resetear la posición en Y en la nueva página
            drawHeader(); // Redibujar la cabecera en la nueva página
        }

        // Dibujar las celdas y las líneas verticales
        row.forEach((cell, i) => {
            drawCell(cell, startX + (i * columnWidth), y, columnWidth, rowHeight, 'center');
            doc.moveTo(startX + (i * columnWidth), y).lineTo(startX + (i * columnWidth), y + rowHeight).strokeColor(borderColor).stroke(); // Línea vertical entre columnas
        });

        // Dibuja la línea vertical final para cerrar la tabla
        doc.moveTo(startX + totalWidth, y).lineTo(startX + totalWidth, y + rowHeight).strokeColor(borderColor).stroke();

        y += rowHeight; // Mover Y hacia abajo para la siguiente fila
        doc.moveTo(startX, y).lineTo(startX + totalWidth, y).strokeColor(borderColor).stroke(); // Línea bajo cada fila
    };

    // Dibujar la cabecera
    drawHeader();

    // Dibujar las filas
    rows.forEach(drawRow);

    // Dibujar bordes exteriores de la tabla (incluyendo el borde final)
    doc.moveTo(startX, y).lineTo(startX + totalWidth, y).strokeColor(borderColor).stroke();

}

module.exports = { drawTable };
