const { 
    getSolicitud, 
    getSolicitudId, 
    getSolicitudesPendientes, 
    crearSolicitud, 
    asignarTecnicoSolicitud, 
    getSolicitudesAsignadas 
  } = require('../path/to/controller');
  
  const { solicitudModel, storageModel, usuarioModel, ambienteModel } = require('../models');
  const transporter = require('../utils/handleEmail');
  const { postConsecutivoCaso } = require('../controllers/consecutivoCaso');
  const { handleHttpError } = require('../utils/handleError');
  
  // Mockear el modelo y las dependencias
  jest.mock('../models');
  jest.mock('../utils/handleEmail');
  jest.mock('../controllers/consecutivoCaso');
  jest.mock('../utils/handleError');
  
  describe('Pruebas del controlador de solicitudes', () => {
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe('getSolicitud', () => {
      test('Debería obtener todas las solicitudes correctamente', async () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        const mockData = [{ descripcion: 'Test', fecha: '2023-01-01', estado: 'solicitado' }];
        solicitudModel.find.mockResolvedValue(mockData);
  
        await getSolicitud(req, res);
  
        expect(solicitudModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'solicitud consultado exitosamente', data: mockData });
      });
  
      test('Debería manejar errores al obtener solicitudes', async () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        solicitudModel.find.mockRejectedValue(new Error('Error'));
  
        await getSolicitud(req, res);
  
        expect(handleHttpError).toHaveBeenCalledWith(res, 'error al obtener datos');
      });
    });
  
    describe('getSolicitudId', () => {
      test('Debería obtener una solicitud por ID', async () => {
        const req = { params: { id: '123' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        const mockData = { descripcion: 'Test', fecha: '2023-01-01', estado: 'solicitado' };
        solicitudModel.findById.mockResolvedValue(mockData);
  
        await getSolicitudId(req, res);
  
        expect(solicitudModel.findById).toHaveBeenCalledWith('123');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'solicitud consultado exitosamente', data: mockData });
      });
  
      test('Debería manejar un error si no encuentra la solicitud', async () => {
        const req = { params: { id: '123' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        solicitudModel.findById.mockResolvedValue(null);
  
        await getSolicitudId(req, res);
  
        expect(handleHttpError).toHaveBeenCalledWith(res, 'solicitud no encontrado');
      });
    });
  
    describe('getSolicitudesPendientes', () => {
      test('Debería obtener solicitudes pendientes correctamente', async () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        const mockData = [{ descripcion: 'Test', estado: 'solicitado' }];
        solicitudModel.find.mockResolvedValue(mockData);
  
        await getSolicitudesPendientes(req, res);
  
        expect(solicitudModel.find).toHaveBeenCalledWith({ estado: 'solicitado' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: mockData });
      });
  
      test('Debería manejar errores al obtener solicitudes pendientes', async () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        solicitudModel.find.mockRejectedValue(new Error('Error'));
  
        await getSolicitudesPendientes(req, res);
  
        expect(handleHttpError).toHaveBeenCalledWith(res, 'Error al obtener datos');
      });
    });
  
    describe('crearSolicitud', () => {
      test('Debería crear una solicitud correctamente', async () => {
        const req = {
          body: { descripcion: 'Nueva solicitud', ambiente: 'ambienteId' },
          file: { filename: 'test.png' },
          usuario: { _id: 'userId' }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn()
        };
  
        const mockAmbiente = { _id: 'ambienteId', activo: true };
        const mockStorage = { _id: 'fotoId', filename: 'test.png', url: 'http://localhost:3010/test.png' };
        const mockUsuario = { _id: 'userId', nombre: 'Test', correo: 'test@example.com' };
        const mockSolicitud = { _id: 'solicitudId', descripcion: 'Nueva solicitud' };
  
        ambienteModel.findOne.mockResolvedValue(mockAmbiente);
        storageModel.create.mockResolvedValue(mockStorage);
        postConsecutivoCaso.mockResolvedValue('CASO123');
        solicitudModel.create.mockResolvedValue(mockSolicitud);
        usuarioModel.findById.mockResolvedValue(mockUsuario);
        transporter.sendMail.mockResolvedValue(true);
  
        await crearSolicitud(req, res);
  
        expect(ambienteModel.findOne).toHaveBeenCalledWith({ _id: 'ambienteId', activo: true });
        expect(storageModel.create).toHaveBeenCalledWith({ filename: 'test.png', url: 'http://localhost:3010/test.png' });
        expect(solicitudModel.create).toHaveBeenCalledWith(expect.objectContaining({
          usuario: 'userId',
          foto: 'fotoId',
          codigoCaso: 'CASO123',
          estado: 'solicitado'
        }));
        expect(transporter.sendMail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ message: 'Registro de solicitud exitoso', solicitud: mockSolicitud });
      });
  
      test('Debería manejar errores al crear una solicitud', async () => {
        const req = {
          body: { descripcion: 'Nueva solicitud', ambiente: 'ambienteId' },
          file: { filename: 'test.png' },
          usuario: { _id: 'userId' }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn()
        };
  
        ambienteModel.findOne.mockRejectedValue(new Error('Error'));
  
        await crearSolicitud(req, res);
  
        expect(handleHttpError).toHaveBeenCalledWith(res, 'Error al registrar solicitud');
      });
    });
  
    describe('asignarTecnicoSolicitud', () => {
      test('Debería asignar un técnico correctamente', async () => {
        const req = {
          params: { id: 'solicitudId' },
          body: { tecnico: 'tecnicoId' }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        const mockSolicitud = { _id: 'solicitudId', tecnico: null, estado: 'solicitado', save: jest.fn() };
        const mockTecnico = { _id: 'tecnicoId', nombre: 'Tecnico', correo: 'tecnico@example.com' };
  
        solicitudModel.findById.mockResolvedValue(mockSolicitud);
        usuarioModel.findOne.mockResolvedValue(mockTecnico);
        usuarioModel.findById.mockResolvedValue(mockTecnico);
        transporter.sendMail.mockResolvedValue(true);
  
        await asignarTecnicoSolicitud(req, res);
  
        expect(solicitudModel.findById).toHaveBeenCalledWith('solicitudId');
        expect(usuarioModel.findOne).toHaveBeenCalledWith({ _id: 'tecnicoId', rol: 'tecnico', estado: true });
        expect(mockSolicitud.save).toHaveBeenCalled();
        expect(transporter.sendMail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Técnico asignado exitosamente', solicitud: mockSolicitud });
      });
  
      test('Debería manejar errores al asignar técnico', async () => {
        const req = {
          params: { id: 'solicitudId' },
          body: { tecnico: 'tecnicoId' }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
  
        solicitudModel.findById.mockRejectedValue(new Error('Error'));
  
        await asignarTecnicoSolicitud(req, res);
  
        expect(handleHttpError).toHaveBeenCalledWith(res, 'Error al asignar técnico');
      });
    });
  });
  