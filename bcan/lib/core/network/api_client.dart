import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient({http.Client? client})
    : baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:3001/api/inference',
      _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<Map<String, dynamic>> postJson(
    String path,
    Map<String, dynamic> body,
  ) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _client.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    return _decodeResponse(response);
  }

  Future<List<dynamic>> getJsonList(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _client.get(uri);
    final decoded = _decodeRaw(response);

    if (decoded is List<dynamic>) {
      return decoded;
    }
    throw const FormatException('Expected a list response.');
  }

  dynamic _decodeRaw(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(response.statusCode, response.body);
    }
    return jsonDecode(response.body);
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    final decoded = _decodeRaw(response);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }
    throw const FormatException('Expected an object response.');
  }
}

class ApiException implements Exception {
  const ApiException(this.statusCode, this.message);

  final int statusCode;
  final String message;

  @override
  String toString() =>
      'ApiException(statusCode: $statusCode, message: $message)';
}
