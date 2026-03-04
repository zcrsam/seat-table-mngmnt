// seatMapData.js
// Shared seat map data for both admin and client components

export const TABLE_T1 = {
  id: "T1",
  label: "Table 1",
  seats: [
    { id: "S15", num: 15, pos: "left", status: "reserved" },
    { id: "S13", num: 13, pos: "left", status: "available" },
    { id: "S11", num: 11, pos: "left", status: "available" },
    { id: "S9",  num: 9,  pos: "left", status: "available" },
    { id: "S7",  num: 7,  pos: "left", status: "available" },
    { id: "S5",  num: 5,  pos: "left", status: "available" },
    { id: "S3",  num: 3,  pos: "left", status: "available" },
    { id: "S16", num: 16, pos: "right", status: "pending" },
    { id: "S14", num: 14, pos: "right", status: "reserved" },
    { id: "S12", num: 12, pos: "right", status: "available" },
    { id: "S10", num: 10, pos: "right", status: "available" },
    { id: "S8",  num: 8,  pos: "right", status: "available" },
    { id: "S6",  num: 6,  pos: "right", status: "available" },
    { id: "S4",  num: 4,  pos: "right", status: "available" },
    { id: "S1",  num: 1,  pos: "bottom", status: "available" },
    { id: "S2",  num: 2,  pos: "bottom", status: "pending" },
  ],
  tableStatus: "available",
  capacity: 3,
};

export const SEAT_MAP_DATA = {
  "Main Wing": {
    "Alabang Function Room": TABLE_T1,
    "Laguna Ballroom": {
      id: "Laguna Ballroom",
      label: "Laguna Ballroom",
      tableStatus: "available",
      capacity: 12,
      seats: [
        { id: "LS1", num: 1, pos: "left", status: "available" },
        { id: "LS2", num: 2, pos: "left", status: "available" },
        { id: "LS3", num: 3, pos: "left", status: "reserved" },
        { id: "LS4", num: 4, pos: "right", status: "available" },
        { id: "LS5", num: 5, pos: "right", status: "available" },
        { id: "LS6", num: 6, pos: "right", status: "pending" },
        { id: "LS7", num: 7, pos: "bottom", status: "available" },
        { id: "LS8", num: 8, pos: "bottom", status: "available" },
      ]
    },
    "20/20 Function Room": {
      id: "20/20 Function Room",
      label: "20/20 Function Room",
      tableStatus: "available",
      capacity: 8,
      seats: [
        { id: "T1", num: 1, pos: "left", status: "available" },
        { id: "T2", num: 2, pos: "left", status: "available" },
        { id: "T3", num: 3, pos: "right", status: "pending" },
        { id: "T4", num: 4, pos: "right", status: "available" },
        { id: "T5", num: 5, pos: "bottom", status: "available" },
        { id: "T6", num: 6, pos: "bottom", status: "available" },
      ]
    },
    "Business Center": {
      id: "Business Center",
      label: "Business Center",
      tableStatus: "available",
      capacity: 6,
      seats: [
        { id: "B1", num: 1, pos: "left", status: "available" },
        { id: "B2", num: 2, pos: "left", status: "available" },
        { id: "B3", num: 3, pos: "right", status: "available" },
        { id: "B4", num: 4, pos: "right", status: "reserved" },
        { id: "B5", num: 5, pos: "bottom", status: "available" },
        { id: "B6", num: 6, pos: "bottom", status: "available" },
      ]
    }
  },
  "Tower Wing": {
    "Tower Ballroom": {
      id: "Tower Ballroom",
      label: "Tower Ballroom",
      tableStatus: "available",
      capacity: 15,
      seats: [
        { id: "TW1", num: 1, pos: "left", status: "available" },
        { id: "TW2", num: 2, pos: "left", status: "available" },
        { id: "TW3", num: 3, pos: "left", status: "pending" },
        { id: "TW4", num: 4, pos: "right", status: "available" },
        { id: "TW5", num: 5, pos: "right", status: "available" },
        { id: "TW6", num: 6, pos: "right", status: "available" },
        { id: "TW7", num: 7, pos: "bottom", status: "available" },
        { id: "TW8", num: 8, pos: "bottom", status: "available" },
        { id: "TW9", num: 9, pos: "bottom", status: "reserved" },
      ]
    },
    "Grand Ballroom": {
      id: "Grand Ballroom",
      label: "Grand Ballroom",
      tableStatus: "available",
      capacity: 20,
      seats: [
        { id: "GB1", num: 1, pos: "left", status: "available" },
        { id: "GB2", num: 2, pos: "left", status: "available" },
        { id: "GB3", num: 3, pos: "left", status: "available" },
        { id: "GB4", num: 4, pos: "right", status: "pending" },
        { id: "GB5", num: 5, pos: "right", status: "available" },
        { id: "GB6", num: 6, pos: "right", status: "available" },
        { id: "GB7", num: 7, pos: "bottom", status: "available" },
        { id: "GB8", num: 8, pos: "bottom", status: "available" },
        { id: "GB9", num: 9, pos: "bottom", status: "available" },
        { id: "GB10", num: 10, pos: "bottom", status: "reserved" },
      ]
    }
  },
  "Dining": {
    "Qsina": {
      id: "Qsina",
      label: "Qsina Restaurant",
      tableStatus: "available",
      capacity: 12,
      seats: [
        { id: "QS1", num: 1, pos: "left", status: "available" },
        { id: "QS2", num: 2, pos: "left", status: "available" },
        { id: "QS3", num: 3, pos: "left", status: "reserved" },
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
      seats: [
        { id: "HK1", num: 1, pos: "left", status: "available" },
        { id: "HK2", num: 2, pos: "left", status: "available" },
        { id: "HK3", num: 3, pos: "left", status: "available" },
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
      seats: [
        { id: "PC1", num: 1, pos: "left", status: "available" },
        { id: "PC2", num: 2, pos: "left", status: "available" },
        { id: "PC3", num: 3, pos: "left", status: "available" },
        { id: "PC4", num: 4, pos: "left", status: "pending" },
        { id: "PC5", num: 5, pos: "right", status: "available" },
        { id: "PC6", num: 6, pos: "right", status: "available" },
        { id: "PC7", num: 7, pos: "right", status: "available" },
        { id: "PC8", num: 8, pos: "bottom", status: "available" },
        { id: "PC9", num: 9, pos: "bottom", status: "reserved" },
        { id: "PC10", num: 10, pos: "bottom", status: "available" },
      ]
    }
  }
};
