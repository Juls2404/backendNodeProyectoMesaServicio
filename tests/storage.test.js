const request = require('supertest');
const app = require('../app'); // Asegúrate de que la ruta sea correcta
const { storageModel } = require("../models");
const fs = require('fs');
const path = require('path');

jest.mock('../models');
jest.mock('fs');

describe('Storage Controller', () => {
    const mockFile = {
        filename: 'testfile.txt'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createStorage', () => {
        it('should return 400 if no file is provided', async () => {
            const response = await request(app)
                .post('/api/storage')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("archivo no cargado");
        });

        it('should create a storage record successfully', async () => {
            storageModel.create.mockResolvedValue({ ...mockFile, url: 'http://localhost:3010/testfile.txt' });

            const response = await request(app)
                .post('/api/storage')
                .attach('file', 'testfile.txt'); // Simula la carga de un archivo

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("archivo creado exitosamente");
            expect(storageModel.create).toHaveBeenCalledWith({
                filename: mockFile.filename,
                url: expect.any(String)
            });
        });
    });

    describe('getStorage', () => {
        it('should return all storage records', async () => {
            storageModel.find.mockResolvedValue([{ filename: 'file1.txt' }, { filename: 'file2.txt' }]);

            const response = await request(app).get('/api/storage');

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('getStorageId', () => {
        it('should return 404 if storage record not found', async () => {
            storageModel.findById.mockResolvedValue(null);

            const response = await request(app).get('/api/storage/invalidId');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("archivo no encontrado");
        });

        it('should return storage record by id', async () => {
            storageModel.findById.mockResolvedValue(mockFile);

            const response = await request(app).get('/api/storage/validId');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("archivo consultado exitosamente");
            expect(response.body.data).toEqual(mockFile);
        });
    });

    describe('updateStorage', () => {
        it('should return 404 if storage record not found', async () => {
            storageModel.findById.mockResolvedValue(null);

            const response = await request(app).put('/api/storage/invalidId').attach('file', mockFile);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Archivo no encontrado");
        });

        it('should update the storage record successfully', async () => {
            storageModel.findById.mockResolvedValue(mockFile);
            storageModel.findOneAndUpdate.mockResolvedValue({ ...mockFile, filename: 'newfile.txt' });

            const response = await request(app)
                .put('/api/storage/validId')
                .attach('file', { filename: 'newfile.txt' });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain("Archivo validId actualizado exitosamente");
            expect(storageModel.findOneAndUpdate).toHaveBeenCalled();
        });

        it('should delete the previous file if a new file is provided', async () => {
            storageModel.findById.mockResolvedValue(mockFile);
            storageModel.findOneAndUpdate.mockResolvedValue({ ...mockFile, filename: 'newfile.txt' });

            await request(app)
                .put('/api/storage/validId')
                .attach('file', { filename: 'newfile.txt' });

            expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining(mockFile.filename), expect.any(Function));
        });
    });

    describe('deleteStorage', () => {
        it('should return 404 if storage record not found', async () => {
            storageModel.findByIdAndDelete.mockResolvedValue(null);

            const response = await request(app).delete('/api/storage/invalidId');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Archivo no encontrado");
        });

        it('should delete the storage record and the file', async () => {
            storageModel.findByIdAndDelete.mockResolvedValue(mockFile);

            const response = await request(app).delete('/api/storage/validId');

            expect(response.status).toBe(200);
            expect(response.body.message).toContain("Archivo validId eliminado correctamente");
            expect(fs.unlink).toHaveBeenCalled();
        });
    });
});
