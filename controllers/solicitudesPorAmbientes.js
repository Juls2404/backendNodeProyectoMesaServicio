const { solicitudModel } = require("../models");
const { handleHttpError } = require("../utils/handleError");
const {solicitudesPDF} = require("../controllers/SolicitudesPDF");

const getSolicitudesPorAmbientes = async (req, res) => {
    try {
        const data = await solicitudModel.aggregate([
            {
                $group: {
                    _id: "$ambiente", // Agrupar por el campo ambiente
                    cantidad: { $sum: 1 } // Contar la cantidad de solicitudes por ambiente
                }
            },
            {
                $lookup: {
                    from: "ambientes", // Nombre de la colección de ambientes
                    localField: "_id",
                    foreignField: "_id",
                    as: "ambiente"
                }
            },
            {
                $unwind: "$ambiente"
            },
            {
                $group: {
                    _id: "$ambiente.nombre", // Agrupar por nombre de ambiente
                    cantidad: { $sum: "$cantidad" } // Sumar las cantidades
                }
            },
            {
                $project: {
                    _id: 0,
                    nombre: "$_id",
                    cantidad: "$cantidad"
                }
            },
            {
                $sort: { "cantidad": -1 } // Ordenar por cantidad descendente
            }
        ]);

        res.status(200).json({ message: "Datos obtenidos correctamente", data });
    } catch (error) {
        handleHttpError(res, "Error al obtener datos agregados por ambiente");
    }
};

module.exports = { getSolicitudesPorAmbientes };