const { ambienteModel } = require("../models");
const { handleHttpError } = require("../utils/handleError");
const mongoose = require('mongoose');

const getAmbiente = async (req, res) => {
    try {
        const data = await ambienteModel.find({ activo: true });
        res.status(200).send({ data });
    } catch (error) {
        handleHttpError(res, "Error al obtener datos de ambiente de formación", 500);
    }
};

const getAmbienteId = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el ID es válido antes de buscar el ambiente
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de ambiente inválido" });
        }

        // Buscar el ambiente activo
        const data = await ambienteModel.findOne({ _id: id, activo: true });

        // Si no se encuentra el ambiente
        if (!data) {
            return res.status(404).json({ message: "Ambiente de formación no encontrado" });
        }

        // Si se encuentra el ambiente, responde con éxito
        res.status(200).json({ message: "Ambiente de formación consultado exitosamente", data });

    } catch (error) {
        console.error("Error al consultar el ambiente:", error);  // Loguear el error para más detalles
        return res.status(500).json({ message: "Error al consultar el ambiente de formación" });
    }
};

const postAmbiente = async (req, res) => {
    const { body } = req;
    try {
        const data = await ambienteModel.create(body);
        res.status(201).send({ message: "Ambiente de formación registrado exitosamente", data });
    } catch (error) {
        handleHttpError(res, "Error al registrar el ambiente de formación", 500);
    }
};

const updateAmbiente = async (req, res) => {
    const ambienteId = req.params.id;
    const { body } = req;

    try {
        const data = await ambienteModel.findOneAndUpdate(
            { _id: ambienteId, activo: true },
            { ...body },
            { new: true }
        );

        if (!data) {
            return res.status(404).json({ message: "Ambiente de formación no encontrado" });
        }

        res.status(200).send({ message: `Ambiente de formación ${ambienteId} actualizado exitosamente`, data });
    } catch (error) {
        handleHttpError(res, "Error al actualizar el ambiente de formación", 500);
    }
};

const deleteAmbiente = async (req, res) => {
    const ambienteId = req.params.id;

    try {
        // Actualizar el campo 'activo' a false en lugar de eliminar el documento
        const data = await ambienteModel.findOneAndUpdate(
            { _id: ambienteId },
            { activo: false },
            { new: true }
        );

        if (!data) {
            return res.status(404).json({ message: "Ambiente de formación no encontrado" });
        }

        res.status(200).send({ message: `Ambiente de formación ${ambienteId} desactivado exitosamente`, data });

    } catch (error) {
        handleHttpError(res, "Error al desactivar el ambiente de formación", 500);
    }
};

module.exports = { getAmbiente, getAmbienteId, postAmbiente, updateAmbiente, deleteAmbiente };

