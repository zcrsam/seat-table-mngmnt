// src/utils/seatMapData.js
// Default seat map data for the Alabang Function Room

export const TABLE_T1 = {
  id: "T1",
  label: "Table 1",
  tableStatus: "available",
  capacity: 8,
  x: 140,
  y: 80,
  width: 80,
  height: 240,
  seats: [
    { id: "s1",  num: 1, pos: "left",  status: "available" },
    { id: "s2",  num: 2, pos: "right", status: "available" },
    { id: "s3",  num: 3, pos: "left",  status: "available" },
    { id: "s4",  num: 4, pos: "right", status: "available" },
    { id: "s5",  num: 5, pos: "left",  status: "available" },
    { id: "s6",  num: 6, pos: "right", status: "available" },
    { id: "s7",  num: 7, pos: "left",  status: "available" },
    { id: "s8",  num: 8, pos: "right", status: "available" },
  ],
};

// Dining venues data with coordinates
export const DINING_DATA = {
  "Qsina": {
    id: "Qsina",
    label: "Qsina Restaurant",
    tableStatus: "available",
    capacity: 12,
    x: 140,
    y: 80,
    width: 100,
    height: 280,
    seats: [
      { id: "QS1", num: 1, pos: "left",  status: "available" },
      { id: "QS2", num: 2, pos: "left",  status: "available" },
      { id: "QS3", num: 3, pos: "left",  status: "reserved" },
      { id: "QS4", num: 4, pos: "right", status: "available" },
      { id: "QS5", num: 5, pos: "right", status: "available" },
      { id: "QS6", num: 6, pos: "right", status: "pending" },
      { id: "QS7", num: 7, pos: "bottom", status: "available" },
      { id: "QS8", num: 8, pos: "bottom", status: "available" },
      { id: "QS9", num: 9, pos: "bottom", status: "available" },
      { id: "QS10", num: 10, pos: "bottom", status: "available" },
      { id: "QS11", num: 11, pos: "bottom", status: "available" },
      { id: "QS12", num: 12, pos: "bottom", status: "available" },
    ]
  },
  "Hanakazu": {
    id: "Hanakazu",
    label: "Hanakazu Japanese Restaurant",
    tableStatus: "available",
    capacity: 8,
    x: 140,
    y: 80,
    width: 80,
    height: 200,
    seats: [
      { id: "HK1", num: 1, pos: "left",  status: "available" },
      { id: "HK2", num: 2, pos: "left",  status: "available" },
      { id: "HK3", num: 3, pos: "left",  status: "available" },
      { id: "HK4", num: 4, pos: "right", status: "reserved" },
      { id: "HK5", num: 5, pos: "right", status: "available" },
      { id: "HK6", num: 6, pos: "right", status: "available" },
      { id: "HK7", num: 7, pos: "bottom", status: "pending" },
      { id: "HK8", num: 8, pos: "bottom", status: "available" },
    ]
  },
  "Phoenix Court": {
    id: "Phoenix Court",
    label: "Phoenix Court Restaurant",
    tableStatus: "available",
    capacity: 10,
    x: 140,
    y: 80,
    width: 90,
    height: 240,
    seats: [
      { id: "PC1", num: 1, pos: "left",  status: "available" },
      { id: "PC2", num: 2, pos: "left",  status: "available" },
      { id: "PC3", num: 3, pos: "left",  status: "available" },
      { id: "PC4", num: 4, pos: "left",  status: "pending" },
      { id: "PC5", num: 5, pos: "right", status: "available" },
      { id: "PC6", num: 6, pos: "right", status: "available" },
      { id: "PC7", num: 7, pos: "right", status: "available" },
      { id: "PC8", num: 8, pos: "bottom", status: "available" },
      { id: "PC9", num: 9, pos: "bottom", status: "reserved" },
      { id: "PC10", num: 10, pos: "bottom", status: "available" },
    ]
  }
};