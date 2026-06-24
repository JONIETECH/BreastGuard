import 'package:flutter/foundation.dart';

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
}

class ScanProvider extends ChangeNotifier {
  final List<Scan> _scans = [];

  List<Scan> get scans => List.unmodifiable(_scans);

  int get totalScans => _scans.length;
  int get highRiskCount => _scans.where((s) => s.isHighRisk).length;

  List<Scan> get recentScans {
    final sorted = [..._scans]..sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return sorted.take(5).toList();
  }

  void addScan(Scan scan) {
    _scans.add(scan);
    notifyListeners();
  }

  void clearScans() {
    _scans.clear();
    notifyListeners();
  }
}
