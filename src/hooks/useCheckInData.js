// src/hooks/useCheckInData.js
import { useState } from 'react';

export const useCheckInData = () => {
  // Datos de habitaciones por piso
  const floorRooms = {
    1: [
      { number: 101, status: 'available' },
      { number: 102, status: 'available' },
      { number: 103, status: 'occupied' },
      { number: 104, status: 'available' },
      { number: 105, status: 'available' },
      { number: 106, status: 'available' },
      { number: 107, status: 'checkout' },
      { number: 108, status: 'available' },
      { number: 109, status: 'available' },
      { number: 110, status: 'available' },
      { number: 111, status: 'available' },
      { number: 112, status: 'available' }
    ],
    2: [
      { number: 201, status: 'available' },
      { number: 202, status: 'occupied' },
      { number: 203, status: 'available' },
      { number: 204, status: 'available' },
      { number: 205, status: 'checkout' },
      { number: 206, status: 'available' },
      { number: 207, status: 'available' },
      { number: 208, status: 'available' },
      { number: 209, status: 'occupied' },
      { number: 210, status: 'available' },
      { number: 211, status: 'available' },
      { number: 212, status: 'available' }
    ],
    3: [
      { number: 301, status: 'available' },
      { number: 302, status: 'available' },
      { number: 303, status: 'available' },
      { number: 304, status: 'occupied' },
      { number: 305, status: 'available' },
      { number: 306, status: 'checkout' },
      { number: 307, status: 'available' },
      { number: 308, status: 'available' },
      { number: 309, status: 'available' },
      { number: 310, status: 'available' },
      { number: 311, status: 'available' },
      { number: 312, status: 'available' }
    ]
  };

  // Tipos de snacks
  const snackTypes = [
    { id: 'frutas', name: 'FRUTAS', description: 'Frutas frescas y naturales' },
    { id: 'bebidas', name: 'BEBIDAS', description: 'Bebidas frías y calientes' },
    { id: 'snacks', name: 'SNACKS', description: 'Bocadillos y aperitivos' },
    { id: 'postres', name: 'POSTRES', description: 'Dulces y postres' }
  ];

  // Lista de snacks por tipo
  const snackItems = {
    frutas: [
      { id: 1, name: 'Manzana', price: 2.50 },
      { id: 2, name: 'Plátano', price: 1.50 },
      { id: 3, name: 'Naranja', price: 2.00 },
      { id: 4, name: 'Uvas', price: 4.00 },
      { id: 5, name: 'Ensalada de frutas', price: 6.00 }
    ],
    bebidas: [
      { id: 6, name: 'Agua', price: 1.00 },
      { id: 7, name: 'Coca Cola', price: 2.50 },
      { id: 8, name: 'Jugo de naranja', price: 3.00 },
      { id: 9, name: 'Café', price: 2.00 },
      { id: 10, name: 'Té', price: 1.50 }
    ],
    snacks: [
      { id: 11, name: 'Papas fritas', price: 3.50 },
      { id: 12, name: 'Galletas', price: 2.00 },
      { id: 13, name: 'Nueces', price: 4.50 },
      { id: 14, name: 'Chocolate', price: 3.00 },
      { id: 15, name: 'Chips', price: 2.50 }
    ],
    postres: [
      { id: 16, name: 'Helado', price: 4.00 },
      { id: 17, name: 'Torta', price: 5.50 },
      { id: 18, name: 'Flan', price: 3.50 },
      { id: 19, name: 'Brownie', price: 4.50 },
      { id: 20, name: 'Gelatina', price: 2.50 }
    ]
  };

  // Precios de habitaciones por piso
  const roomPrices = {
    1: 80.00,
    2: 95.00,
    3: 110.00
  };

  // Estado para órdenes guardadas
  const [savedOrders, setSavedOrders] = useState({
    103: {
      room: { number: 103, status: 'occupied' },
      roomPrice: 80.00,
      snacks: [
        { id: 6, name: 'Agua', price: 1.00, quantity: 2 },
        { id: 7, name: 'Coca Cola', price: 2.50, quantity: 1 },
        { id: 11, name: 'Papas fritas', price: 3.50, quantity: 1 }
      ],
      total: 88.00,
      checkInDate: '2024-06-24',
      guestName: 'Carlos González'
    },
    202: {
      room: { number: 202, status: 'occupied' },
      roomPrice: 95.00,
      snacks: [
        { id: 9, name: 'Café', price: 2.00, quantity: 3 },
        { id: 16, name: 'Helado', price: 4.00, quantity: 2 }
      ],
      total: 109.00,
      checkInDate: '2024-06-23',
      guestName: 'María López'
    },
    304: {
      room: { number: 304, status: 'occupied' },
      roomPrice: 110.00,
      snacks: [
        { id: 1, name: 'Manzana', price: 2.50, quantity: 1 },
        { id: 8, name: 'Jugo de naranja', price: 3.00, quantity: 2 }
      ],
      total: 118.50,
      checkInDate: '2024-06-22',
      guestName: 'Ana Martínez'
    }
  });

  return {
    floorRooms,
    snackTypes,
    snackItems,
    roomPrices,
    savedOrders,
    setSavedOrders
  };
};