const request = require('supertest');
const app = require('../app'); // Asegúrate de que la ruta sea correcta
const { usuarioModel, storageModel } = require('../models/index.js');
const transporter = require('../utils/handleEmail');

jest.mock('../models/index.js');
jest.mock('../utils/handleEmail');
jest.mock('fs');

describe('Tecnicos Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listaTecnicosPendientes', () => {
        it('should return an empty message if no pending technicians', async () => {
            usuarioModel.find.mockResolvedValue([]);

            const response = await request(app).get('/api/tecnicos/pending');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("lista de tecnicos pendientes de aprobacion");
            expect(response.body.tecnicosFalse).toEqual([]);
        });

        it('should list pending technicians', async () => {
            const mockTecnicos = [
                { nombre: 'Tecnico 1', correo: 'tecnico1@example.com', estado: false, telefono: '123456789' }
            ];
            usuarioModel.find.mockResolvedValue(mockTecnicos);

            const response = await request(app).get('/api/tecnicos/pending');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("lista de tecnicos pendientes de aprobacion");
            expect(response.body.tecnicosFalse).toEqual(mockTecnicos);
        });

        it('should handle errors', async () => {
            usuarioModel.find.mockRejectedValue(new Error('Error'));

            const response = await request(app).get('/api/tecnicos/pending');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Error al listar tecnicos pendientes de aprobacion");
        });
    });

    describe('aprobarTecnico', () => {
        it('should approve a technician successfully', async () => {
            const mockTecnico = { nombre: 'Tecnico 1', correo: 'tecnico1@example.com' };
            usuarioModel.findByIdAndUpdate.mockResolvedValue(mockTecnico);
            transporter.sendMail.mockResolvedValue();

            const response = await request(app).put('/api/tecnicos/validId/approve');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Técnico aprobado exitosamente");
            expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                to: mockTecnico.correo,
                subject: 'Aprobación de Registro - Mesa de Servicio - CTPI-CAUCA'
            }));
        });

        it('should return 404 if technician not found', async () => {
            usuarioModel.findByIdAndUpdate.mockResolvedValue(null);

            const response = await request(app).put('/api/tecnicos/invalidId/approve');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Técnico no encontrado");
        });

        it('should handle errors', async () => {
            usuarioModel.findByIdAndUpdate.mockRejectedValue(new Error('Error'));

            const response = await request(app).put('/api/tecnicos/validId/approve');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Error al aprobar técnico");
        });
    });

    describe('denegarTecnico', () => {
        it('should deny a technician and delete their data', async () => {
            const mockTecnico = { nombre: 'Tecnico 1', correo: 'tecnico1@example.com', foto: { _id: 'photoId', filename: 'photo.png' } };
            usuarioModel.findById.mockResolvedValue(mockTecnico);
            storageModel.findByIdAndDelete.mockResolvedValue({});
            transporter.sendMail.mockResolvedValue();
            usuarioModel.findByIdAndDelete.mockResolvedValue();

            const response = await request(app).delete('/api/tecnicos/validId/deny');

            expect(response.status).toBe(200);
            expect(response.body.message).toContain("tecnico  validId ha sido denegado");
            expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                to: mockTecnico.correo,
                subject: 'Registro Denegado - Mesa de Servicio - CTPI-CAUCA'
            }));
        });

        it('should return 404 if technician not found', async () => {
            usuarioModel.findById.mockResolvedValue(null);

            const response = await request(app).delete('/api/tecnicos/invalidId/deny');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("tecnico no encontrado");
        });

        it('should handle errors during denial', async () => {
            usuarioModel.findById.mockRejectedValue(new Error('Error'));

            const response = await request(app).delete('/api/tecnicos/validId/deny');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Error al eliminar el usuario");
        });
    });

    describe('listaTecnicosAprobados', () => {
        it('should return an empty message if no approved technicians', async () => {
            usuarioModel.find.mockResolvedValue([]);

            const response = await request(app).get('/api/tecnicos/approved');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("lista de tecnicos con registro aprobado");
            expect(response.body.tecnicos).toEqual([]);
        });

        it('should list approved technicians', async () => {
            const mockTecnicos = [
                { nombre: 'Tecnico 1', correo: 'tecnico1@example.com', telefono: '123456789' }
            ];
            usuarioModel.find.mockResolvedValue(mockTecnicos);

            const response = await request(app).get('/api/tecnicos/approved');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("lista de tecnicos con registro aprobado");
            expect(response.body.tecnicos).toEqual(mockTecnicos);
        });

        it('should handle errors', async () => {
            usuarioModel.find.mockRejectedValue(new Error('Error'));

            const response = await request(app).get('/api/tecnicos/approved');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Error al listar tecnicos con registro aprobado");
        });
    });
});
