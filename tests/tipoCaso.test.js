const request = require('supertest');
const app = require('../app'); // Asegúrate de que la ruta sea correcta
const { tipoCasoModel } = require('../models');
const { handleHttpError } = require('../utils/handleError');

jest.mock('../models');
jest.mock('../utils/handleError');

describe('Tipo Caso Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getTipoCaso', () => {
        it('should return a list of tipo casos', async () => {
            const mockTipoCasos = [{ nombre: 'Caso 1' }, { nombre: 'Caso 2' }];
            tipoCasoModel.find.mockResolvedValue(mockTipoCasos);

            const response = await request(app).get('/api/tipocaso');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockTipoCasos);
        });

        it('should handle errors', async () => {
            tipoCasoModel.find.mockRejectedValue(new Error('Error'));

            const response = await request(app).get('/api/tipocaso');

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "error al obtener datos");
        });
    });

    describe('getTipoCasoId', () => {
        it('should return tipo caso by id', async () => {
            const mockTipoCaso = { nombre: 'Caso 1' };
            tipoCasoModel.findById.mockResolvedValue(mockTipoCaso);
            
            const response = await request(app).get('/api/tipocaso/validId');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("tipo de caso consultado exitosamente");
            expect(response.body.data).toEqual(mockTipoCaso);
        });

        it('should return 404 if tipo caso not found', async () => {
            tipoCasoModel.findById.mockResolvedValue(null);

            const response = await request(app).get('/api/tipocaso/invalidId');

            expect(response.status).toBe(404);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "tipo de caso no encontrado");
        });

        it('should handle errors', async () => {
            tipoCasoModel.findById.mockRejectedValue(new Error('Error'));

            const response = await request(app).get('/api/tipocaso/validId');

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "Error al consultar el tipo de caso");
        });
    });

    describe('postTipoCaso', () => {
        it('should create a new tipo caso', async () => {
            const mockTipoCaso = { nombre: 'Caso 1' };
            tipoCasoModel.create.mockResolvedValue(mockTipoCaso);
            
            const response = await request(app).post('/api/tipocaso').send(mockTipoCaso);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("tipo de caso registrado exitosamente");
            expect(response.body.data).toEqual(mockTipoCaso);
        });

        it('should handle errors', async () => {
            tipoCasoModel.create.mockRejectedValue(new Error('Error'));

            const response = await request(app).post('/api/tipocaso').send({});

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "Error al registrar el tipo de caso");
        });
    });

    describe('updateTipoCaso', () => {
        it('should update a tipo caso', async () => {
            const mockTipoCaso = { nombre: 'Caso actualizado' };
            tipoCasoModel.findOneAndUpdate.mockResolvedValue(mockTipoCaso);
            
            const response = await request(app).put('/api/tipocaso/validId').send(mockTipoCaso);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("tipo de caso validId actualizado exitosamente");
            expect(response.body.data).toEqual(mockTipoCaso);
        });

        it('should handle errors', async () => {
            tipoCasoModel.findOneAndUpdate.mockRejectedValue(new Error('Error'));

            const response = await request(app).put('/api/tipocaso/validId').send({});

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "error al actualizar tipo de caso");
        });
    });

    describe('deleteTipoCaso', () => {
        it('should delete a tipo caso', async () => {
            tipoCasoModel.findByIdAndDelete.mockResolvedValue({});

            const response = await request(app).delete('/api/tipocaso/validId');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("tipo de caso validId eliminado");
        });

        it('should return 404 if tipo caso not found', async () => {
            tipoCasoModel.findByIdAndDelete.mockResolvedValue(null);

            const response = await request(app).delete('/api/tipocaso/invalidId');

            expect(response.status).toBe(404);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "tipo de caso no encontrado", 404);
        });

        it('should handle errors', async () => {
            tipoCasoModel.findByIdAndDelete.mockRejectedValue(new Error('Error'));

            const response = await request(app).delete('/api/tipocaso/validId');

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "Error al eliminar tipo de caso");
        });
    });
});
