const request = require('supertest');
const app = require('../app'); // Asegúrate de que la ruta sea correcta
const { solicitudModel, storageModel, usuarioModel, solucionCasoModel } = require("../models");
const transporter = require('../utils/handleEmail');

jest.mock('../models');
jest.mock('../utils/handleEmail');

describe('solucionCaso', () => {
    let validSolicitudId;

    beforeAll(async () => {
        const solicitud = await solicitudModel.create({
            _id: 'validId',
            estado: 'solicitado',
            usuario: 'usuarioId',
            codigoCaso: '12345'
        });
        validSolicitudId = solicitud._id;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if solicitud not found', async () => {
        const response = await request(app)
            .post(`/api/solicitudes/${'invalidId'}/solucion`)
            .send({ tipoSolucion: 'finalizado' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Solicitud no encontrada');
    });

    it('should update estado to "pendiente" and save solution', async () => {
        const response = await request(app)
            .post(`/api/solicitudes/${validSolicitudId}/solucion`)
            .send({ tipoSolucion: 'pendiente' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Registro exitoso de la solución del caso');
        expect(solicitudModel.findById).toHaveBeenCalledWith(validSolicitudId);
        expect(solicitudModel.prototype.save).toHaveBeenCalled();
    });

    it('should close the case and send email if tipoSolucion is "finalizado"', async () => {
        usuarioModel.findById.mockReturnValue({ correo: 'user@example.com', nombre: 'Usuario' });

        const response = await request(app)
            .post(`/api/solicitudes/${validSolicitudId}/solucion`)
            .send({ tipoSolucion: 'finalizado' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Caso cerrado exitosamente');
        expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@example.com',
            subject: 'Caso Cerrado - Mesa de Servicio - CTPI-CAUCA',
        }));
    });

    it('should handle errors gracefully', async () => {
        solicitudModel.findById.mockImplementation(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post(`/api/solicitudes/${validSolicitudId}/solucion`)
            .send({ tipoSolucion: 'finalizado' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error al registrar la solución del caso');
    });
});
