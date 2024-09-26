const request = require('supertest');
const app = require('../app'); // Asegúrate de que la ruta sea correcta
const { usuarioModel, storageModel } = require('../models');
const { handleHttpError } = require('../utils/handleError');

jest.mock('../models');
jest.mock('../utils/handleError');
jest.mock('fs', () => ({
    unlink: jest.fn((path, callback) => callback()),
}));

describe('Usuario Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUsuarios', () => {
        it('should return a list of users', async () => {
            const mockUsuarios = [{ nombre: 'Usuario 1' }, { nombre: 'Usuario 2' }];
            usuarioModel.find.mockResolvedValue(mockUsuarios);
            usuarioModel.populate.mockResolvedValue(mockUsuarios);

            const response = await request(app).get('/api/usuarios');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockUsuarios);
        });

        it('should handle errors', async () => {
            usuarioModel.find.mockRejectedValue(new Error('Error'));

            const response = await request(app).get('/api/usuarios');

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "error al obtener datos", 500);
        });
    });

    describe('getUsuariosId', () => {
        it('should return user by id', async () => {
            const mockUsuario = { nombre: 'Usuario 1' };
            usuarioModel.findById.mockResolvedValue(mockUsuario);
            usuarioModel.populate.mockResolvedValue(mockUsuario);

            const response = await request(app).get('/api/usuarios/validId');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Usuario consultado exitosamente");
            expect(response.body.data).toEqual(mockUsuario);
        });

        it('should return a message if user not found', async () => {
            usuarioModel.findById.mockResolvedValue(null);

            const response = await request(app).get('/api/usuarios/invalidId');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Usuario no existe");
        });

        it('should handle errors', async () => {
            usuarioModel.findById.mockRejectedValue(new Error('Error'));

            const response = await request(app).get('/api/usuarios/validId');

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "Error al consultar el usuario");
        });
    });

    describe('getPerfilUsuario', () => {
        it('should return the user profile', async () => {
            const mockUsuario = { nombre: 'Usuario 1', rol: 'admin', foto: { url: 'url' } };
            const req = { usuario: { _id: 'validId' } };
            usuarioModel.findById.mockResolvedValue(mockUsuario);
            usuarioModel.populate.mockResolvedValue(mockUsuario);

            const response = await request(app).get('/api/usuarios/perfil').set('Authorization', 'Bearer token').send(req);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('perfil consultado');
            expect(response.body.data).toEqual(mockUsuario);
        });

        it('should return 404 if user not found', async () => {
            const req = { usuario: { _id: 'invalidId' } };
            usuarioModel.findById.mockResolvedValue(null);

            const response = await request(app).get('/api/usuarios/perfil').set('Authorization', 'Bearer token').send(req);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('usuario no encontrado');
        });

        it('should handle errors', async () => {
            const req = { usuario: { _id: 'validId' } };
            usuarioModel.findById.mockRejectedValue(new Error('Error'));

            const response = await request(app).get('/api/usuarios/perfil').set('Authorization', 'Bearer token').send(req);

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "Error al consultar el perfil del usuario", 500);
        });
    });

    describe('updateUsuarios', () => {
        it('should update user information', async () => {
            const req = {
                usuario: { _id: 'validId' },
                body: { password: 'newPassword', confirmPassword: 'newPassword' },
                file: { filename: 'newFile.png' },
            };

            usuarioModel.findById.mockResolvedValue({ foto: { filename: 'oldFile.png', _id: 'oldFileId' } });
            storageModel.findByIdAndDelete.mockResolvedValue({});
            storageModel.create.mockResolvedValue({ _id: 'newFileId' });
            usuarioModel.findOneAndUpdate.mockResolvedValue({});

            const response = await request(app).put('/api/usuarios/validId').set('Authorization', 'Bearer token').send(req);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Usuario validId actualizado exitosamente");
        });

        it('should handle password mismatch', async () => {
            const req = {
                usuario: { _id: 'validId' },
                body: { password: 'newPassword', confirmPassword: 'differentPassword' },
            };

            const response = await request(app).put('/api/usuarios/validId').set('Authorization', 'Bearer token').send(req);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Las contraseñas no coinciden");
        });

        it('should handle user not found', async () => {
            const req = {
                usuario: { _id: 'validId' },
                body: {},
                file: null,
            };
            usuarioModel.findById.mockResolvedValue(null);

            const response = await request(app).put('/api/usuarios/validId').set('Authorization', 'Bearer token').send(req);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Usuario no encontrado");
        });

        it('should handle errors', async () => {
            const req = {
                usuario: { _id: 'validId' },
                body: {},
            };
            usuarioModel.findById.mockRejectedValue(new Error('Error'));

            const response = await request(app).put('/api/usuarios/validId').set('Authorization', 'Bearer token').send(req);

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "Error al actualizar el usuario", 500);
        });
    });

    describe('deleteUsuarios', () => {
        it('should delete a user', async () => {
            const mockUsuario = { foto: { filename: 'file.png', _id: 'fileId' } };
            usuarioModel.findById.mockResolvedValue(mockUsuario);
            storageModel.findByIdAndDelete.mockResolvedValue({});

            const response = await request(app).delete('/api/usuarios/validId');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Usuario validId y su foto asociada han sido eliminados");
        });

        it('should return 404 if user not found', async () => {
            usuarioModel.findById.mockResolvedValue(null);

            const response = await request(app).delete('/api/usuarios/invalidId');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Usuario no encontrado");
        });

        it('should handle errors', async () => {
            const userId = 'validId';
            usuarioModel.findById.mockRejectedValue(new Error('Error'));

            const response = await request(app).delete(`/api/usuarios/${userId}`);

            expect(response.status).toBe(500);
            expect(handleHttpError).toHaveBeenCalledWith(expect.anything(), "Error al eliminar el usuario", 500);
        });
    });
});
