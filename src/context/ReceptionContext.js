// src/context/ReceptionContext.js
import React, { createContext, useContext, useReducer } from 'react';

const ReceptionContext = createContext();

const receptionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ARRIVALS':
      return { ...state, arrivals: action.payload };
    case 'SET_DEPARTURES':
      return { ...state, departures: action.payload };
    case 'UPDATE_ROOM_STATUS':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.number === action.payload.roomNumber
            ? { ...room, status: action.payload.status }
            : room
        )
      };
    default:
      return state;
  }
};

export const ReceptionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(receptionReducer, {
    arrivals: [],
    departures: [],
    rooms: [],
    notifications: []
  });

  return (
    <ReceptionContext.Provider value={{ state, dispatch }}>
      {children}
    </ReceptionContext.Provider>
  );
};

export const useReceptionContext = () => {
  const context = useContext(ReceptionContext);
  if (!context) {
    throw new Error('useReceptionContext must be used within ReceptionProvider');
  }
  return context;
};