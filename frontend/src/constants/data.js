import mainWing from "../assets/main-wing.jpeg";
import towerWing from "../assets/tower-wing.jpeg";
import dining from "../assets/dining.jpeg";
import qsina from "../assets/qsina.jpeg";
import qsina2 from "../assets/qsina2.jpeg";
import qsina3 from "../assets/qsina3.jpeg";
import qsina4 from "../assets/qsina4.jpeg";
import hanakazu from "../assets/hanakazu.jpeg";
import hanakazu2 from "../assets/hanakazu2.jpeg";
import hanakazu3 from "../assets/hanakazu3.jpeg";
import hanakazu4 from "../assets/hanakazu4.avif";
import phoenixCourt from "../assets/phoenix-court.jpeg";
import phoenix2 from "../assets/pc2.jpeg";
import phoenix3 from "../assets/pc3.jpeg";
import phoenix4 from "../assets/pc4.jpeg";
import laguna from "../assets/laguna.jpeg";
import towerb from "../assets/towerb.jpeg";
import afc from "../assets/afc.jpeg";
import grandRoom from "../assets/grandr.jpg";
import twentyTwenty from "../assets/20-20.jpeg";
import bc from "../assets/bc.jpeg";

export const EVENT_CATEGORIES = [
  {
    id: "corporate",
    label: "Corporate Events",
    subtitle: "Meetings, conferences, and business functions",
    img: mainWing,
  },
  {
    id: "weddings",
    label: "Weddings",
    subtitle: "Ceremonies, receptions, and celebrations",
    img: towerWing,
  },
  {
    id: "social",
    label: "Social Gatherings",
    subtitle: "Birthdays, anniversaries, and special occasions",
    img: dining,
  },
  {
    id: "cultural",
    label: "Cultural Events",
    subtitle: "Art exhibits, performances, and showcases",
    img: qsina,
  },
];

export const VENUES = [
  {
    id: "alabang",
    name: "Alabang Ballroom",
    wing: "Main Wing",
    routeId: "alabang-ballroom",
    img: grandRoom,
    seats: 300,
    tables: 30,
    rooms: ["Alabang 1", "Alabang 2"],
  },
  {
    id: "laguna",
    name: "Laguna Ballroom",
    wing: "Main Wing",
    routeId: "laguna-ballroom",
    img: laguna,
    seats: 200,
    tables: 20,
    rooms: ["Laguna 1", "Laguna 2"],
  },
  {
    id: "twenty-twenty",
    name: "20/20 Function Room",
    wing: "Main Wing",
    routeId: "twenty-twenty",
    img: twentyTwenty,
    seats: 100,
    tables: 10,
    rooms: ["20/20"],
  },
  {
    id: "business-center",
    name: "Business Center",
    wing: "Main Wing",
    routeId: "business-center",
    img: bc,
    seats: 50,
    tables: 5,
    rooms: ["BC 1", "BC 2"],
  },
  {
    id: "tower-1",
    name: "Tower Ballroom 1",
    wing: "Tower Wing",
    routeId: "tower-ballroom-1",
    img: towerb,
    seats: 150,
    tables: 15,
    rooms: ["Tower 1", "Tower 2", "Tower 3"],
  },
  {
    id: "tower-2",
    name: "Tower Ballroom 2",
    wing: "Tower Wing",
    routeId: "tower-ballroom-2",
    img: towerb,
    seats: 120,
    tables: 12,
    rooms: ["Tower 4", "Tower 5", "Tower 6"],
  },
  {
    id: "qsina",
    name: "Qsina Restaurant",
    wing: "Dining",
    routeId: "qsina",
    img: qsina,
    seats: 80,
    tables: 8,
    rooms: [],
  },
  {
    id: "hanakazu",
    name: "Hanakazu Restaurant",
    wing: "Dining",
    routeId: "hanakazu",
    img: hanakazu,
    seats: 60,
    tables: 6,
    rooms: [],
  },
  {
    id: "phoenix-court",
    name: "Phoenix Court Restaurant",
    wing: "Dining",
    routeId: "phoenix-court",
    img: phoenixCourt,
    seats: 100,
    tables: 10,
    rooms: [],
  },
];

export const WINGS = ["Main Wing", "Tower Wing", "Dining"];

export const RESTAURANTS = [
  {
    id: "qsina",
    name: "Qsina",
    description: "Modern Chinese cuisine with a contemporary twist, featuring authentic flavors and innovative presentations in an elegant setting.",
    imgs: [qsina, qsina2, qsina3, qsina4],
    diningTimes: [
      { label: "Breakfast Buffet", hours: "6:00-10:00" },
      { label: "Lunch", hours: "11:00-14:00" },
      { label: "Dinner", hours: "18:00-22:00" },
    ],
  },
  {
    id: "hanakazu",
    name: "Hanakazu",
    description: "Traditional Japanese cuisine with fresh ingredients and masterful preparation, celebrating the art of Japanese dining.",
    imgs: [hanakazu, hanakazu2, hanakazu3, hanakazu4],
    diningTimes: [
      { label: "Light Lunch", hours: "13:00-17:00" },
      { label: "Dinner", hours: "17:00-20:00" },
      { label: "Dinner Buffet", hours: "20:00-22:00" },
    ],
  },
  {
    id: "phoenix-court",
    name: "Phoenix Court",
    description: "International buffet dining with a wide array of global cuisines, perfect for family gatherings and special occasions.",
    imgs: [phoenixCourt, phoenix2, phoenix3, phoenix4],
    diningTimes: [
      { label: "Breakfast", hours: "6:00-10:00" },
      { label: "Lunch Buffet", hours: "11:00-14:00" },
      { label: "Dinner Buffet", hours: "18:00-22:00" },
    ],
  },
];

export const DINING_TIMES = [
  { label: "Breakfast", hours: "6:00-10:00" },
  { label: "Lunch", hours: "11:00-14:00" },
  { label: "Dinner", hours: "18:00-22:00" },
  { label: "Breakfast Buffet", hours: "6:00-10:00" },
  { label: "Lunch Buffet", hours: "11:00-14:00" },
  { label: "Dinner Buffet", hours: "18:00-22:00" },
  { label: "Light Lunch", hours: "13:00-17:00" },
];
