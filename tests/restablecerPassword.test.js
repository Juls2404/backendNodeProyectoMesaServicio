const { resetPassword } = require('../path/to/controller');
const { usuarioModel } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Mockear el modelo y bcrypt
jest.mock('../models', () => ({
  usuarioModel: {
    findOne: jest.fn(),
    save: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}));

describe('Pruebas del método resetPassword', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Debería responder con un 400 si las contraseñas no coinciden', async () => {
    const req = {
      params: { token: '123' },
      body: {
        password: 'contraseña1',
        confirmPassword: 'contraseña2'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Las contraseñas no coinciden.' });
  });

  test('Debería responder con un 400 si el token es inválido o ha expirado', async () => {
    const req = {
      params: { token: '123' },
      body: {
        password: 'contraseña1',
        confirmPassword: 'contraseña1'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Simular que no se encuentra ningún usuario con ese token
    usuarioModel.findOne.mockResolvedValue(null);

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado.' });
  });

  test('Debería restablecer la contraseña correctamente', async () => {
    const req = {
      params: { token: '123' },
      body: {
        password: 'contraseña1',
        confirmPassword: 'contraseña1'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const mockUser = {
      password: '',
      resetPasswordToken: 'hashedToken',
      resetPasswordExpires: Date.now() + 3600000, // 1 hora en el futuro
      save: jest.fn().mockResolvedValue(true)
    };

    // Simular que se encuentra el usuario
    usuarioModel.findOne.mockResolvedValue(mockUser);
    bcrypt.hash.mockResolvedValue('hashedPassword'); // Simular que bcrypt hashea la contraseña

    await resetPassword(req, res);

    // Verificar que la contraseña ha sido hasheada y guardada
    expect(bcrypt.hash).toHaveBeenCalledWith('contraseña1', 12);
    expect(mockUser.password).toBe('hashedPassword');
    expect(mockUser.resetPasswordToken).toBeUndefined();
    expect(mockUser.resetPasswordExpires).toBeUndefined();
    expect(mockUser.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Contraseña restablecida correctamente.' });
  });

  test('Debería responder con un 500 si ocurre un error en el servidor', async () => {
    const req = {
      params: { token: '123' },
      body: {
        password: 'contraseña1',
        confirmPassword: 'contraseña1'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Simular un error al buscar el usuario
    usuarioModel.findOne.mockRejectedValue(new Error("Error en la base de datos"));

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error en el servidor.' });
  });
});
