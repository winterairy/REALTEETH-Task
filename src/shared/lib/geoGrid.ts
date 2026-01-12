export type GridPoint = {
  x: number;
  y: number;
};

const RE = 6371.00877; // Earth radius (km)
const GRID = 5.0; // Grid spacing (km)
const SLAT1 = 30.0; // Projection latitude 1 (deg)
const SLAT2 = 60.0; // Projection latitude 2 (deg)
const OLON = 126.0; // Origin longitude (deg)
const OLAT = 38.0; // Origin latitude (deg)
const XO = 43.0; // Origin X (grid)
const YO = 136.0; // Origin Y (grid)

const DEGRAD = Math.PI / 180.0;

export const toGridPoint = (latitude: number, longitude: number): GridPoint => {
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  const sn =
    Math.log(Math.cos(slat1) / Math.cos(slat2)) /
    Math.log(
      Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
        Math.tan(Math.PI * 0.25 + slat1 * 0.5),
    );
  const sf =
    (Math.pow(Math.tan(Math.PI * 0.25 + slat1 * 0.5), sn) *
      Math.cos(slat1)) /
    sn;
  const ro = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);

  const ra =
    (re * sf) /
    Math.pow(Math.tan(Math.PI * 0.25 + latitude * DEGRAD * 0.5), sn);
  let theta = longitude * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { x, y };
};
