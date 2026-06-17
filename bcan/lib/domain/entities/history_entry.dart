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
      timestamp:
          DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}
