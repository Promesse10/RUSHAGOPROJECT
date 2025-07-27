// Google Directions API utility
const GOOGLE_MAPS_API_KEY = "your_google_maps_api_key_here" // In production, use process.env.GOOGLE_MAPS_API_KEY

// Decode polyline points from Google Directions API
const decodePolyline = (encoded) => {
  const points = []
  let index = 0
  const len = encoded.length
  let lat = 0
  let lng = 0

  while (index < len) {
    let b
    let shift = 0
    let result = 0
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    })
  }

  return points
}

export const getDirections = async (origin, destination) => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`
    const destinationStr = `${destination.latitude},${destination.longitude}`

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === "OK" && data.routes.length > 0) {
      const route = data.routes[0]
      const points = decodePolyline(route.overview_polyline.points)

      return {
        coordinates: points,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        steps: route.legs[0].steps,
      }
    } else {
      throw new Error("No route found")
    }
  } catch (error) {
    console.error("Error getting directions:", error)
    throw error
  }
}
