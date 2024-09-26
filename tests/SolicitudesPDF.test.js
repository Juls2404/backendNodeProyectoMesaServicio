const { solicitudModel } = require("../models");
const { handleHttpError } = require("../utils/handleError");
const { getSolicitudesPorMes, fetchSolicitudesPorMes } = require('../controllers/solicitudesController');

// Mockear el modelo y las dependencias
jest.mock('../models');
jest.mock('../utils/handleError');

describe('Pruebas del controlador de solicitudes por mes', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSolicitudesPorMes', () => {
    test('Debería obtener correctamente el total de solicitudes por mes y las solicitudes detalladas', async () => {
      // Datos simulados para las pruebas
      const mockTotalPorMes = [
        { _id: 1, cantidad: 5 },
        { _id: 2, cantidad: 3 }
      ];
      const mockAllSolicitudes = [
        { _id: 'solicitud1', usuario: { nombre: 'Usuario 1' }, ambiente: { nombre: 'Ambiente 1' }, tecnico: { nombre: 'Tecnico 1' } },
        { _id: 'solicitud2', usuario: { nombre: 'Usuario 2' }, ambiente: { nombre: 'Ambiente 2' }, tecnico: { nombre: 'Tecnico 2' } }
      ];

      // Mockear las respuestas de las consultas
      solicitudModel.aggregate.mockResolvedValue(mockTotalPorMes);
      solicitudModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAllSolicitudes)
      });

      const result = await fetchSolicitudesPorMes();

      // Verificar que las funciones de agregación y búsqueda se llamen correctamente
      expect(solicitudModel.aggregate).toHaveBeenCalledWith([
        { $group: { _id: { $month: "$fecha" }, cantidad: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
      ]);

      expect(solicitudModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual({ totalPorMes: mockTotalPorMes, allSolicitudes: mockAllSolicitudes });
    });

    test('Debería lanzar un error si ocurre algún problema', async () => {
      solicitudModel.aggregate.mockRejectedValue(new Error('Error'));
      
      await expect(fetchSolicitudesPorMes()).rejects.toThrow('Error al obtener los datos de las solicitudes');
    });
  });

  describe('getSolicitudesPorMes', () => {
    test('Debería responder con éxito al obtener los datos correctamente', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockData = {
        totalPorMes: [{ _id: 1, cantidad: 5 }],
        allSolicitudes: [{ _id: 'solicitud1', usuario: { nombre: 'Usuario 1' }, ambiente: { nombre: 'Ambiente 1' }, tecnico: { nombre: 'Tecnico 1' } }]
      };

      // Mockear la función `fetchSolicitudesPorMes` para devolver los datos simulados
      jest.spyOn(global, 'fetchSolicitudesPorMes').mockResolvedValue(mockData);

      await getSolicitudesPorMes(req, res);

      expect(fetchSolicitudesPorMes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Datos obtenidos correctamente", data: mockData });
    });

    test('Debería manejar errores correctamente', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mockear la función `fetchSolicitudesPorMes` para que lance un error
      jest.spyOn(global, 'fetchSolicitudesPorMes').mockRejectedValue(new Error('Error'));

      await getSolicitudesPorMes(req, res);

      expect(fetchSolicitudesPorMes).toHaveBeenCalled();
      expect(handleHttpError).toHaveBeenCalledWith(res, 'Error');
    });
  });
});
