const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Ajusta la ruta de tu app

beforeAll(async () => {
  const DB_URI = process.env.DB_URI;
  await mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Pruebas del método POST /api/consecutivoCaso", () => {

  let token;

  test("Debería crear un nuevo consecutivo si no existe uno para el mes/año actual", async () => {
    const response = await request(app)
      .post('/api/consecutivoCaso')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.yearMonth).toBe(currentYearMonth);
    expect(response.body.sequence).toBe(1);
  });

  test("Debería incrementar el consecutivo si ya existe uno para el mes/año actual", async () => {
    const response = await request(app)
      .post('/api/consecutivoCaso')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.sequence).toBeGreaterThan(1);
  });

});
