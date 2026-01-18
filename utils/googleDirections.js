// lightweight polyline decoder (compatible with @mapbox/polyline, precision 5)
function decodePolyline(str, precision = 5) {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, precision)

  while (index < str.length) {
    shift = 0
    result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    latitude_change = (result & 1) ? ~(result >> 1) : result >> 1

    shift = 0
    result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    longitude_change = (result & 1) ? ~(result >> 1) : result >> 1

    lat += latitude_change
    lng += longitude_change

    coordinates.push([lat / factor, lng / factor])
  }

  return coordinates
}
const polyline = { decode: decodePolyline }

// Your actual Mapbox access token (keep as-is if this works for you)
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoicHJvbWVzc2VpcmFrb3plMTAiLCJhIjoiY21lNDV1emR5MDgyejJtc2V1M3lnNmU4MiJ9.7_-kgFOI4v1gav56atsBcQ"

// ✅ Calculate straight-line distance between two points (km)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(1)
}

// Internal: normalize the requested mode and traffic preference into a valid Mapbox profile
function normalizeProfile(options = {}) {
  const raw = (options.mode || "driving").toLowerCase()
  const wantsTraffic = options.traffic === true

  // Accept common synonyms without requiring UI changes
  const synonyms = {
    drive: "driving",
    driving: "driving",
    "driving-traffic": "driving-traffic",
    car: "driving",
    auto: "driving",
    walk: "walking",
    walking: "walking",
    cycle: "cycling",
    bike: "cycling",
    bicycle: "cycling",
    cycling: "cycling",
  }

  const base = synonyms[raw] || "driving"
  if (wantsTraffic) {
    // Only driving supports traffic
    return base === "driving" ? "driving-traffic" : base
  }
  return base
}

// Internal: Build a safe Mapbox Directions URL
function buildDirectionsUrl(profile, origin, destination, token, opts = {}) {
  const params = new URLSearchParams({
    steps: "true",
    alternatives: "false",
    overview: "full",
    geometries: "polyline", // keep 5-precision to match @mapbox/polyline default
    access_token: token,
  })

  // Optional toggles
  if (opts.avoidHighways) params.append("exclude", "motorway")
  if (opts.avoidTolls) {
    const existing = params.get("exclude")
    params.set("exclude", existing ? `${existing},toll` : "toll")
  }
  if (opts.language) params.append("language", opts.language)

  const oLng = Number(origin.longitude)
  const oLat = Number(origin.latitude)
  const dLng = Number(destination.longitude)
  const dLat = Number(destination.latitude)

  // Basic guards against invalid numbers
  if (
    !isFinite(oLat) ||
    !isFinite(oLng) ||
    !isFinite(dLat) ||
    !isFinite(dLng) ||
    oLat > 90 ||
    oLat < -90 ||
    dLat > 90 ||
    dLat < -90 ||
    oLng > 180 ||
    oLng < -180 ||
    dLng > 180 ||
    dLng < -180
  ) {
    throw new Error("Invalid origin/destination coordinates")
  }

  // lng,lat;lng,lat is required by Mapbox
  const coords = `${oLng},${oLat};${dLng},${dLat}`
  return `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?${params.toString()}`
}

// Internal: Extract a friendlier maneuver label so your icons match
function toFriendlyManeuver(step) {
  const type = step?.maneuver?.type
  const mod = step?.maneuver?.modifier

  if (type === "turn" && mod) {
    if (mod === "left") return "turn-left"
    if (mod === "right") return "turn-right"
    if (mod === "straight") return "straight"
  }

  // Cover common Mapbox types with a best-effort mapping
  if (type === "merge" && mod === "left") return "turn-left"
  if (type === "merge" && mod === "right") return "turn-right"
  if (type === "fork" && mod === "left") return "turn-left"
  if (type === "fork" && mod === "right") return "turn-right"
  if (type === "roundabout" && mod === "right") return "turn-right"
  if (type === "roundabout" && mod === "left") return "turn-left"
  if (type === "new name" && mod === "straight") return "straight"

  return "straight"
}

// Internal: Actually call Mapbox once with a chosen profile
async function fetchRouteWithProfile(profile, origin, destination, opts, token) {
  const url = buildDirectionsUrl(profile, origin, destination, token, opts)
  const res = await fetch(url)
  const data = await res.json()

  if (!data || !Array.isArray(data.routes) || data.routes.length === 0) {
    throw new Error("No routes found from Mapbox Directions API")
  }

  const route = data.routes[0]
  const points = polyline.decode(route.geometry) // precision=5
  const coordinates = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))

  const leg = route.legs?.[0]
  const steps = Array.isArray(leg?.steps)
    ? leg.steps.map((step) => ({
        distance: `${(step.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(step.duration / 60)} min`,
        instruction: step.maneuver?.instruction || "",
        maneuver: toFriendlyManeuver(step),
      }))
    : []

  return {
    coordinates,
    totalDistance: `${(leg?.distance / 1000).toFixed(1)} km`,
    totalDuration: `${Math.round(leg?.duration / 60)} min`,
    steps,
  }
}

// ✅ Get turn-by-turn route from Mapbox with robust profile handling and fallbacks
export async function getTurnByTurnDirections(origin, destination, options = {}) {
  try {
    const token = MAPBOX_ACCESS_TOKEN
    if (!token) throw new Error("MAPBOX_ACCESS_TOKEN is missing. Add it to your code.")

    // 1) Normalize requested profile
    const primaryProfile = normalizeProfile(options)

    // 2) Prepare a small fallback chain that keeps behavior "car-first"
    const fallbacks = []
    if (primaryProfile === "driving-traffic") {
      fallbacks.push("driving", "walking")
    } else if (primaryProfile === "driving") {
      fallbacks.push("driving-traffic", "walking")
    } else {
      fallbacks.push("driving-traffic", "driving", "walking")
    }

    // Try primary, then fallbacks
    const profilesToTry = [primaryProfile, ...fallbacks]

    let lastError = null
    for (const profile of profilesToTry) {
      try {
        const result = await fetchRouteWithProfile(profile, origin, destination, options, token)
        return result
      } catch (e) {
        lastError = e
        // Continue to next profile
      }
    }

    // If we get here, all attempts failed
    throw lastError || new Error("No routes found from Mapbox Directions API")
  } catch (err) {
    console.error("❌ Error in getTurnByTurnDirections:", err)
    return { coordinates: [], totalDistance: "0 km", totalDuration: "0 min", steps: [] }
  }
}
