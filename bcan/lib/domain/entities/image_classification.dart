class ImageClassification {
  const ImageClassification({
    required this.classification,
    required this.confidence,
  });

  final String classification;
  final double confidence;

  factory ImageClassification.fromJson(Map<String, dynamic> json) {
    final confidenceRaw = json['confidence'];
    final confidence = confidenceRaw is num ? confidenceRaw.toDouble() : 0.0;

    return ImageClassification(
      classification: json['classification'] as String? ?? 'Unknown',
      confidence: confidence,
    );
  }
}
