import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../providers/scan_provider.dart';
import 'scan_detail_page.dart';

class AllScansPage extends StatefulWidget {
  const AllScansPage({super.key});

  @override
  State<AllScansPage> createState() => _AllScansPageState();
}

class _AllScansPageState extends State<AllScansPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ScanProvider>().loadScans();
    });
  }

  @override
  Widget build(BuildContext context) {
    final scanProvider = context.watch<ScanProvider>();
    final allScans = scanProvider.scans;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('All Scans'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: allScans.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.document_scanner_outlined,
                      size: 48,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'No scans yet.',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              itemCount: allScans.length,
              itemBuilder: (context, index) {
                final scan = allScans[index];
                return _ScanListTile(scan: scan);
              },
            ),
    );
  }
}

class _ScanListTile extends StatelessWidget {
  const _ScanListTile({required this.scan});

  final Scan scan;

  @override
  Widget build(BuildContext context) {
    final color = _resultColor(scan.classification);
    final isHigh = scan.classification.toLowerCase() == 'malignant';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ScanDetailPage(scan: scan),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0x1FEC4899)),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
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
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${scan.classification} · ${DateFormat('MMM d, yyyy · h:mm a').format(scan.timestamp)}',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${scan.score}/100',
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              isHigh ? Icons.arrow_forward_ios : Icons.arrow_forward_ios,
              size: 14,
              color: AppColors.textSecondary,
            ),
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
