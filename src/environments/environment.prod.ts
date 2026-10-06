/**
 * Entorno de PRODUCCION (AWS).
 * Reemplaza la URL por la del backend desplegado (Elastic Beanstalk / EC2).
 * Angular usa este archivo automaticamente al compilar con --configuration production
 * (ver fileReplacements en angular.json).
 */
export const environment = {
  production: true,
  apiUrl: 'https://TU-BACKEND-EN-AWS/api'
};
