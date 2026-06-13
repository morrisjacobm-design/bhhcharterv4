import { useState, useEffect, useMemo } from "react";
import { Analytics } from "@vercel/analytics/react";

/* ═══════════════════════ Default data ═══════════════════════ */

const DEFAULT_AIRCRAFT = [
  { id: "r44", name: "Robinson R44", speed: 100, rate: 850, maxPax: 3 },
  { id: "b206", name: "Bell 206B JetRanger", speed: 110, rate: 1500, maxPax: 4 },
  { id: "b206l", name: "Bell 206L LongRanger", speed: 130, rate: 2500, maxPax: 6 },
];

const DEFAULT_FEES = {
  opsFee: 300,
  opsFeeShortNotice: 500,
  groundWaitRate: 300,
  legBufferMin: 6,
  taxRate: 7.5, // % applied to the booking subtotal
  paxFee: 5.2, // $ per passenger
};

const LOGO_URL = "https://bluehillhelicopters.com/wp-content/uploads/2025/09/heli-logo-white-shadow-xl-300x73.png";

const DEFAULT_COMPANY = {
  name: "Blue Hill Helicopters",
  tagline: "Boston's Aviation Company",
  logoUrl: LOGO_URL,
  phone: "781-688-0263",
  email: "info@bluehillhelicopters.com",
  address: "125 Access Road, Norwood, MA 02062",
  base: "Norwood Memorial Airport (KOWD)",
  terms:
    "This quotation is valid for 14 days from the date of issue. All flights are subject to aircraft availability, weather, and pilot duty limitations. Final pricing may vary with actual flight time flown, ramp/landing fees assessed by destination facilities, and fuel surcharges. A deposit may be required to confirm booking. Cancellations within 48 hours of departure may be subject to a cancellation fee.",
};

