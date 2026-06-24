import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/scan_provider.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<dynamic> _newsArticles = [];
  bool _isLoadingNews = true;
  String _newsError = '';

  @override
  void initState() {
    super.initState();
    _fetchNews();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ScanProvider>().loadScans();
    });
  }

  Future<void> _fetchNews() async {
    try {
      final apiKey = dotenv.env['NEWSAPI_Key'];
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('News API key not found in .env');
      }

      final uri = Uri.parse(
        'https://newsapi.org/v2/everything?q="breast cancer"&sortBy=publishedAt&pageSize=10&language=en&apiKey=$apiKey',
      );

      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _newsArticles = data['articles'] ?? [];
          _isLoadingNews = false;
        });
      } else {
        throw Exception('Failed to load news');
      }
    } catch (e) {
      setState(() {
        _newsError = e.toString();
        _isLoadingNews = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final scanProvider = context.watch<ScanProvider>();
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 150.0,
          floating: false,
          pinned: true,
          automaticallyImplyLeading: false,
          backgroundColor: Colors.white,
          flexibleSpace: FlexibleSpaceBar(
            titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
            title: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Image.asset('assets/icon.webp', height: 30),
                const SizedBox(width: 8),
                Image.asset('assets/wordmark.webp', height: 24),
              ],
            ),
            background: Container(
              color: AppColors.background,
              child: Opacity(
                opacity: 0.5,
                child: Image.asset('assets/sq_bg.png', fit: BoxFit.cover),
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 140),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              if (user != null)
                _buildWelcomeCard(user.fullName ?? user.email),
              _buildStatisticsSection(scanProvider.totalScans, scanProvider.highRiskCount),
              const SizedBox(height: 24),
              _buildRecentScansSection(scanProvider.recentScans),
              const SizedBox(height: 24),
              _buildNewsSection(),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _buildWelcomeCard(String name) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1FEC4899)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0x1FEC4899),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.person, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Welcome back,',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildStatisticsSection(int totalScans, int highRiskCount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: _StatCard(
                title: 'Total Scans',
                value: totalScans.toString(),
                icon: Icons.image_search,
                color: const Color(0xFF10B981),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                title: 'High Risk',
                value: highRiskCount.toString(),
                icon: Icons.warning_amber_rounded,
                color: const Color(0xFFEF4444),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentScansSection(List<Scan> recentScans) {
    if (recentScans.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Recent Assistant Scans',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.secondary,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0x1FEC4899)),
            ),
            child: const Text(
              'No scans yet. Use the Assistant to run a case analysis.',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
        ],
      );
    }

    Color resultColor(String classification) {
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Assistant Scans',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.secondary,
          ),
        ),
        const SizedBox(height: 12),
        ...recentScans.map((scan) {
          final color = resultColor(scan.classification);
          return Container(
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
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'AI Result: ${scan.classification} · ${DateFormat('MMM d, h:mm a').format(scan.timestamp)}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
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
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildNewsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Latest Breast Cancer News',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.secondary,
          ),
        ),
        const SizedBox(height: 12),
        if (_isLoadingNews)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          )
        else if (_newsError.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFCA5A5)),
            ),
            child: Text(
              'Could not load news: $_newsError',
              style: const TextStyle(color: Color(0xFFEF4444)),
            ),
          )
        else if (_newsArticles.isEmpty)
          const Text('No recent news found.', style: TextStyle(color: AppColors.textSecondary))
        else
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _newsArticles.length,
              itemBuilder: (context, index) {
                final article = _newsArticles[index];
                return _NewsCard(article: article);
              },
            ),
          ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1FEC4899)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _NewsCard extends StatelessWidget {
  final dynamic article;

  const _NewsCard({required this.article});

  @override
  Widget build(BuildContext context) {
    final title = article['title'] ?? 'No title';
    final source = article['source']?['name'] ?? 'Unknown source';
    final imageUrl = article['urlToImage'];
    final dateStr = article['publishedAt'];
    
    String formattedDate = '';
    if (dateStr != null) {
      try {
        final date = DateTime.parse(dateStr);
        formattedDate = DateFormat('MMM d, yyyy').format(date);
      } catch (_) {}
    }

    final String? url = article['url'];

    return GestureDetector(
      onTap: () async {
        if (url != null) {
          final uri = Uri.parse(url);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
          }
        }
      },
      child: Container(
        width: 240,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1FEC4899)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 100,
              width: double.infinity,
              color: const Color(0x1FEC4899),
              child: imageUrl != null
                  ? Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.article_outlined,
                        size: 40,
                        color: AppColors.primary,
                      ),
                    )
                  : const Icon(
                      Icons.article_outlined,
                      size: 40,
                      color: AppColors.primary,
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          source,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Text(
                        formattedDate,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
    );
  }
}
