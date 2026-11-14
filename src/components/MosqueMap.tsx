/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MasjidItem } from '../types/index.js';
import { MapPin, Navigation, ExternalLink, Search, Crosshair } from 'lucide-react';

function createMosqueMarkerIcon(isPrimary = true) {
  const bg = isPrimary ? '#047857' : '#0f766e';
  return L.divIcon({
    className: 'custom-mosque-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${bg};
        border: 3px solid #ffffff;
        border-radius: 9999px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.28);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L9 8h6l-3-6zm0 7c-4.4 0-8 3.6-8 8v4h16v-4c0-4.4-3.6-8-8-8zm-5 10c.5-2.8 3-5 5-5s4.5 2.2 5 5H7z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
}

interface MosqueMapProps {
  masjids: MasjidItem[];
  selectedMasjid?: MasjidItem | null;
  height?: string;
  onSelectMasjid?: (id: string) => void;
  showExternalButtons?: boolean;
}

export const MosqueMap: React.FC<MosqueMapProps> = ({
  masjids,
  selectedMasjid,
  height = '380px',
  onSelectMasjid,
  showExternalButtons = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const validMasjids = masjids.filter(
    (m) =>
      typeof m.latitude === 'number' &&
      !isNaN(m.latitude) &&
      typeof m.longitude === 'number' &&
      !isNaN(m.longitude)
  );

  const primaryMasjid = selectedMasjid || (validMasjids.length === 1 ? validMasjids[0] : null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = primaryMasjid
        ? [primaryMasjid.latitude, primaryMasjid.longitude]
        : validMasjids.length > 0
        ? [validMasjids[0].latitude, validMasjids[0].longitude]
        : [-0.895084, 119.875274];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: primaryMasjid ? 16 : 13,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: [number, number][] = [];

    validMasjids.forEach((m) => {
      const isSelected = primaryMasjid?.id_masjid === m.id_masjid;
      const marker = L.marker([m.latitude, m.longitude], {
        icon: createMosqueMarkerIcon(isSelected),
      });

      const googleMapsUrl = `https://www.google.com/maps?q=${m.latitude},${m.longitude}`;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`;

      const popupDiv = document.createElement('div');
      popupDiv.style.minWidth = '220px';
      popupDiv.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
      popupDiv.innerHTML = `
        <div style="padding: 2px;">
          <div style="font-size: 10px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.04em;">
            Kelurahan ${m.kelurahan}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">
            ${m.nama_masjid}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.4;">
            ${m.alamat}
          </div>
          <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer"
               style="font-size: 11px; font-weight: 600; color: #047857; background: #ecfdf5; padding: 4px 8px; border-radius: 6px; text-decoration: none; border: 1px solid #a7f3d0;">
              Buka di Google Maps
            </a>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
               style="font-size: 11px; font-weight: 600; color: #ffffff; background: #047857; padding: 4px 8px; border-radius: 6px; text-decoration: none;">
              Petunjuk Arah
            </a>
          </div>
        </div>
      `;

      if (onSelectMasjid && validMasjids.length > 1) {
        const detailBtn = document.createElement('button');
        detailBtn.type = 'button';
        detailBtn.textContent = 'Lihat Profil Masjid →';
        detailBtn.style.cssText =
          'margin-top: 8px; width: 100%; font-size: 11px; font-weight: 700; color: #0f172a; background: #f1f5f9; padding: 5px 8px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;';
        detailBtn.onclick = () => onSelectMasjid(m.id_masjid);
        popupDiv.querySelector('div')?.appendChild(detailBtn);
      }

      marker.bindPopup(popupDiv);
      marker.addTo(layerGroup);

      if (isSelected && validMasjids.length === 1) {
        setTimeout(() => marker.openPopup(), 150);
      }

      bounds.push([m.latitude, m.longitude]);
    });

    setTimeout(() => {
      map.invalidateSize();
      if (primaryMasjid) {
        map.setView([primaryMasjid.latitude, primaryMasjid.longitude], 16);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 16);
      }
    }, 100);
  }, [masjids, selectedMasjid]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 z-0">
        <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
      </div>

      {showExternalButtons && primaryMasjid && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-start sm:items-center gap-2 text-slate-600 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
            <span className="truncate">
              <strong className="text-slate-900">{primaryMasjid.nama_masjid}</strong> — {primaryMasjid.alamat}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps?q=${primaryMasjid.latitude},${primaryMasjid.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Google Maps</span>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${primaryMasjid.latitude},${primaryMasjid.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Petunjuk Arah</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PEMILIH LOKASI INTERAKTIF UNTUK FORMULIR TAMBAH / EDIT MASJID
// ============================================================================
interface MapLocationPickerProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number, autoAddress?: string, autoKelurahan?: string) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    suburb?: string;
    village?: string;
    neighbourhood?: string;
    city_district?: string;
    road?: string;
  };
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  onChangeLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [locatingGps, setLocatingGps] = useState(false);
  const [statusNote, setStatusNote] = useState(
    'Klik pada peta atau geser penanda hijau untuk mengatur titik lokasi masjid secara presisi.'
  );

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const addr = data.display_name || '';
      const kel =
        data.address?.suburb ||
        data.address?.village ||
        data.address?.neighbourhood ||
        '';
      onChangeLocation(Number(lat.toFixed(6)), Number(lng.toFixed(6)), addr, kel);
      setStatusNote('Titik lokasi diperbarui dan alamat terisi otomatis dari peta.');
    } catch {
      onChangeLocation(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const validLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : -0.895084;
    const validLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : 119.875274;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [validLat, validLng],
        zoom: 16,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([validLat, validLng], {
        draggable: true,
        icon: createMosqueMarkerIcon(true),
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      const currentPos = markerRef.current?.getLatLng();
      if (
        currentPos &&
        (Math.abs(currentPos.lat - validLat) > 0.00001 ||
          Math.abs(currentPos.lng - validLng) > 0.00001)
      ) {
        markerRef.current?.setLatLng([validLat, validLng]);
        mapRef.current.setView([validLat, validLng], 16);
      }
    }

    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 120);
  }, [latitude, longitude]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSearchAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const data: NominatimResult[] = await res.json();
      setSearchResults(data || []);
      if (!data || data.length === 0) {
        setStatusNote(
          'Lokasi tidak ditemukan melalui pencarian teks. Silakan klik langsung pada peta atau geser penanda.'
        );
      }
    } catch {
      setStatusNote('Gagal mencari alamat. Silakan pilih titik langsung pada peta.');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (item: NominatimResult) => {
    const lat = Number(parseFloat(item.lat).toFixed(6));
    const lng = Number(parseFloat(item.lon).toFixed(6));
    const kel =
      item.address?.suburb ||
      item.address?.village ||
      item.address?.neighbourhood ||
      '';
    onChangeLocation(lat, lng, item.display_name, kel);
    setSearchResults([]);
    setStatusNote(`Lokasi dipilih: ${item.display_name}`);
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 17);
    }
  };

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      setStatusNote('Perangkat/browser Anda tidak mendukung fitur geolokasi.');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], 17);
        }
        reverseGeocode(lat, lng);
      },
      () => {
        setLocatingGps(false);
        setStatusNote(
          'Izin lokasi perangkat tidak diberikan. Silakan cari nama jalan atau klik langsung pada peta.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchAddress();
              }
            }}
            placeholder="Cari nama masjid, jalan, atau kelurahan di peta..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="button"
          onClick={() => handleSearchAddress()}
          disabled={searching}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
        >
          {searching ? 'Mencari...' : 'Cari Lokasi'}
        </button>
        <button
          type="button"
          onClick={handleUseDeviceLocation}
          disabled={locatingGps}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors shrink-0"
          title="Gunakan Lokasi Perangkat Saat Ini"
        >
          <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
          <span>{locatingGps ? 'Mendeteksi...' : 'Lokasi Perangkat'}</span>
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-44 overflow-y-auto shadow-sm">
          {searchResults.map((item) => (
            <button
              key={item.place_id}
              type="button"
              onClick={() => selectSearchResult(item)}
              className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-emerald-50 transition-colors flex items-start gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">{item.display_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-slate-300 bg-slate-200">
        <div ref={mapContainerRef} style={{ height: '270px', width: '100%' }} />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span>{statusNote}</span>
      </div>
    </div>
  );
};
