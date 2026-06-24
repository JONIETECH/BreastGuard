import 'package:flutter/foundation.dart';

import '../../core/constants/api_routes.dart';
import '../../core/network/api_client.dart';

DateTime _parseBackendTimestamp(String? value) {
  if (value == null) return DateTime.now();
  var normalized = value.trim();
  // If the backend omits the timezone suffix, treat it as UTC.
  if (!normalized.endsWith('Z') && !RegExp(r'[+-]\d{2}:\d{2}$').hasMatch(normalized)) {
    normalized = '${normalized}Z';
  }
  return DateTime.tryParse(normalized)?.toLocal() ?? DateTime.now();
}

class Scan {
  Scan({
    required this.id,
    required this.patientNumber,
    required this.classification,
    required this.confidence,
    required this.level,
    required this.score,
    required this.report,
    required this.timestamp,
    this.gradCamBase64,
  });

  final String id;
  final String patientNumber;
  final String classification;
  final int confidence;
  final String level;
  final int score;
  final String report;
  final DateTime timestamp;
  final String? gradCamBase64;

  bool get isHighRisk =>
      classification.toLowerCase() == 'malignant' ||
      level.toLowerCase() == 'high';

  factory Scan.fromJson(Map<String, dynamic> json) {
    return Scan(
      id: json['id'] as String? ?? '',
      patientNumber: json['patientNumber'] as String? ?? '',
      classification: json['classification'] as String? ?? 'Review Required',
      confidence: (json['confidence'] as num?)?.toInt() ?? 0,
      level: json['level'] as String? ?? 'Medium',
      score: (json['score'] as num?)?.toInt() ?? 50,
      report: json['report'] as String? ?? 'No report available.',
      timestamp: _parseBackendTimestamp(json['createdAt'] as String?),
      gradCamBase64: json['gradCamBase64'] as String?,
    );
  }
}

class ScanProvider extends ChangeNotifier {
  final List<Scan> _scans = [];
  final ApiClient _apiClient = ApiClient();

  List<Scan> get scans => List.unmodifiable(_scans);

  int get totalScans => _scans.length;
  int get highRiskCount => _scans.where((s) => s.classification.toLowerCase() == 'malignant').length;

  List<Scan> get recentScans {
    final sorted = [..._scans]..sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return sorted.take(5).toList();
  }

  void addScan(Scan scan) {
    _scans.add(scan);
    notifyListeners();
  }

  Future<void> loadScans() async {
    try {
      final data = await _apiClient.getJson(ApiRoutes.scans);
      final list = (data['scans'] as List<dynamic>?) ?? [];
      _scans
        ..clear()
        ..addAll(list.map((e) => Scan.fromJson(e as Map<String, dynamic>)));
      notifyListeners();
    } catch (e) {
      debugPrint('[ScanProvider] loadScans failed: $e');
    }
  }

  Future<void> deleteScan(String id) async {
    await _apiClient.deleteJson('${ApiRoutes.scans}/$id');
    _scans.removeWhere((s) => s.id == id);
    notifyListeners();
  }

  void clearScans() {
    _scans.clear();
    notifyListeners();
  }
}
