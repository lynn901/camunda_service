import React from 'react';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Basic Auth Header Generator
 * Default credentials for Camunda: admin / admin
 */
const AUTH_HEADER = 'Basic ' + btoa('admin:admin');

export async function authFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    'Authorization': AUTH_HEADER
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    console.error('Authentication failed. Please check your credentials.');
  }
  
  return response;
}
