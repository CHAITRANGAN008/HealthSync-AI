import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Cloud, Search, Info, Wind, AlertTriangle, Cigarette, Activity } from 'lucide-react';

export function AirQuality() {
  const [city, setCity] = useState('Nagpur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [airData, setAirData] = useState<any>(null);

  const fetchAirQuality = async (cityName: string) => {
    setLoading(true);
    setError('');
    try {
      // 1. Geocode the city
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2. Fetch Air Quality
      const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`);
      const aqiData = await aqiRes.json();

      if (!aqiData.current) {
        throw new Error('Air quality data not available');
      }

      setAirData({
        location: `${name}, ${country}`,
        ...aqiData.current
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch air quality data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirQuality(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchAirQuality(city);
    }
  };

  const getCategory = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-green-500', bg: 'bg-green-500', risk: 'Low', recommendation: 'Great day to be active outside!' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500', risk: 'Moderate', recommendation: 'Unusually sensitive people should consider reducing prolonged or heavy exertion.' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', bg: 'bg-orange-500', risk: 'High', recommendation: 'Sensitive groups should reduce prolonged or heavy exertion.' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-500', risk: 'Very High', recommendation: 'Everyone should reduce prolonged or heavy exertion.' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-500', bg: 'bg-purple-500', risk: 'Severe', recommendation: 'Avoid prolonged or heavy exertion outdoors.' };
    return { label: 'Hazardous', color: 'text-rose-900', bg: 'bg-rose-900', risk: 'Extreme', recommendation: 'Avoid all physical activity outdoors.' };
  };

  const pm25ToCigarettes = (pm25: number) => {
    // Approx: 1 cigarette = 22 μg/m3 of PM2.5 exposure for 24h
    return (pm25 / 22).toFixed(1);
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-10">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Air Pollution Impact
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Understand the real impact of air quality on your health.
        </p>
      </header>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter your city (e.g. Nagpur, London)"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Check AQI'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-600 rounded-xl flex items-center gap-2">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}

      {airData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Overview */}
          <Card className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{airData.location}</h2>
                <p className="text-slate-500">Current Air Quality Index (US AQI)</p>
              </div>
              <div className={`px-4 py-1 rounded-full text-sm font-bold ${getCategory(airData.us_aqi).color} bg-opacity-10 bg-current`}>
                {getCategory(airData.us_aqi).label}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-800" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                    strokeDasharray={`${Math.min((airData.us_aqi / 300) * 283, 283)} 283`}
                    className={`${getCategory(airData.us_aqi).color} transition-all duration-1000`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold">{airData.us_aqi}</span>
                  <span className="text-xs text-slate-400">AQI</span>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" />
                    Health Recommendation
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {getCategory(airData.us_aqi).recommendation}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Cigarette Equivalent Card */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/5">
              <Cloud size={160} />
            </div>
            
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Cigarette className="text-rose-400" /> Equivalent Impact
            </h3>
            
            <div className="mb-6">
              <div className="text-5xl font-black mb-2 flex items-baseline gap-2">
                {pm25ToCigarettes(airData.pm2_5)}
                <span className="text-lg font-medium text-slate-300">cigarettes</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Breathing the air in {airData.location.split(',')[0]} today is approximately equivalent to smoking {pm25ToCigarettes(airData.pm2_5)} cigarettes per day.
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-slate-300 flex items-start gap-2 leading-tight">
                <Info size={12} className="shrink-0 mt-0.5" />
                This is an educational estimate based on PM2.5 levels (~22µg/m³ = 1 cigarette) to raise awareness. It is not a medical diagnosis.
              </p>
            </div>
          </Card>

          {/* Pollutants Breakdown */}
          <Card className="lg:col-span-3 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Major Pollutants</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 mb-1">PM2.5</p>
                <p className="text-xl font-bold">{airData.pm2_5} <span className="text-xs font-normal text-slate-400">µg/m³</span></p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 mb-1">PM10</p>
                <p className="text-xl font-bold">{airData.pm10} <span className="text-xs font-normal text-slate-400">µg/m³</span></p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 mb-1">Ozone (O3)</p>
                <p className="text-xl font-bold">{airData.ozone} <span className="text-xs font-normal text-slate-400">µg/m³</span></p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 mb-1">Nitrogen Dioxide</p>
                <p className="text-xl font-bold">{airData.nitrogen_dioxide} <span className="text-xs font-normal text-slate-400">µg/m³</span></p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 mb-1">Sulphur Dioxide</p>
                <p className="text-xl font-bold">{airData.sulphur_dioxide} <span className="text-xs font-normal text-slate-400">µg/m³</span></p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 mb-1">Carbon Monoxide</p>
                <p className="text-xl font-bold">{airData.carbon_monoxide} <span className="text-xs font-normal text-slate-400">µg/m³</span></p>
              </div>

            </div>
          </Card>
          
          {/* Tips to reduce exposure */}
          <Card className="lg:col-span-3 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Wind size={20} className="text-blue-500" />
              Tips to Reduce Exposure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">Wear a Mask</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Use N95 or N99 masks when outdoors on high pollution days.</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <p className="font-medium text-emerald-900 dark:text-emerald-300 text-sm">Air Purifiers</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Run an air purifier with a HEPA filter indoors.</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <p className="font-medium text-purple-900 dark:text-purple-300 text-sm">Timing Matters</p>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Avoid exercising near busy roads or during rush hour.</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <p className="font-medium text-orange-900 dark:text-orange-300 text-sm">Ventilation</p>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">Keep windows closed when AQI is high, open when it drops.</p>
              </div>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
}
