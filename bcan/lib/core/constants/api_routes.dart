class ApiRoutes {
  const ApiRoutes._();

  static const String baseUrl = 'https://api.bcanscan.com';

  static const String predictRisk = '/api/v1/risk/predict';
  static const String classifyImage = '/api/v1/images/classify';
  static const String sendChatMessage = '/api/v1/chat/message';
  static const String history = '/api/v1/history';
  static const String historySessions = '/api/v1/history/sessions';
}
