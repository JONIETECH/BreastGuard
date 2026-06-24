import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/constants/app_colors.dart';
import '../core/constants/app_routes.dart';
import 'pages/login_page.dart';
import 'pages/main_shell_page.dart';
import 'pages/signup_page.dart';
import 'pages/splash_page.dart';
import 'providers/auth_provider.dart';
import 'providers/scan_provider.dart';

class BCanScanApp extends StatelessWidget {
  const BCanScanApp({super.key});

  Widget _authShell(BuildContext context, int index) {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      return const LoginPage();
    }
    return MainShellPage(initialIndex: index);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ScanProvider()),
      ],
      child: MaterialApp(
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
          AppRoutes.riskAssessment: (ctx) => _authShell(ctx, 1),
          AppRoutes.imageUpload: (_) => const MainShellPage(initialIndex: 0),
          AppRoutes.results: (ctx) => _authShell(ctx, 0),
          AppRoutes.assistant: (ctx) => _authShell(ctx, 1),
          AppRoutes.history: (ctx) => _authShell(ctx, 0),
          AppRoutes.about: (_) => const MainShellPage(initialIndex: 2),
          AppRoutes.login: (_) => const LoginPage(),
          AppRoutes.signup: (_) => const SignupPage(),
        },
        onUnknownRoute: (_) =>
            MaterialPageRoute<void>(builder: (_) => const MainShellPage()),
      ),
    );
  }
}
