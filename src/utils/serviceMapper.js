export const ServiceErrorType = {
  SERVICE_DOWN: 'SERVICE_DOWN',
  NO_CONNECTION: 'NO_CONNECTION',
  TIMEOUT: 'TIMEOUT',
  NO_INTERNET: 'NO_INTERNET',
};

export const getServiceName = (path) => {
  if (!path) return 'API Gateway (puerto 8080)';
  if (path.startsWith('/api/auth') || path.startsWith('/api/users')) {
    return 'Auth Service (puerto 8081)';
  }
  if (path.startsWith('/api/subjects') || path.startsWith('/api/enrollments') || path.startsWith('/api/classes')) {
    return 'Subject Service (puerto 8082)';
  }
  if (path.startsWith('/api/documents')) {
    return 'Document Service (puerto 8083)';
  }
  if (path.startsWith('/api/tests') || path.startsWith('/api/repaso')) {
    return 'Test Service (puerto 8084)';
  }
  return 'API Gateway (puerto 8080)';
};