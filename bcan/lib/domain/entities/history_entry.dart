DateTime _parseHistoryTimestamp(String? value) {
  if (value == null || value.isEmpty) return DateTime.now();
  var normalized = value.trim();
  if (!normalized.endsWith('Z') && !RegExp(r'[+-]\d{2}:\d{2}$').hasMatch(normalized)) {
    normalized = '${normalized}Z';
  }
  return DateTime.tryParse(normalized)?.toLocal() ?? DateTime.now();
}

class HistoryEntry {
  const HistoryEntry({
    required this.id,
    required this.title,
    required this.timestamp,
  });

  final String id;
  final String title;
  final DateTime timestamp;

  factory HistoryEntry.fromJson(Map<String, dynamic> json) {
    return HistoryEntry(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Untitled',
      timestamp: _parseHistoryTimestamp(json['timestamp'] as String?),
    );
  }
}
