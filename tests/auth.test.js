const request = require('supertest');
const app = require('../app');  // Aquí importas tu aplicación de Express
const { usuarioModel } = require('../models');  // Asegúrate de importar el modelo de usuario
const { token } = require('morgan');
const { response } = require('express');

// Aquí creamos la variable que va a tener los datos del inicio de sesión 

var tokenL = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmYxOTg0ZWJjNjczNzIzMWE0NWRhMDMiLCJyb2wiOiJmdW5jaW9uYXJpbyIsImlhdCI6MTcyNzIzMTg2MSwiZXhwIjoxNzI3MjM5MDYxfQ.qgh8m_rpyy6BMTPrwD4w7ycLlilKbhgkd_KuEu1UYQA"
const usuarioNuevo = {
  password: "123456H",
  confirmPassword: "123456H",
  rol: "funcionario",
  correo: "nuevo1.fun@example.com",
  nombre: "Nuevo1 Funcionario",
  telefono: "3107417929"
};

const credenciales = {
  correo: usuarioNuevo.correo,
  password: usuarioNuevo.password
};

describe("Pruebas para el controlador de registro", () => {
  

  test("Debería registrar un nuevo usuario correctamente", async () => {
    const response = await request(app)
      .post('/api/auth/register')  // Cambia la ruta según sea tu API
      .send(usuarioNuevo);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.data.user).toHaveProperty('correo', usuarioNuevo.correo);
  });

  test("Debería devolver error si las contraseñas no coinciden", async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...usuarioNuevo, confirmPassword: "otraContrasena" });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Las contraseñas no coinciden');
  });
});

describe("Pruebas para el controlador de login", () => {

  test("Debería iniciar sesión correctamente con credenciales válidas", async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send(credenciales);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('dataUser.token');
    tokenL = response.body.dataUser.token
  });


  test("Debería devolver error si la contraseña es incorrecta", async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ ...credenciales, password: "contrasenaIncorrecta" });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'contraseña incorrecta');
  });

  test("Debería devolver error si el usuario no existe", async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send(credenciales);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'usuario no existe');
  });

});


