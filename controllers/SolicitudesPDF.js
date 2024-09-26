const { solicitudModel } = require("../models");
const { handleHttpError } = require("../utils/handleError");

const fetchSolicitudesPorMes = async () => {
    try {
        // Obtener el total de solicitudes por mes
        const totalPorMes = await solicitudModel.aggregate([
            {
                $group: {
                    _id: { $month: "$fecha" },
                    cantidad: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // Obtener todas las solicitudes con sus detalles y usar populate para traer los nombres
        const allSolicitudes = await solicitudModel.find({})
            .populate('usuario', 'nombre')  // Popula el campo `usuario` y trae solo el campo `nombre`
            .populate('ambiente', 'nombre') // Popula el campo `ambiente` y trae solo el campo `nombre`
            .populate('tecnico', 'nombre')  // Popula el campo `tecnico` y trae solo el campo `nombre`
            .lean(); // Convierte los documentos a objetos JavaScript simples

        return { totalPorMes, allSolicitudes };
    } catch (error) {
        throw new Error("Error al obtener los datos de las solicitudes");
    }
};


// Función que maneja la solicitud HTTP
const getSolicitudesPorMes = async (req, res) => {
    try {
        const data = await fetchSolicitudesPorMes();
        res.status(200).json({ message: "Datos obtenidos correctamente", data });
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

module.exports = { getSolicitudesPorMes, fetchSolicitudesPorMes };
