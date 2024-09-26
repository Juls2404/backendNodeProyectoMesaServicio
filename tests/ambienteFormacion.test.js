const request = require('supertest');
const app = require('../app');
// Aquí debe ir el token generado en el back
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmUyZmMzM2VmOWMyODNlYjJhN2NjOTEiLCJyb2wiOiJsaWRlciIsImlhdCI6MTcyNzExMzYwMSwiZXhwIjoxNzI3MTIwODAxfQ.ptnDc5C3keX-T-bQFEvT-GO0OZsfweVY_thWcx-ykbg"; 

// Aquí pongo el ID del ambiente para hacer las pruebas
var ambienteId = '66e30180ef9c283eb2a7cc94'; 

// Aquí creo un objeto con los datos del ambiente
const ambienteNuevo = {
  nombre: "Laboratorio de Informática",
  activo: true
};

// Aquí creo otro objeto con los datos que voy a actualizar 
const actualizarAmbiente = {
  nombre: "ADSI 5",
  activo: true
}

describe("Pruebas método get Ambiente Formación con token preexistente", () => {
  test("Debería responder con un 200 si el token es válido", async () => {
    // Hacer la petición con el token pegado directamente
    const response = await request(app)
      .get("/api/ambienteFormacion")
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });

  test("Debería responder con un 401 si el token es inválido", async () => {

    const response = await request(app)
      .get("/api/ambienteFormacion")
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(401); 
  });
});

describe("Pruebas método get Ambiente Formación por ID con token preexistente", () => {

  test("Debería responder con un 200 y traer el ambiente si el token es válido y el ID existe", async () => {
    
    const response = await request(app)
      .get(`/api/ambienteFormacion/${ambienteId}`)  
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('_id', ambienteId);  
  });

  test("Debería responder con un 400 si el ID de ambiente es inválido", async () => {

    const response = await request(app)
      .get(`/api/ambienteFormacion/${ambienteId}`)      
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(400);  

  });

  test("Debería responder con un 404 si el ambiente no existe", async () => {

    const response = await request(app)
      .get(`/api/ambienteFormacion/${ambienteId}`)  
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);  
  });
});

describe("Pruebas para verificar el manejo de datos de los ambientes", () => {

  // Aquí estamos creando un nuevo ambiente de formación 
  test("Debería crear un nuevo ambiente de formación", async () => {
      const response = await request(app)
        .post(`/api/ambienteFormacion/`)
        .set('Authorization', `Bearer ${token}`) 
        .send(ambienteNuevo);  

      expect(response.statusCode).toBe(201); 
      expect(response.body.data).toHaveProperty('_id');  // 
      expect(response.body.data.nombre).toBe(ambienteNuevo.nombre); 
      
      // Aquí estamos cambiando la variable ID para que se actualice por el ID del ambiente que acabamos de crear.
      ambienteId = response.body.data._id
      console.log(ambienteId)
  });
  //Aquí estamos actualizando el nombre del ambiente que acabamos de crear 
  test("Debería actualizar el ambiente de formación", async () =>{
    // Recuerde que aquí estamos trabajando con la variable ID modificada, no con la del inicio sino con el ID recien creado
    const response = await request(app)
      .put (`/api/ambienteFormacion/${ambienteId}`)
      .set ('Authorization', `Bearer ${token}`)
      .send (actualizarAmbiente);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('_id');
    console.log (response.body.data._id)
    expect(response.body.data.nombre).toBe(actualizarAmbiente.nombre);
  })

  test ("Debería eliminar el ambiente de formación", async () =>{
    const response = await request(app)
      .delete(`/api/ambienteFormacion/${ambienteId}`)
      .set('Authorization', `Bearer ${token}`)
      
      expect(response.statusCode).toBe(200);
      
      if (response.body.data){
        expect(response.body.data).toHaveProperty('_id');
      }else{
        expect(response.body).toHaveProperty('message', `Ambiente de formación ${ambienteId} ha sido desactivado`);
      }

  })

});