/* [icao, name, lat, lon, defaultLandingFee, region] */
const RAW_LOCATIONS = [
  // ── Massachusetts ──
  ["KBOS", "Boston Logan Intl", 42.3643, -71.0052, 250, "MA"],
  ["KOWD", "Norwood Memorial", 42.1905, -71.1729, 0, "MA"],
  ["KBED", "Hanscom Field (Bedford)", 42.47, -71.289, 100, "MA"],
  ["KBVY", "Beverly Regional", 42.5842, -70.9165, 0, "MA"],
  ["KLWM", "Lawrence Municipal", 42.7172, -71.1234, 0, "MA"],
  ["2B2", "Plum Island (Newburyport)", 42.7954, -70.8394, 0, "MA"],
  ["6B6", "Minute Man Air Field (Stow)", 42.4603, -71.5179, 0, "MA"],
  ["KFIT", "Fitchburg Municipal", 42.5541, -71.759, 0, "MA"],
  ["3B3", "Sterling Airport", 42.4259, -71.7933, 0, "MA"],
  ["KORH", "Worcester Regional", 42.2673, -71.8757, 50, "MA"],
  ["60M", "Spencer Airport", 42.2899, -71.9637, 0, "MA"],
  ["KGDM", "Gardner Municipal", 42.55, -72.0161, 0, "MA"],
  ["KORE", "Orange Municipal", 42.57, -72.2885, 0, "MA"],
  ["8B5", "Tanner-Hiller (Barre)", 42.354, -72.1153, 0, "MA"],
  ["3B0", "Southbridge Municipal", 42.1008, -72.0784, 0, "MA"],
  ["1B6", "Hopedale Industrial Park", 42.1108, -71.51, 0, "MA"],
  ["1B9", "Mansfield Municipal", 42.0001, -71.1968, 0, "MA"],
  ["KTAN", "Taunton Municipal", 41.8744, -71.0166, 0, "MA"],
  ["KPYM", "Plymouth Municipal", 41.909, -70.7287, 0, "MA"],
  ["KGHG", "Marshfield Municipal", 42.0983, -70.6722, 0, "MA"],
  ["KEWB", "New Bedford Regional", 41.6761, -70.9569, 0, "MA"],
  ["5B6", "Falmouth Airpark", 41.5859, -70.5406, 0, "MA"],
  ["KHYA", "Cape Cod Gateway (Hyannis)", 41.6693, -70.2803, 40, "MA"],
  ["2B1", "Cape Cod Airfield (Marstons Mills)", 41.68, -70.4019, 0, "MA"],
  ["KCQX", "Chatham Municipal", 41.6884, -69.9898, 0, "MA"],
  ["KPVC", "Provincetown Municipal", 42.0719, -70.2214, 25, "MA"],
  ["KACK", "Nantucket Memorial", 41.2531, -70.0602, 60, "MA"],
  ["KMVY", "Martha's Vineyard", 41.3931, -70.6143, 50, "MA"],
  ["1B2", "Katama Airpark (Edgartown)", 41.358, -70.523, 0, "MA"],
  ["7B2", "Northampton Airport", 42.328, -72.6114, 0, "MA"],
  ["0B5", "Turners Falls Airport", 42.5914, -72.5227, 0, "MA"],
  ["KBAF", "Westfield-Barnes Regional", 42.1578, -72.7156, 0, "MA"],
  ["KCEF", "Westover Metropolitan (Chicopee)", 42.194, -72.5348, 50, "MA"],
  ["KPSF", "Pittsfield Municipal", 42.4268, -73.2929, 0, "MA"],
  ["KAQW", "Harriman-and-West (North Adams)", 42.6959, -73.1703, 0, "MA"],
  ["KGBR", "Walter J. Koladza (Great Barrington)", 42.1842, -73.4032, 0, "MA"],
  // ── Connecticut ──
  ["KBDL", "Bradley Intl (Windsor Locks)", 41.9389, -72.6832, 150, "CT"],
  ["KHFD", "Hartford-Brainard", 41.7366, -72.6493, 50, "CT"],
  ["KHVN", "Tweed New Haven", 41.2637, -72.8868, 75, "CT"],
  ["KBDR", "Sikorsky Memorial (Bridgeport)", 41.1635, -73.1262, 75, "CT"],
  ["KOXC", "Waterbury-Oxford", 41.4786, -73.1352, 75, "CT"],
  ["KDXR", "Danbury Municipal", 41.3715, -73.4822, 50, "CT"],
  ["KGON", "Groton-New London", 41.3301, -72.0451, 50, "CT"],
  ["KIJD", "Windham Airport (Willimantic)", 41.744, -72.1803, 0, "CT"],
  ["KMMK", "Meriden Markham Municipal", 41.5087, -72.8294, 0, "CT"],
  ["KSNC", "Chester Airport", 41.3841, -72.5061, 0, "CT"],
  ["KLZD", "Danielson Airport", 41.8197, -71.901, 0, "CT"],
  ["4B8", "Robertson Field (Plainville)", 41.6904, -72.8646, 0, "CT"],
  ["4B9", "Simsbury Airport", 41.9159, -72.7771, 0, "CT"],
  ["7B9", "Ellington Airport", 41.9133, -72.4574, 0, "CT"],
  ["7B6", "Skylark Airpark (Warehouse Point)", 41.9293, -72.5444, 0, "CT"],
  ["42B", "Goodspeed Airport (East Haddam)", 41.4509, -72.4577, 0, "CT"],
  ["11N", "Candlelight Farms (New Milford)", 41.5949, -73.4837, 0, "CT"],
  // ── Rhode Island ──
  ["KPVD", "Rhode Island T.F. Green Intl", 41.724, -71.4283, 100, "RI"],
  ["KSFZ", "North Central State (Pawtucket)", 41.9208, -71.4914, 0, "RI"],
  ["KOQU", "Quonset State", 41.5971, -71.4121, 50, "RI"],
  ["KWST", "Westerly State", 41.3496, -71.8034, 0, "RI"],
  ["KBID", "Block Island State", 41.1681, -71.5778, 30, "RI"],
  ["KUUU", "Newport State", 41.5324, -71.2815, 25, "RI"],
  // ── New Hampshire ──
  ["KMHT", "Manchester-Boston Regional", 42.9326, -71.4357, 100, "NH"],
  ["KASH", "Nashua Boire Field", 42.7817, -71.5148, 0, "NH"],
  ["KCON", "Concord Municipal", 43.2027, -71.5023, 0, "NH"],
  ["KLEB", "Lebanon Municipal", 43.6261, -72.3042, 50, "NH"],
  ["KEEN", "Dillant-Hopkins (Keene)", 42.8984, -72.2708, 0, "NH"],
  ["KAFN", "Jaffrey Airport-Silver Ranch", 42.805, -72.003, 0, "NH"],
  ["KLCI", "Laconia Municipal", 43.5727, -71.4189, 25, "NH"],
  ["KPSM", "Portsmouth Intl (Pease)", 43.0779, -70.8233, 50, "NH"],
  ["KDAW", "Skyhaven (Rochester)", 43.2841, -70.9293, 0, "NH"],
  ["KCNH", "Claremont Municipal", 43.3704, -72.3687, 0, "NH"],
  ["2B3", "Parlin Field (Newport NH)", 43.3873, -72.1893, 0, "NH"],
  ["7B3", "Hampton Airfield", 42.9329, -70.8636, 0, "NH"],
  ["1P1", "Plymouth Municipal NH", 43.7793, -71.7538, 0, "NH"],
  ["5M3", "Moultonboro Airport", 43.7679, -71.3866, 0, "NH"],
  ["8B2", "Twin Mountain Airport", 44.2627, -71.5499, 0, "NH"],
  ["KHIE", "Mount Washington Regional (Whitefield)", 44.3676, -71.5444, 0, "NH"],
  ["KBML", "Berlin Regional", 44.5754, -71.1759, 0, "NH"],
  ["ERR", "Errol Airport", 44.7925, -71.1642, 0, "NH"],
  ["1B5", "Franconia Airport", 44.2034, -71.7517, 0, "NH"],
  ["5B9", "Dean Memorial (North Haverhill)", 44.0911, -72.0046, 0, "NH"],
  // ── Vermont ──
  ["KBTV", "Burlington Intl", 44.472, -73.1533, 100, "VT"],
  ["KMPV", "Edward F. Knapp State (Barre-Montpelier)", 44.2035, -72.5623, 0, "VT"],
  ["KRUT", "Rutland Southern Vermont Regional", 43.5294, -72.9496, 25, "VT"],
  ["KMVL", "Morrisville-Stowe State", 44.5345, -72.614, 25, "VT"],
  ["KVSF", "Hartness State (Springfield VT)", 43.3436, -72.5173, 0, "VT"],
  ["KDDH", "William H. Morse State (Bennington)", 42.8913, -73.2464, 0, "VT"],
  ["6B0", "Middlebury State", 43.9849, -73.0958, 0, "VT"],
  ["KCDA", "Caledonia County (Lyndonville)", 44.5691, -72.018, 0, "VT"],
  ["KEFK", "Northeast Kingdom Intl (Newport VT)", 44.8889, -72.2292, 0, "VT"],
  ["KFSO", "Franklin County State (Highgate)", 44.9401, -73.0975, 0, "VT"],
  ["0B7", "Warren-Sugarbush Airport", 44.1175, -72.8266, 0, "VT"],
  ["2B9", "Post Mills Airport", 43.8845, -72.2533, 0, "VT"],
  ["B06", "Basin Harbor (Vergennes)", 44.1936, -73.3439, 0, "VT"],
  // ── Maine ──
  ["KPWM", "Portland Intl Jetport", 43.6462, -70.3093, 100, "ME"],
  ["KBGR", "Bangor Intl", 44.8074, -68.8281, 100, "ME"],
  ["KAUG", "Augusta State", 44.3206, -69.7973, 25, "ME"],
  ["KLEW", "Auburn-Lewiston Municipal", 44.0485, -70.2835, 0, "ME"],
  ["KRKD", "Knox County Regional (Rockland)", 44.0601, -69.0992, 25, "ME"],
  ["KBHB", "Hancock County-Bar Harbor", 44.45, -68.3615, 50, "ME"],
  ["KSFM", "Sanford Seacoast Regional", 43.3939, -70.708, 0, "ME"],
  ["KIWI", "Wiscasset Municipal", 43.9614, -69.7126, 0, "ME"],
  ["KIZG", "Eastern Slopes Regional (Fryeburg)", 43.9911, -70.9479, 0, "ME"],
  ["KWVL", "Waterville Robert LaFleur", 44.5332, -69.6755, 0, "ME"],
  ["KOLD", "Dewitt Field (Old Town)", 44.9528, -68.6743, 0, "ME"],
  ["KBXM", "Brunswick Executive", 43.8923, -69.9386, 50, "ME"],
  ["B19", "Biddeford Municipal", 43.4641, -70.4724, 0, "ME"],
  ["KBST", "Belfast Municipal", 44.4073, -69.012, 0, "ME"],
  ["KMLT", "Millinocket Municipal", 45.6478, -68.6856, 0, "ME"],
  ["3B1", "Greenville Municipal", 45.4628, -69.5519, 0, "ME"],
  ["8B0", "Steven A. Bean Municipal (Rangeley)", 44.9916, -70.6645, 0, "ME"],
  ["59B", "Newton Field (Jackman)", 45.6315, -70.2476, 0, "ME"],
  ["2B7", "Pittsfield Municipal ME", 44.7685, -69.3744, 0, "ME"],
  ["KHUL", "Houlton Intl", 46.1231, -67.7921, 0, "ME"],
  ["KPQI", "Presque Isle Intl", 46.6889, -68.0448, 50, "ME"],
  ["KCAR", "Caribou Municipal", 46.8715, -68.0179, 0, "ME"],
  ["KEPM", "Eastport Municipal", 44.9101, -67.0127, 0, "ME"],
  ["OWK", "Central Maine (Norridgewock)", 44.7155, -69.8665, 0, "ME"],
  ["0B1", "Bethel Regional", 44.4253, -70.8086, 0, "ME"],
  ["81B", "Oxford County Regional", 44.1574, -70.4811, 0, "ME"],
  ["1B0", "Dexter Regional", 45.004, -69.238, 0, "ME"],
  ["LRG", "Lincoln Regional", 45.3623, -68.5345, 0, "ME"],
  ["KPNN", "Princeton Municipal", 45.2006, -67.5644, 0, "ME"],
  ["65B", "Lubec Municipal", 44.8951, -67.0306, 0, "ME"],
  ["57B", "Islesboro Airport", 44.3025, -68.9105, 0, "ME"],
  // ── NY / NJ corridor ──
  ["KALB", "Albany Intl", 42.7483, -73.8017, 100, "NY/NJ"],
  ["KPOU", "Hudson Valley Regional (Poughkeepsie)", 41.6266, -73.8842, 50, "NY/NJ"],
  ["KSWF", "New York Stewart Intl", 41.5041, -74.1048, 100, "NY/NJ"],
  ["KMGJ", "Orange County (Montgomery)", 41.5099, -74.2646, 0, "NY/NJ"],
  ["KHPN", "Westchester County (White Plains)", 41.067, -73.7076, 150, "NY/NJ"],
  ["KHTO", "East Hampton Town", 40.9596, -72.2518, 200, "NY/NJ"],
  ["KFOK", "Francis S. Gabreski (Westhampton)", 40.8437, -72.6318, 75, "NY/NJ"],
  ["KISP", "Long Island MacArthur", 40.7952, -73.1002, 75, "NY/NJ"],
  ["KFRG", "Republic (Farmingdale)", 40.7288, -73.4134, 75, "NY/NJ"],
  ["KTEB", "Teterboro", 40.8501, -74.0608, 200, "NY/NJ"],
  ["KJFK", "John F. Kennedy Intl", 40.6413, -73.7781, 300, "NY/NJ"],
  ["KLGA", "LaGuardia", 40.7769, -73.874, 275, "NY/NJ"],
  ["KJRB", "Downtown Manhattan/Wall St Heliport", 40.7012, -74.009, 250, "NY/NJ"],
  ["6N5", "East 34th Street Heliport (NYC)", 40.7425, -73.9722, 250, "NY/NJ"],
  ["KJRA", "West 30th Street Heliport (NYC)", 40.7545, -74.0071, 250, "NY/NJ"],
];

