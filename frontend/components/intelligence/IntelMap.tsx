'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type * as Leaflet from 'leaflet';
import type { InfrastructureProject } from '@/lib/api';

interface Props {
  projects: InfrastructureProject[];
  stageColors: Record<string, string>;
}

export default function IntelMap({ projects, stageColors }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet');

    // Fix Leaflet icon paths in Next.js
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(containerRef.current, {
      center: [51.5, -0.1],
      zoom: 4,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever projects change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet');

    const markers: Leaflet.CircleMarker[] = [];

    projects
      .filter((p) => p.latitude != null && p.longitude != null)
      .forEach((p) => {
        const color = stageColors[p.stage || ''] || '#888';
        const radius = p.capacity_mw
          ? Math.min(Math.max(Math.sqrt(p.capacity_mw) * 0.8, 6), 25)
          : 6;

        const marker = L.circleMarker([p.latitude!, p.longitude!], {
          color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 1,
          radius,
        }).addTo(map);

        const popupContainer = document.createElement('div');
        popupContainer.style.minWidth = '200px';

        const nameEl = document.createElement('strong');
        nameEl.style.color = '#fff';
        nameEl.textContent = p.name ?? '';
        popupContainer.appendChild(nameEl);

        if (p.company) {
          const companyEl = document.createElement('p');
          companyEl.style.color = '#aaa';
          companyEl.style.margin = '4px 0 0';
          companyEl.textContent = p.company;
          popupContainer.appendChild(companyEl);
        }

        if (p.location) {
          const locationEl = document.createElement('p');
          locationEl.style.color = '#aaa';
          locationEl.style.margin = '2px 0 0';
          locationEl.textContent = `📍 ${p.location}`;
          popupContainer.appendChild(locationEl);
        }

        if (p.capacity_mw) {
          const capacityEl = document.createElement('p');
          capacityEl.style.color = '#4db6ac';
          capacityEl.style.margin = '2px 0 0';
          capacityEl.textContent = `⚡ ${p.capacity_mw} MW`;
          popupContainer.appendChild(capacityEl);
        }

        if (p.capex_millions) {
          const capexEl = document.createElement('p');
          capexEl.style.color = '#ffb74d';
          capexEl.style.margin = '2px 0 0';
          capexEl.textContent = `💰 £${p.capex_millions}M`;
          popupContainer.appendChild(capexEl);
        }

        if (p.stage) {
          const stageEl = document.createElement('p');
          stageEl.style.color = color;
          stageEl.style.margin = '4px 0 0';
          stageEl.style.textTransform = 'capitalize';
          stageEl.textContent = p.stage;
          popupContainer.appendChild(stageEl);
        }

        marker.bindPopup(popupContainer);
        markers.push(marker);
      });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [projects, stageColors]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '500px', background: '#0d1117' }}
    />
  );
}
