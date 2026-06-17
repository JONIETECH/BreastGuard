import 'package:flutter/material.dart';

import '../core/constants/app_colors.dart';
import '../core/constants/app_routes.dart';
import 'pages/main_shell_page.dart';
import 'pages/splash_page.dart';

class BCanScanApp extends StatelessWidget {
  const BCanScanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BreastGuard Ai',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),
      initialRoute: AppRoutes.splash,
      routes: {
        AppRoutes.splash: (_) => const SplashPage(),
        AppRoutes.home: (_) => const MainShellPage(initialIndex: 0),
        AppRoutes.riskAssessment: (_) => const MainShellPage(initialIndex: 1),
        AppRoutes.imageUpload: (_) => const MainShellPage(initialIndex: 0),
        AppRoutes.results: (_) => const MainShellPage(initialIndex: 2),
        AppRoutes.assistant: (_) => const MainShellPage(initialIndex: 0),
        AppRoutes.history: (_) => const MainShellPage(initialIndex: 2),
        AppRoutes.about: (_) => const MainShellPage(initialIndex: 2),
        AppRoutes.login: (_) => const MainShellPage(initialIndex: 0),
        AppRoutes.signup: (_) => const MainShellPage(initialIndex: 0),
      },
      onUnknownRoute: (_) =>
          MaterialPageRoute<void>(builder: (_) => const MainShellPage()),
    );
  }
}
