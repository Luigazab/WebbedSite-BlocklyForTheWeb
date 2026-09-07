
import { Monitor, Laptop, Tablet, Smartphone } from 'lucide-react';

export const deviceSizes = {
  desktop: { width: 1440, height: 900, label: 'Desktop', icon: Monitor, scale: 1 },
  laptop: { width: 1024, height: 768, label: 'Laptop', icon: Laptop, scale: 1 },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet, scale: 0.7 },
  phone: { width: 375, height: 667, label: 'Phone', icon: Smartphone, scale: 1.2 }
};