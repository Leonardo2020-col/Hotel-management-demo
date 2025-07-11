// utils/suppliesMockData.js

export const suppliesMockData = () => {
  const categories = [
    'Limpieza',
    'Amenidades',
    'Lencería',
    'Mantenimiento',
    'Oficina',
    'Cocina',
    'Seguridad',
    'Jardinería'
  ];

  const suppliers = [
    'Proveedora Hotelera SAC',
    'Distribuidora Lima Norte',
    'Suministros Industriales Perú',
    'Comercial San Martín',
    'Importadora Global',
    'Textiles del Sur',
    'Química Nacional',
    'Equipos y Más'
  ];

  const supplies = [
    {
      id: '1',
      name: 'Toallas de baño blancas',
      description: 'Toallas de algodón 100%, tamaño estándar 70x140cm',
      sku: 'TOA-BLA-001',
      category: 'Lencería',
      supplier: 'Textiles del Sur',
      unit: 'unidad',
      unitPrice: 25.50,
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      location: 'Almacén Principal - A1',
      notes: 'Cambiar proveedor si la calidad baja',
      lastUpdated: '2025-06-20T10:30:00Z',
      createdAt: '2025-01-15T09:00:00Z'
    },
    {
      id: '2',
      name: 'Shampoo premium 30ml',
      description: 'Shampoo en botella individual para huéspedes',
      sku: 'SHA-PRE-030',
      category: 'Amenidades',
      supplier: 'Proveedora Hotelera SAC',
      unit: 'unidad',
      unitPrice: 1.80,
      currentStock: 320,
      minStock: 100,
      maxStock: 500,
      location: 'Almacén Principal - B2',
      notes: 'Revisar fecha de vencimiento',
      lastUpdated: '2025-06-22T14:15:00Z',
      createdAt: '2025-02-01T11:30:00Z'
    },
    {
      id: '3',
      name: 'Detergente multiusos 5L',
      description: 'Detergente concentrado para limpieza general',
      sku: 'DET-MUL-005',
      category: 'Limpieza',
      supplier: 'Química Nacional',
      unit: 'litros',
      unitPrice: 45.00,
      currentStock: 8,
      minStock: 10,
      maxStock: 50,
      location: 'Almacén Químicos - C1',
      notes: 'Stock bajo - reabastecer urgente',
      lastUpdated: '2025-06-24T08:45:00Z',
      createdAt: '2025-01-20T16:00:00Z'
    },
    {
      id: '4',
      name: 'Papel higiénico premium',
      description: 'Papel higiénico de doble hoja, 24 rollos por paquete',
      sku: 'PAP-HIG-024',
      category: 'Amenidades',
      supplier: 'Distribuidora Lima Norte',
      unit: 'paquete',
      unitPrice: 32.00,
      currentStock: 15,
      minStock: 8,
      maxStock: 40,
      location: 'Almacén Principal - A3',
      notes: 'Marca reconocida, buena calidad',
      lastUpdated: '2025-06-23T12:20:00Z',
      createdAt: '2025-02-10T10:15:00Z'
    },
    {
      id: '5',
      name: 'Sábanas queen blancas',
      description: 'Juego de sábanas algodón percal 200 hilos',
      sku: 'SAB-QUE-200',
      category: 'Lencería',
      supplier: 'Textiles del Sur',
      unit: 'juego',
      unitPrice: 89.90,
      currentStock: 0,
      minStock: 12,
      maxStock: 36,
      location: 'Almacén Principal - A2',
      notes: 'AGOTADO - Reorden inmediato',
      lastUpdated: '2025-06-24T07:30:00Z',
      createdAt: '2025-01-25T14:45:00Z'
    },
    {
      id: '6',
      name: 'Acondicionador premium 30ml',
      description: 'Acondicionador en botella individual para huéspedes',
      sku: 'ACO-PRE-030',
      category: 'Amenidades',
      supplier: 'Proveedora Hotelera SAC',
      unit: 'unidad',
      unitPrice: 1.95,
      currentStock: 280,
      minStock: 100,
      maxStock: 500,
      location: 'Almacén Principal - B2',
      notes: 'Mismo proveedor que shampoo',
      lastUpdated: '2025-06-22T14:15:00Z',
      createdAt: '2025-02-01T11:30:00Z'
    },
    {
      id: '7',
      name: 'Desinfectante multiuso 1L',
      description: 'Desinfectante antibacterial para superficies',
      sku: 'DES-MUL-001',
      category: 'Limpieza',
      supplier: 'Química Nacional',
      unit: 'litros',
      unitPrice: 18.50,
      currentStock: 25,
      minStock: 15,
      maxStock: 60,
      location: 'Almacén Químicos - C2',
      notes: 'Certificado sanitario vigente',
      lastUpdated: '2025-06-21T16:40:00Z',
      createdAt: '2025-03-05T09:20:00Z'
    },
    {
      id: '8',
      name: 'Bombillas LED 15W',
      description: 'Bombillas LED blanco cálido, rosca E27',
      sku: 'BOM-LED-015',
      category: 'Mantenimiento',
      supplier: 'Equipos y Más',
      unit: 'unidad',
      unitPrice: 12.00,
      currentStock: 35,
      minStock: 20,
      maxStock: 80,
      location: 'Almacén Técnico - D1',
      notes: 'Duración 25,000 horas',
      lastUpdated: '2025-06-20T11:10:00Z',
      createdAt: '2025-02-15T13:25:00Z'
    }
  ];

  const consumptionHistory = [
    {
      id: 'c1',
      supplyId: '1',
      supplyName: 'Toallas de baño blancas',
      quantity: 5,
      unitPrice: 25.50,
      reason: 'Reposición habitaciones piso 2',
      consumedBy: 'María González',
      department: 'Housekeeping',
      roomNumber: '201-205',
      timestamp: '2025-06-24T08:30:00Z',
      type: 'consumption'
    },
    {
      id: 'c2',
      supplyId: '2',
      supplyName: 'Shampoo premium 30ml',
      quantity: 24,
      unitPrice: 1.80,
      reason: 'Reposición amenidades habitaciones',
      consumedBy: 'Carlos Ruiz',
      department: 'Housekeeping',
      roomNumber: 'Piso 3 completo',
      timestamp: '2025-06-24T07:15:00Z',
      type: 'consumption'
    },
    {
      id: 'c3',
      supplyId: '3',
      supplyName: 'Detergente multiusos 5L',
      quantity: 2,
      unitPrice: 45.00,
      reason: 'Limpieza áreas comunes',
      consumedBy: 'Ana Torres',
      department: 'Limpieza',
      roomNumber: 'Lobby y restaurante',
      timestamp: '2025-06-23T15:45:00Z',
      type: 'consumption'
    },
    {
      id: 'c4',
      supplyId: '4',
      supplyName: 'Papel higiénico premium',
      quantity: 3,
      unitPrice: 32.00,
      reason: 'Reposición baños públicos',
      consumedBy: 'Luis Mendoza',
      department: 'Mantenimiento',
      roomNumber: 'Baños lobby',
      timestamp: '2025-06-23T10:20:00Z',
      type: 'consumption'
    },
    {
      id: 'c5',
      supplyId: '6',
      supplyName: 'Acondicionador premium 30ml',
      quantity: 20,
      unitPrice: 1.95,
      reason: 'Reposición amenidades',
      consumedBy: 'María González',
      department: 'Housekeeping',
      roomNumber: '301-310',
      timestamp: '2025-06-22T16:00:00Z',
      type: 'consumption'
    },
    {
      id: 'c6',
      supplyId: '7',
      supplyName: 'Desinfectante multiuso 1L',
      quantity: 1,
      unitPrice: 18.50,
      reason: 'Desinfección ascensores',
      consumedBy: 'Carlos Ruiz',
      department: 'Limpieza',
      roomNumber: 'Ascensores A y B',
      timestamp: '2025-06-22T14:30:00Z',
      type: 'consumption'
    },
    {
      id: 'c7',
      supplyId: '8',
      supplyName: 'Bombillas LED 15W',
      quantity: 2,
      unitPrice: 12.00,
      reason: 'Reemplazo bombillas quemadas',
      consumedBy: 'Luis Mendoza',
      department: 'Mantenimiento',
      roomNumber: '102, 205',
      timestamp: '2025-06-21T11:15:00Z',
      type: 'consumption'
    }
  ];

  const stats = {
    totalSupplies: supplies.length,
    lowStockItems: supplies.filter(s => s.currentStock <= s.minStock && s.currentStock > 0).length,
    outOfStockItems: supplies.filter(s => s.currentStock === 0).length,
    totalValue: supplies.reduce((sum, s) => sum + (s.currentStock * s.unitPrice), 0),
    monthlyConsumption: consumptionHistory.reduce((sum, c) => sum + (c.quantity * c.unitPrice), 0),
    categoriesCount: categories.length,
    suppliersCount: suppliers.length,
    recentConsumptions: consumptionHistory.filter(c => {
      const date = new Date(c.timestamp);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length
  };

  return {
    supplies,
    categories,
    suppliers,
    consumptionHistory,
    stats
  };
};