const DEFAULT_LOCATIONS = RAW_LOCATIONS.map(([icao, name, lat, lon, fee, region]) => ({
  icao, name, lat, lon, fee, region, builtIn: true,
}));

const STORAGE_KEY = "heli-quoter-config-v2";

/* ═══════════════════════ Helpers ═══════════════════════ */

const toRad = (d) => (d * Math.PI) / 180;
function distanceNM(a, b) {
  const R = 3440.065;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const usd = (n) =>
  Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = (n) =>
  Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const hmm = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${String(m).padStart(2, "0")}`;
};
const todayStr = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const validUntilStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

/* ═══════════════════════ Blue Hill theme ═══════════════════════ */

const T = {
  navy: "#0A1F3C",      // deep brand navy
  navy2: "#11305A",
  steel: "#2E6FAE",     // Blue Hill steel blue
  sky: "#DDE8F3",       // pale blue surface
  ink: "#16263D",
  slate: "#5C6B7E",
  line: "#D6DEE8",
  paper: "#FFFFFF",
  bg: "#F1F4F8",
  good: "#0E7C4A",
  goodBg: "#E7F4EC",
  disp: "'Montserrat', 'Helvetica Neue', sans-serif",
  body: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};

const inputStyle = {
  border: `1px solid ${T.line}`,
  borderRadius: 4,
  padding: "9px 11px",
  fontFamily: T.mono,
  fontSize: 14,
  color: T.ink,
  width: "100%",
  background: "#FBFCFE",
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle = {
  fontFamily: T.disp,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: T.slate,
  display: "block",
  marginBottom: 5,
};
const cardStyle = {
  background: T.paper,
  border: `1px solid ${T.line}`,
  borderRadius: 8,
  padding: 20,
};
const h2Style = {
  fontFamily: T.disp,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: T.navy,
  margin: "0 0 14px",
  paddingBottom: 8,
  borderBottom: `2px solid ${T.steel}`,
  display: "inline-block",
};

/* ═══════════════════════ App ═══════════════════════ */

export default function HeliCharterQuoter() {
  const [aircraft, setAircraft] = useState(DEFAULT_AIRCRAFT);
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("quote");
  const [showPrint, setShowPrint] = useState(false);

  // Quote inputs
  const [clientName, setClientName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [baseIcao, setBaseIcao] = useState("KOWD");
  const [pickupIcao, setPickupIcao] = useState("KOWD");
  const [destIcao, setDestIcao] = useState("KACK");
  const [acId, setAcId] = useState("r44");
  const [roundTrip, setRoundTrip] = useState(true);
  const [waitHours, setWaitHours] = useState(3);
  const [shortNotice, setShortNotice] = useState(false);
  const [waiveOps, setWaiveOps] = useState(false);
  const [passengers, setPassengers] = useState([{ id: 1, weight: "", bag: "" }]);
  const [strategy, setStrategy] = useState("auto");
  const [quoteNo] = useState(
    () => `BH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`
  );

  /* load / save (browser localStorage) */
  useEffect(() => {
    (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const c = JSON.parse(raw);
          if (c.aircraft) setAircraft(c.aircraft.map((a) => ({ maxPax: 4, ...a, ...(a.id === "b206l" && (!a.maxPax || a.maxPax === 4) ? { maxPax: 6 } : {}) })));
          if (c.fees) setFees({ ...DEFAULT_FEES, ...c.fees });
          if (c.company) setCompany({ ...DEFAULT_COMPANY, ...c.company });
          if (c.locations) {
            // merge: keep saved fees/custom locations, pick up newly shipped built-ins
            const saved = new Map(c.locations.map((l) => [l.icao, l]));
            const merged = DEFAULT_LOCATIONS.map((d) => saved.get(d.icao) ? { ...d, ...saved.get(d.icao), builtIn: true } : d);
            const customs = c.locations.filter((l) => !DEFAULT_LOCATIONS.some((d) => d.icao === l.icao));
            setLocations([...merged, ...customs]);
          }
        }
      } catch (e) { /* first run */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ aircraft, fees, locations, company }));
    } catch (e) { console.error("Save failed", e); }
  }, [aircraft, fees, locations, company, loaded]);

  const locByIcao = (code) =>
    locations.find((l) => l.icao.toUpperCase() === String(code).trim().toUpperCase());
  const base = locByIcao(baseIcao);
  const pickup = locByIcao(pickupIcao);
  const dest = locByIcao(destIcao);
  const ac = aircraft.find((a) => a.id === acId) || aircraft[0];

  /* quote math */
  const quote = useMemo(() => {
    if (!base || !pickup || !dest || !ac) return null;
    const buffer = (Number(fees.legBufferMin) || 0) / 60;
    const leg = (from, to, kind) => {
      const nm = distanceNM(from, to);
      const time = nm / ac.speed + buffer;
      return { from, to, nm, time, kind, cost: time * ac.rate };
    };

    const legs = [];
    if (pickup.icao !== base.icao) legs.push(leg(base, pickup, "Positioning"));
    legs.push(leg(pickup, dest, "Charter"));
    if (roundTrip) {
      legs.push(leg(dest, pickup, "Charter"));
      if (pickup.icao !== base.icao) legs.push(leg(pickup, base, "Positioning"));
    } else {
      legs.push(leg(dest, base, "Ferry home"));
    }

    const coreLandingFees = legs.reduce((s, l) => s + (Number(l.to.fee) || 0), 0);
    const opsFee = waiveOps ? 0 : shortNotice ? Number(fees.opsFeeShortNotice) : Number(fees.opsFee);

    const wh = Math.max(0, Number(waitHours) || 0);
    const ferryLeg = leg(dest, base, "f");
    const waitCost = wh * Number(fees.groundWaitRate);
    const ferryCost = 2 * ferryLeg.cost + (Number(dest.fee) || 0) + (Number(base.fee) || 0);

    const analysis =
      roundTrip && wh > 0
        ? { waitCost, ferryCost, ferryLegTime: ferryLeg.time, cheaper: waitCost <= ferryCost ? "wait" : "ferry", savings: Math.abs(waitCost - ferryCost) }
        : null;

    const chosen = !analysis ? "none" : strategy === "auto" ? analysis.cheaper : strategy;

    const extraLegs = [];
    let waitCharge = 0;
    let extraLandingFees = 0;
    if (chosen === "wait") waitCharge = waitCost;
    else if (chosen === "ferry") {
      extraLegs.push(leg(dest, base, "Ferry out"), leg(base, dest, "Ferry back"));
      extraLandingFees = (Number(dest.fee) || 0) + (Number(base.fee) || 0);
    }

    const allLegs = [...legs, ...extraLegs];
    const flightTime = allLegs.reduce((s, l) => s + l.time, 0);
    const flightCost = allLegs.reduce((s, l) => s + l.cost, 0);
    const landingFees = coreLandingFees + extraLandingFees;
    const subtotal = flightCost + landingFees + opsFee + waitCharge;
    const nPax = passengers.length;
    const totalPaxWeight = passengers.reduce((s, p2) => s + (Number(p2.weight) || 0), 0);
    const totalBagWeight = passengers.reduce((s, p2) => s + (Number(p2.bag) || 0), 0);
    const taxTotal = subtotal * ((Number(fees.taxRate) || 0) / 100) + nPax * (Number(fees.paxFee) || 0);
    const total = subtotal + taxTotal;

    return { legs, extraLegs, allLegs, flightTime, flightCost, landingFees, opsFee, waitCharge, subtotal, nPax, totalPaxWeight, totalBagWeight, taxTotal, total, analysis, chosen };
  }, [base, pickup, dest, ac, roundTrip, waitHours, shortNotice, waiveOps, passengers, fees, strategy]);

  const missing = [
    !base && baseIcao && baseIcao.toUpperCase(),
    !pickup && pickupIcao && pickupIcao.toUpperCase(),
    !dest && destIcao && destIcao.toUpperCase(),
  ].filter(Boolean);

  const seatOverflow = quote && ac && quote.nPax > Number(ac.maxPax || 99);

  const printProps = { quote, company, ac, clientName, tripDate, quoteNo, roundTrip, waitHours, shortNotice, waiveOps, fees, passengers };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.body, color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        input:focus, select:focus, textarea:focus { border-color: ${T.steel} !important; }
        button { cursor: pointer; }
        @media (max-width: 880px) { .two-col { grid-template-columns: 1fr !important; } }
        #print-sheet { display: none; }
        @media print {
          body { background: #fff !important; }
          #app-root { display: none !important; }
          #print-sheet { display: block !important; }
          @page { margin: 0.5in; }
        }
      `}</style>

      <div id="app-root">
        {/* ── Header ── */}
        <header style={{ background: T.navy, color: "#fff", padding: "18px 26px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", borderBottom: `4px solid ${T.steel}` }}>
          <BrandLogo company={company} height={52} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#9FBEDD" }}>
              Charter Quoting Tool
            </div>
          </div>
          <nav style={{ display: "flex", gap: 8 }}>
            {[["quote", "Quote"], ["admin", "Admin"]].map(([k, lbl]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{
                  fontFamily: T.disp, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  padding: "9px 20px", borderRadius: 4,
                  border: `1px solid ${tab === k ? T.steel : "rgba(255,255,255,0.3)"}`,
                  background: tab === k ? T.steel : "transparent", color: "#fff",
                }}>
                {lbl}
              </button>
            ))}
          </nav>
        </header>

        <main style={{ maxWidth: 1140, margin: "0 auto", padding: 22 }}>
          {tab === "quote" ? (
            <QuoteTab
              {...{
                clientName, setClientName, tripDate, setTripDate,
                baseIcao, setBaseIcao, pickupIcao, setPickupIcao, destIcao, setDestIcao,
                aircraft, acId, setAcId, roundTrip, setRoundTrip, waitHours, setWaitHours,
                shortNotice, setShortNotice, waiveOps, setWaiveOps,
                passengers, setPassengers,
                strategy, setStrategy,
                quote, missing, seatOverflow, ac, fees, locations, quoteNo,
                onExport: () => setShowPrint(true),
              }}
            />
          ) : (
            <AdminTab {...{ aircraft, setAircraft, fees, setFees, locations, setLocations, company, setCompany }} />
          )}
        </main>

        {/* PDF preview overlay */}
        {showPrint && quote && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,31,60,0.65)", zIndex: 50, overflowY: "auto", padding: "30px 12px" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={() => window.print()}
                  style={{ fontFamily: T.disp, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 13, padding: "10px 22px", borderRadius: 4, border: "none", background: T.steel, color: "#fff" }}>
                  Print / Save as PDF
                </button>
                <button onClick={() => setShowPrint(false)}
                  style={{ fontFamily: T.disp, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 13, padding: "10px 22px", borderRadius: 4, border: "1px solid #fff", background: "transparent", color: "#fff" }}>
                  Close
                </button>
              </div>
              <div style={{ background: "#fff", borderRadius: 4, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                <QuoteSheet {...printProps} />
              </div>
              <p style={{ color: "#C9D8EA", fontSize: 13, textAlign: "center", marginTop: 12 }}>
                Use "Print / Save as PDF" and choose <b>Save as PDF</b> as the destination for a client-ready document.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden print-only sheet */}
      <div id="print-sheet">{quote && <QuoteSheet {...printProps} />}</div>
    </div>
  );
}

