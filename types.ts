
export interface DeliveryRecord {
  id: string;
  driverName: string;
  zone: string;
  isSubstitute: boolean;
  locations: string[];
  systemPackages: number;
  offSystemPackages: number;
}

export interface Worksheet {
  id: string;
  date: string;
  records: DeliveryRecord[];
}

export interface DriverZoneMap {
  [driverName: string]: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface TitularDriver {
  id: string;
  name: string;
  zone: string;
}