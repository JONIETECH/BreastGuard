import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../providers/scan_provider.dart';

class ScanDetailPage extends StatelessWidget {
  const ScanDetailPage({super.key, required this.scan});

  final Scan scan;

  @override
  Widget build(BuildContext context) {
    final color = _resultColor(scan.classification);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Scan Result'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x1FEC4899)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.document_scanner, color: color),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              scan.patientNumber.isNotEmpty
                                  ? 'Patient ${scan.patientNumber}'
                                  : 'Unnamed Patient',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              DateFormat('MMM d, yyyy · h:mm a').format(scan.timestamp),
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _MetricCard(
                          label: 'Classification',
                          value: scan.classification,
                          color: color,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MetricCard(
                          label: 'Confidence',
                          value: '${scan.confidence}%',
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _MetricCard(
                          label: 'Risk Level',
                          value: scan.level,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MetricCard(
                          label: 'Risk Score',
                          value: '${scan.score}/100',
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Clinical Report',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x1FEC4899)),
              ),
              child: Text(
                scan.report,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
              ),
            ),
            if (scan.gradCamBase64 != null && scan.gradCamBase64!.isNotEmpty) ...[
              const SizedBox(height: 20),
              const Text(
                'Attention Map',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0x1FEC4899)),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.memory(
                    base64Decode(scan.gradCamBase64!),
                    fit: BoxFit.contain,
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Color _resultColor(String classification) {
    switch (classification.toLowerCase()) {
      case 'malignant':
      case 'high':
        return const Color(0xFFEF4444);
      case 'benign':
      case 'low':
        return const Color(0xFF10B981);
      default:
        return const Color(0xFFF59E0B);
    }
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }
}