/* Simple rotor mark */
function Rotor({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="#2E6FAE" strokeWidth="2.5" />
      <line x1="4" y1="20" x2="36" y2="20" stroke="#fff" strokeWidth="2.5" />
      <line x1="20" y1="4" x2="20" y2="36" stroke="#fff" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="3.5" fill="#2E6FAE" />
    </svg>
  );
}

/* Company logo with graceful fallback to rotor + wordmark if the image can't load */
function BrandLogo({ company, height }) {
  const [failed, setFailed] = useState(false);
  if (!company.logoUrl || failed) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        <Rotor size={height * 0.8} />
        <span style={{ fontFamily: T.disp, fontSize: height * 0.38, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
          {company.name}
        </span>
      </span>
    );
  }
  return (
    <img
      src={company.logoUrl}
      alt={company.name}
      style={{ height, width: "auto", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}

/* ═══════════════════════ Quote tab ═══════════════════════ */

function QuoteTab(p) {
  const {
    clientName, setClientName, tripDate, setTripDate,
    baseIcao, setBaseIcao, pickupIcao, setPickupIcao, destIcao, setDestIcao,
    aircraft, acId, setAcId, roundTrip, setRoundTrip, waitHours, setWaitHours,
    shortNotice, setShortNotice, waiveOps, setWaiveOps,
    passengers, setPassengers,
    strategy, setStrategy,
    quote, missing, seatOverflow, ac, fees, locations, quoteNo, onExport,
  } = p;

  const addPassenger = () => setPassengers([...passengers, { id: Date.now(), weight: "", bag: "" }]);
  const removePassenger = (id) => setPassengers(passengers.filter((x) => x.id !== id));
  const updatePassenger = (id, field, val) => setPassengers(passengers.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  const icaoField = (label, val, set) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input list="icao-list" value={val} onChange={(e) => set(e.target.value.toUpperCase())}
        style={{ ...inputStyle, fontWeight: 600 }} placeholder="ICAO" />
    </div>
  );

  return (
    <div className="two-col" style={{ display: "grid", gridTemplateColumns: "390px 1fr", gap: 20 }}>
      <datalist id="icao-list">
        {locations.map((l) => <option key={l.icao} value={l.icao}>{l.name} ({l.region})</option>)}
      </datalist>

      {/* Inputs */}
      <div style={{ display: "grid", gap: 20, alignSelf: "start" }}>
      <section style={cardStyle}>
        <h2 style={h2Style}>Trip Details</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Client name</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ ...inputStyle, fontFamily: T.body }} placeholder="Client / company" />
          </div>
          <div>
            <label style={labelStyle}>Trip date</label>
            <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          {icaoField("Base", baseIcao, setBaseIcao)}
          {icaoField("Pickup", pickupIcao, setPickupIcao)}
          {icaoField("Destination", destIcao, setDestIcao)}
        </div>
        {missing.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#B3263A", fontFamily: T.mono }}>
            Not in database: {missing.join(", ")} — add it under Admin → Locations.
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Aircraft</label>
          <select value={acId} onChange={(e) => setAcId(e.target.value)} style={inputStyle}>
            {aircraft.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.speed} kts — {usd(a.rate)}/hr</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Trip type</label>
            <select
              value={roundTrip ? "rt" : "ow"}
              onChange={(e) => {
                const rt = e.target.value === "rt";
                setRoundTrip(rt);
                if (!rt) setWaitHours(0);
              }}
              style={inputStyle}
            >
              <option value="rt">Round trip</option>
              <option value="ow">One way</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Client ground time (hrs)</label>
            <input type="number" min="0" step="0.25" value={waitHours} onChange={(e) => setWaitHours(e.target.value)} style={inputStyle} disabled={!roundTrip} />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 14.5 }}>
          <input type="checkbox" checked={shortNotice} onChange={(e) => setShortNotice(e.target.checked)} />
          Short-notice booking ({usd(fees.opsFeeShortNotice)} ops fee)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 14.5 }}>
          <input type="checkbox" checked={waiveOps} onChange={(e) => setWaiveOps(e.target.checked)} />
          Waive operations fee
        </label>

        {roundTrip && Number(waitHours) > 0 && (
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>While the client is on the ground</label>
            {[["auto", "Auto — use whichever is cheaper"], ["wait", "Pilot waits on site"], ["ferry", "Ferry home and return"]].map(([v, lbl]) => (
              <label key={v} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14.5, padding: "3px 0" }}>
                <input type="radio" name="strategy" checked={strategy === v} onChange={() => setStrategy(v)} />
                {lbl}
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Passengers */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Passengers</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {passengers.map((pp, i) => (
            <div key={pp.id} style={{ display: "grid", gridTemplateColumns: "92px 1fr 1fr 30px", gap: 8, alignItems: "center" }}>
              <div style={{ fontFamily: T.disp, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.navy }}>
                Pax {i + 1}
              </div>
              <input type="number" min="0" value={pp.weight}
                onChange={(e) => updatePassenger(pp.id, "weight", e.target.value)}
                style={inputStyle} placeholder="Weight (lbs)" />
              <input type="number" min="0" value={pp.bag}
                onChange={(e) => updatePassenger(pp.id, "bag", e.target.value)}
                style={inputStyle} placeholder="Baggage (lbs)" />
              <button onClick={() => removePassenger(pp.id)} disabled={passengers.length <= 1}
                title="Remove passenger"
                style={{ border: "none", background: "none", color: passengers.length <= 1 ? T.line : "#B3263A", fontSize: 16, padding: 0 }}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <button onClick={addPassenger}
          style={{
            marginTop: 12, fontFamily: T.disp, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "8px 16px", borderRadius: 4, border: `1px solid ${T.steel}`, background: "transparent", color: T.steel,
          }}>
          + Add passenger
        </button>

        {quote && (
          <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 4, background: T.sky, fontFamily: T.mono, fontSize: 12.5, color: T.navy, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span>{quote.nPax} pax</span>
            <span>{quote.totalPaxWeight.toLocaleString()} lbs pax</span>
            <span>{quote.totalBagWeight.toLocaleString()} lbs baggage</span>
            <span style={{ fontWeight: 600 }}>{(quote.totalPaxWeight + quote.totalBagWeight).toLocaleString()} lbs total</span>
          </div>
        )}

        {seatOverflow && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 4, background: "#FBEDEF", border: "1px solid #E3B6BD", color: "#8E1F30", fontSize: 13.5, fontWeight: 600 }}>
            {quote.nPax} passengers exceeds the {ac.name}'s {ac.maxPax}-seat maximum. Reduce passengers or select a larger aircraft.
          </div>
        )}

        <button onClick={onExport} disabled={!quote}
          style={{
            marginTop: 16, width: "100%", padding: "13px 0", borderRadius: 4, border: "none",
            background: quote ? T.navy : "#A9B6C6", color: "#fff",
            fontFamily: T.disp, fontWeight: 700, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase",
          }}>
          Export client PDF
        </button>
      </section>
      </div>

      {/* Results */}
      <section style={{ display: "grid", gap: 20, alignSelf: "start" }}>
        {!quote ? (
          <div style={{ ...cardStyle, color: T.slate }}>
            Enter valid ICAO codes for base, pickup, and destination to build a quote.
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <h2 style={h2Style}>Nav Log — {ac.name}</h2>
              <div style={{ display: "grid", gap: 6 }}>
                {quote.allLegs.map((l, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                    fontFamily: T.mono, fontSize: 13.5, padding: "9px 12px",
                    background: l.kind === "Charter" ? T.sky : "#F7F9FB",
                    borderLeft: `3px solid ${l.kind === "Charter" ? T.steel : T.slate}`,
                    borderRadius: 3,
                  }}>
                    <span style={{ fontWeight: 600, minWidth: 112 }}>{l.from.icao} → {l.to.icao}</span>
                    <span style={{ color: T.slate }}>{l.nm.toFixed(0)} nm</span>
                    <span style={{ color: T.slate }}>{hmm(l.time)}</span>
                    <span style={{ fontSize: 10.5, fontFamily: T.disp, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: l.kind === "Charter" ? T.steel : T.slate }}>
                      {l.kind}
                    </span>
                    <span style={{ marginLeft: "auto", fontWeight: 600 }}>{usd2(l.cost)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 12, color: T.slate }}>
                Each leg includes a {fees.legBufferMin}-minute start/shutdown buffer.
              </div>
            </div>

            {quote.analysis && (
              <div style={cardStyle}>
                <h2 style={h2Style}>Wait vs. Ferry Analysis</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { key: "wait", title: "Pilot waits on site", cost: quote.analysis.waitCost, detail: `${Number(waitHours)} hr × ${usd(fees.groundWaitRate)}/hr ground wait` },
                    { key: "ferry", title: "Ferry home & return", cost: quote.analysis.ferryCost, detail: `2 × ${hmm(quote.analysis.ferryLegTime)} @ ${usd(ac.rate)}/hr + repeat landing fees` },
                  ].map((opt) => {
                    const isCheaper = quote.analysis.cheaper === opt.key;
                    const isChosen = quote.chosen === opt.key;
                    return (
                      <div key={opt.key} style={{
                        border: `2px solid ${isChosen ? T.good : T.line}`,
                        background: isCheaper ? T.goodBg : "#F7F9FB",
                        borderRadius: 6, padding: 16,
                      }}>
                        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: T.navy }}>
                          {opt.title}
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 600, margin: "8px 0 4px" }}>{usd2(opt.cost)}</div>
                        <div style={{ fontSize: 13, color: T.slate }}>{opt.detail}</div>
                        <div style={{ marginTop: 8, fontSize: 12, fontFamily: T.mono }}>
                          {isCheaper && <span style={{ color: T.good, fontWeight: 600 }}>CHEAPER · saves {usd2(quote.analysis.savings)} </span>}
                          {isChosen && <span style={{ color: T.good }}>— applied</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ ...cardStyle, borderTop: `4px solid ${T.navy}` }}>
              <h2 style={h2Style}>Quote Summary <span style={{ fontFamily: T.mono, fontSize: 12, color: T.slate, letterSpacing: 0, textTransform: "none" }}>· {quoteNo}</span></h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <tbody>
                  <Row label={`Flight time — ${hmm(quote.flightTime)} @ ${usd(ac.rate)}/hr`} value={usd2(quote.flightCost)} />
                  {quote.waitCharge > 0 && (
                    <Row label={`Ground wait — ${Number(waitHours)} hr @ ${usd(fees.groundWaitRate)}/hr`} value={usd2(quote.waitCharge)} />
                  )}
                  <Row label="Landing & facility fees" value={usd2(quote.landingFees)} />
                  <Row label={`Operations fee${waiveOps ? " (waived)" : shortNotice ? " (short notice)" : ""}`} value={usd2(quote.opsFee)} />
                  <Row label="Subtotal" value={usd2(quote.subtotal)} />
                  <Row label="Tax" value={usd2(quote.taxTotal)} />
                  <tr>
                    <td style={{ padding: "14px 0 0", fontFamily: T.disp, fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.12em", color: T.navy }}>Total</td>
                    <td style={{ padding: "14px 0 0", textAlign: "right", fontFamily: T.mono, fontSize: 26, fontWeight: 600, color: T.navy }}>{usd2(quote.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <tr>
      <td style={{ padding: "7px 0", borderBottom: `1px solid ${T.line}` }}>{label}</td>
      <td style={{ padding: "7px 0", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontFamily: T.mono }}>{value}</td>
    </tr>
  );
}

/* ═══════════════════════ Client-ready quote sheet (print / PDF) ═══════════════════════ */

function QuoteSheet({ quote, company, ac, clientName, tripDate, quoteNo, roundTrip, waitHours, shortNotice, waiveOps, fees, passengers }) {
  if (!quote) return null;
  const dateFmt = tripDate
    ? new Date(tripDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "To be confirmed";
  return (
    <div style={{ fontFamily: T.body, color: T.ink, background: "#fff" }}>
      {/* Letterhead */}
      <div style={{ background: T.navy, color: "#fff", padding: "26px 36px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <BrandLogo company={company} height={56} />
          <div style={{ fontFamily: T.disp, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: "#9FBEDD", marginTop: 8 }}>{company.tagline}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11.5, lineHeight: 1.7, color: "#C9D8EA" }}>
          {company.address}<br />{company.phone} · {company.email}<br />{company.base}
        </div>
      </div>
      <div style={{ height: 5, background: T.steel }} />

      <div style={{ padding: "30px 36px" }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: T.disp, fontSize: 26, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.navy }}>
            Charter Quotation
          </div>
          <table style={{ fontSize: 12.5, fontFamily: T.mono, color: T.slate }}>
            <tbody>
              <tr><td style={{ paddingRight: 14 }}>Quote No.</td><td style={{ color: T.ink, fontWeight: 600 }}>{quoteNo}</td></tr>
              <tr><td>Issued</td><td style={{ color: T.ink }}>{todayStr()}</td></tr>
              <tr><td>Valid until</td><td style={{ color: T.ink }}>{validUntilStr()}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Client + trip block */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginTop: 22, border: `1px solid ${T.line}`, borderRadius: 6, overflow: "hidden" }}>
          {[
            ["Prepared for", clientName || "—"],
            ["Trip date", dateFmt],
            ["Aircraft", `${ac.name} · ${ac.speed} kts cruise`],
            ["Passengers", `${quote.nPax}${ac.maxPax ? ` of ${ac.maxPax} seats` : ""}`],
            ["Passenger weight", quote.totalPaxWeight ? `${quote.totalPaxWeight.toLocaleString()} lbs` : "—"],
            ["Baggage", quote.totalBagWeight ? `${quote.totalBagWeight.toLocaleString()} lbs` : "—"],
          ].map(([k, v], i) => (
            <div key={k} style={{ padding: "12px 16px", borderLeft: i % 3 ? `1px solid ${T.line}` : "none", borderTop: i > 2 ? `1px solid ${T.line}` : "none", background: i % 2 ? "#F7FAFD" : "#fff" }}>
              <div style={{ fontFamily: T.disp, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.slate }}>{k}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Itinerary */}
        <SheetH>Itinerary</SheetH>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.navy, color: "#fff", fontFamily: T.disp, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Leg</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>From</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>To</th>
              <th style={{ textAlign: "right", padding: "8px 12px" }}>Distance</th>
              <th style={{ textAlign: "right", padding: "8px 12px" }}>Est. time</th>
            </tr>
          </thead>
          <tbody>
            {quote.allLegs.map((l, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.line}`, background: i % 2 ? "#F7FAFD" : "#fff" }}>
                <td style={{ padding: "8px 12px", fontFamily: T.mono, fontSize: 12, color: T.slate }}>{String(i + 1).padStart(2, "0")} · {l.kind}</td>
                <td style={{ padding: "8px 12px" }}>{l.from.name} <span style={{ fontFamily: T.mono, color: T.slate }}>({l.from.icao})</span></td>
                <td style={{ padding: "8px 12px" }}>{l.to.name} <span style={{ fontFamily: T.mono, color: T.slate }}>({l.to.icao})</span></td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: T.mono }}>{l.nm.toFixed(0)} nm</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: T.mono }}>{hmm(l.time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {roundTrip && quote.chosen === "wait" && Number(waitHours) > 0 && (
          <div style={{ fontSize: 12.5, color: T.slate, marginTop: 8 }}>
            Aircraft and pilot remain on site for approximately {Number(waitHours)} hour{Number(waitHours) === 1 ? "" : "s"} of client ground time.
          </div>
        )}

        {/* Load manifest (only if weights were entered) */}
        {passengers && passengers.some((pp) => Number(pp.weight) || Number(pp.bag)) && (
          <>
            <SheetH>Load Manifest</SheetH>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.navy, color: "#fff", fontFamily: T.disp, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left", padding: "7px 12px" }}>Passenger</th>
                  <th style={{ textAlign: "right", padding: "7px 12px" }}>Weight</th>
                  <th style={{ textAlign: "right", padding: "7px 12px" }}>Baggage</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((pp, i) => (
                  <tr key={pp.id} style={{ borderBottom: `1px solid ${T.line}`, background: i % 2 ? "#F7FAFD" : "#fff" }}>
                    <td style={{ padding: "7px 12px" }}>Passenger {i + 1}</td>
                    <td style={{ padding: "7px 12px", textAlign: "right", fontFamily: T.mono }}>{Number(pp.weight) ? `${Number(pp.weight).toLocaleString()} lbs` : "—"}</td>
                    <td style={{ padding: "7px 12px", textAlign: "right", fontFamily: T.mono }}>{Number(pp.bag) ? `${Number(pp.bag).toLocaleString()} lbs` : "—"}</td>
                  </tr>
                ))}
                <tr style={{ background: "#EDF3F9" }}>
                  <td style={{ padding: "7px 12px", fontWeight: 600 }}>Total</td>
                  <td style={{ padding: "7px 12px", textAlign: "right", fontFamily: T.mono, fontWeight: 600 }}>{quote.totalPaxWeight.toLocaleString()} lbs</td>
                  <td style={{ padding: "7px 12px", textAlign: "right", fontFamily: T.mono, fontWeight: 600 }}>{quote.totalBagWeight.toLocaleString()} lbs</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Pricing */}
        <SheetH>Pricing</SheetH>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            <SheetRow label={`Flight time — ${hmm(quote.flightTime)} @ ${usd(ac.rate)} per hour`} value={usd2(quote.flightCost)} />
            {quote.waitCharge > 0 && (
              <SheetRow label={`Ground wait — ${Number(waitHours)} hr @ ${usd(fees.groundWaitRate)} per hour`} value={usd2(quote.waitCharge)} />
            )}
            <SheetRow label="Landing & facility fees" value={usd2(quote.landingFees)} />
            <SheetRow label={`Operations fee${waiveOps ? " (waived)" : shortNotice ? " (short notice)" : ""}`} value={usd2(quote.opsFee)} />
            <SheetRow label="Subtotal" value={usd2(quote.subtotal)} />
            <SheetRow label="Tax" value={usd2(quote.taxTotal)} />
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <div style={{ background: T.navy, color: "#fff", borderRadius: 6, padding: "14px 26px", display: "flex", gap: 30, alignItems: "baseline" }}>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" }}>Quoted Total</span>
            <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 600 }}>{usd2(quote.total)}</span>
          </div>
        </div>

        {/* Terms */}
        <SheetH>Terms & Conditions</SheetH>
        <p style={{ fontSize: 11.5, lineHeight: 1.65, color: T.slate, margin: 0 }}>{company.terms}</p>

        {/* Signature */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, marginTop: 44 }}>
          {["Accepted by (client)", `For ${company.name}`].map((lbl) => (
            <div key={lbl}>
              <div style={{ borderBottom: `1px solid ${T.ink}`, height: 34 }} />
              <div style={{ fontFamily: T.disp, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.slate, marginTop: 6 }}>
                {lbl} · Date
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 34, paddingTop: 12, borderTop: `1px solid ${T.line}`, fontSize: 10.5, color: T.slate, display: "flex", justifyContent: "space-between" }}>
          <span>{company.name} · {company.address}</span>
          <span>{company.phone} · {company.email}</span>
        </div>
      </div>
    </div>
  );
}

function SheetH({ children }) {
  return (
    <div style={{ fontFamily: T.disp, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.navy, margin: "26px 0 10px", paddingBottom: 6, borderBottom: `2px solid ${T.steel}` }}>
      {children}
    </div>
  );
}
function SheetRow({ label, value }) {
  return (
    <tr>
      <td style={{ padding: "7px 0", borderBottom: `1px solid ${T.line}` }}>{label}</td>
      <td style={{ padding: "7px 0", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontFamily: T.mono }}>{value}</td>
    </tr>
  );
}

/* ═══════════════════════ Admin tab ═══════════════════════ */

function AdminTab({ aircraft, setAircraft, fees, setFees, locations, setLocations, company, setCompany }) {
  const [newLoc, setNewLoc] = useState({ icao: "", name: "", lat: "", lon: "", fee: "", region: "MA" });
  const [filter, setFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");

  const updateAircraft = (id, field, val) => setAircraft(aircraft.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  const updateLoc = (icao, field, val) => setLocations(locations.map((l) => (l.icao === icao ? { ...l, [field]: val } : l)));

  const addLocation = () => {
    const icao = newLoc.icao.trim().toUpperCase();
    if (!icao || isNaN(parseFloat(newLoc.lat)) || isNaN(parseFloat(newLoc.lon))) return;
    if (locations.some((l) => l.icao === icao)) return;
    setLocations([...locations, {
      icao, name: newLoc.name.trim() || icao,
      lat: parseFloat(newLoc.lat), lon: parseFloat(newLoc.lon),
      fee: parseFloat(newLoc.fee) || 0, region: newLoc.region, builtIn: false,
    }]);
    setNewLoc({ icao: "", name: "", lat: "", lon: "", fee: "", region: newLoc.region });
  };

  const regions = ["All", "MA", "CT", "RI", "NH", "VT", "ME", "NY/NJ", "Other"];
  const shown = locations.filter((l) => {
    const okRegion = regionFilter === "All" || (l.region || "Other") === regionFilter;
    const okText = !filter || l.icao.toLowerCase().includes(filter.toLowerCase()) || l.name.toLowerCase().includes(filter.toLowerCase());
    return okRegion && okText;
  });

  const numCell = { ...inputStyle, padding: "6px 9px", fontSize: 13 };
  const btnPrimary = {
    fontFamily: T.disp, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
    padding: "9px 18px", borderRadius: 4, border: "none", background: T.steel, color: "#fff",
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Company */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Company & Quote Letterhead</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[["name", "Company name"], ["tagline", "Tagline"], ["logoUrl", "Logo image URL"], ["phone", "Phone"], ["email", "Email"], ["address", "Address"], ["base", "Home base"]].map(([k, lbl]) => (
            <div key={k}>
              <label style={labelStyle}>{lbl}</label>
              <input value={company[k]} onChange={(e) => setCompany({ ...company, [k]: e.target.value })} style={{ ...inputStyle, fontFamily: T.body }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Terms & conditions (printed on PDF)</label>
          <textarea value={company.terms} onChange={(e) => setCompany({ ...company, terms: e.target.value })}
            rows={4} style={{ ...inputStyle, fontFamily: T.body, resize: "vertical" }} />
        </div>
      </section>

      {/* Fees */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Standard Fees</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          {[["opsFee", "Operations fee ($)"], ["opsFeeShortNotice", "Ops fee — short notice ($)"], ["groundWaitRate", "Ground wait ($/hr)"], ["legBufferMin", "Per-leg buffer (min)"], ["taxRate", "Tax rate (%)"], ["paxFee", "Per-passenger fee ($)"]].map(([k, lbl]) => (
            <div key={k}>
              <label style={labelStyle}>{lbl}</label>
              <input type="number" value={fees[k]} onChange={(e) => setFees({ ...fees, [k]: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
          ))}
        </div>
      </section>

      {/* Fleet */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Fleet</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ fontFamily: T.disp, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.slate, fontSize: 11 }}>
              <th style={{ textAlign: "left", padding: 6 }}>Aircraft</th>
              <th style={{ textAlign: "left", padding: 6 }}>Cruise (kts)</th>
              <th style={{ textAlign: "left", padding: 6 }}>Rate ($/hr)</th>
              <th style={{ textAlign: "left", padding: 6 }}>Max pax</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {aircraft.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: 4 }}><input value={a.name} onChange={(e) => updateAircraft(a.id, "name", e.target.value)} style={{ ...numCell, fontFamily: T.body }} /></td>
                <td style={{ padding: 4, width: 110 }}><input type="number" value={a.speed} onChange={(e) => updateAircraft(a.id, "speed", parseFloat(e.target.value) || 1)} style={numCell} /></td>
                <td style={{ padding: 4, width: 120 }}><input type="number" value={a.rate} onChange={(e) => updateAircraft(a.id, "rate", parseFloat(e.target.value) || 0)} style={numCell} /></td>
                <td style={{ padding: 4, width: 100 }}><input type="number" min="1" value={a.maxPax ?? 4} onChange={(e) => updateAircraft(a.id, "maxPax", parseInt(e.target.value) || 1)} style={numCell} /></td>
                <td style={{ padding: 4, width: 40 }}>
                  {aircraft.length > 1 && (
                    <button onClick={() => setAircraft(aircraft.filter((x) => x.id !== a.id))} style={{ border: "none", background: "none", color: "#B3263A", fontSize: 16 }} title="Remove">✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setAircraft([...aircraft, { id: `ac${Date.now()}`, name: "New aircraft", speed: 100, rate: 1000, maxPax: 4 }])}
          style={{ ...btnPrimary, marginTop: 10, background: "transparent", border: `1px solid ${T.steel}`, color: T.steel }}>
          + Add aircraft
        </button>
      </section>

      {/* Locations */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Locations & Landing Fees</h2>
        <p style={{ margin: "0 0 14px", fontSize: 13.5, color: T.slate }}>
          {locations.length} facilities loaded across New England and the NY corridor. Edit a landing fee on any row, or add heliports and airports with their coordinates. Verify fees against actual facility invoices.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 100px 100px 80px 90px 80px", gap: 8, marginBottom: 16, alignItems: "end" }}>
          <div><label style={labelStyle}>ICAO</label><input value={newLoc.icao} onChange={(e) => setNewLoc({ ...newLoc, icao: e.target.value.toUpperCase() })} style={numCell} placeholder="KXXX" /></div>
          <div><label style={labelStyle}>Name</label><input value={newLoc.name} onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })} style={{ ...numCell, fontFamily: T.body }} placeholder="Facility name" /></div>
          <div><label style={labelStyle}>Lat</label><input value={newLoc.lat} onChange={(e) => setNewLoc({ ...newLoc, lat: e.target.value })} style={numCell} placeholder="42.19" /></div>
          <div><label style={labelStyle}>Lon</label><input value={newLoc.lon} onChange={(e) => setNewLoc({ ...newLoc, lon: e.target.value })} style={numCell} placeholder="-71.17" /></div>
          <div><label style={labelStyle}>Fee ($)</label><input value={newLoc.fee} onChange={(e) => setNewLoc({ ...newLoc, fee: e.target.value })} style={numCell} placeholder="0" /></div>
          <div><label style={labelStyle}>Region</label>
            <select value={newLoc.region} onChange={(e) => setNewLoc({ ...newLoc, region: e.target.value })} style={numCell}>
              {regions.filter((r) => r !== "All").map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button onClick={addLocation} style={{ ...btnPrimary, padding: "9px 0" }}>Add</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by ICAO or name…" style={{ ...inputStyle, maxWidth: 280 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {regions.map((r) => (
              <button key={r} onClick={() => setRegionFilter(r)}
                style={{
                  fontFamily: T.disp, fontWeight: 600, fontSize: 11, letterSpacing: "0.08em",
                  padding: "6px 12px", borderRadius: 20,
                  border: `1px solid ${regionFilter === r ? T.steel : T.line}`,
                  background: regionFilter === r ? T.steel : "#fff",
                  color: regionFilter === r ? "#fff" : T.slate,
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxHeight: 460, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ fontFamily: T.disp, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", fontSize: 10.5, position: "sticky", top: 0, background: T.navy }}>
                <th style={{ textAlign: "left", padding: 9 }}>ICAO</th>
                <th style={{ textAlign: "left", padding: 9 }}>Name</th>
                <th style={{ textAlign: "left", padding: 9 }}>Region</th>
                <th style={{ textAlign: "left", padding: 9 }}>Coordinates</th>
                <th style={{ textAlign: "left", padding: 9 }}>Landing fee ($)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.icao} style={{ borderTop: `1px solid ${T.line}` }}>
                  <td style={{ padding: 8, fontFamily: T.mono, fontWeight: 600 }}>{l.icao}</td>
                  <td style={{ padding: 8 }}>{l.name}</td>
                  <td style={{ padding: 8, color: T.slate, fontFamily: T.mono, fontSize: 12 }}>{l.region || "—"}</td>
                  <td style={{ padding: 8, fontFamily: T.mono, color: T.slate, fontSize: 12 }}>
                    {Number(l.lat).toFixed(4)}, {Number(l.lon).toFixed(4)}
                  </td>
                  <td style={{ padding: 6, width: 110 }}>
                    <input type="number" value={l.fee} onChange={(e) => updateLoc(l.icao, "fee", parseFloat(e.target.value) || 0)} style={numCell} />
                  </td>
                  <td style={{ padding: 6, width: 40 }}>
                    {!l.builtIn && (
                      <button onClick={() => setLocations(locations.filter((x) => x.icao !== l.icao))} style={{ border: "none", background: "none", color: "#B3263A", fontSize: 15 }} title="Remove">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Analytics />
    </div>
  );
}
