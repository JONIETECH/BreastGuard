import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import '../secure_storage.dart';

class ApiClient {
  ApiClient({http.Client? client})
    : baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:3001',
      _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.readToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> postJson(
    String path,
    Map<String, dynamic> body,
  ) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _client.post(
      uri,
      headers: await _headers(),
      body: jsonEncode(body),
    );

    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> getJson(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _client.get(uri, headers: await _headers());
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> deleteJson(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _client.delete(uri, headers: await _headers());
    return _decodeResponse(response);
  }

  Future<List<dynamic>> getJsonList(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _client.get(uri, headers: await _headers());
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
