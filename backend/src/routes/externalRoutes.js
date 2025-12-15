import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * 🌤️ Get current weather for a given city
 * Example: GET /api/weather/Nablus
 */
router.get("/weather/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing WEATHER_API_KEY in .env" });
    }

    // 🌍 Call OpenWeatherMap API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: apiKey,
          units: "metric", // °C instead of Kelvin
        },
      }
    );

    // Extract relevant fields
    const data = {
      city: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      wind_speed: response.data.wind.speed,
    };

    res.json(data);
  } catch (err) {
    console.error("❌ Weather API error:", err.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});


export default router;
