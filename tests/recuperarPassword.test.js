const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Ajusta según la ruta de tu aplicación
const { usuarioModel } = require('../models');

beforeAll(async () => {
  // Conectar a la base de datos antes de todas las pruebas
  const DB_URI = process.env.DB_URI;
  await mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Desconectar de la base de datos después de todas las pruebas
  await mongoose.disconnect();
});

describe('Pruebas del método forgotPassword', () => {
  
  let testUser;

  beforeEach(async () => {
    // Crear un usuario de prueba antes de cada test
    testUser = await usuarioModel.create({
      correo: 'usuario@ejemplo.com',
      nombre: 'Usuario de Prueba',
      password: 'usuario1234',
      telefono:'3012548974',
      rol:'funcionario',
      resetPasswordToken: '',
      resetPasswordExpires: ''
    });
  });

  afterEach(async () => {
    // Limpiar la colección de usuarios después de cada prueba
    await usuarioModel.deleteMany({});
  });

  test('Debería responder con un 400 si no se proporciona el correo', async () => {
    const response = await request(app)
      .post('/api/forgotPassword') // Ajustar la ruta
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Correo electrónico es requerido');
  });

  test('Debería responder con un 404 si el usuario no es encontrado', async () => {
    const response = await request(app)
      .post('/api/forgotPassword')
      .send({ correo: 'usuario@noexiste.com' });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Usuario no encontrado');
  });

  test('Debería generar un token, guardarlo y enviar el correo correctamente', async () => {
    const response = await request(app)
      .post('/api/forgotPassword')
      .send({ correo: 'usuario@ejemplo.com' });

    const updatedUser = await usuarioModel.findOne({ correo: 'usuario@ejemplo.com' });

    expect(response.statusCode).toBe(200);
    
    // Verificar que el token fue generado y guardado en el usuario
    expect(updatedUser.resetPasswordToken).toBeDefined();
    expect(updatedUser.resetPasswordExpires).toBeDefined();
  });

  test('Debería responder con un 500 si ocurre un error en el proceso', async () => {
    // Simular un error desconectando la base de datos
    await mongoose.disconnect();

    const response = await request(app)
      .post('/api/forgotPassword')
      .send({ correo: 'usuario@ejemplo.com' });

    expect(response.statusCode).toBe(500);

    // Reconectar la base de datos para otras pruebas
    const DB_URI = process.env.DB_URI;
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

});
