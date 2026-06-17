import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_routes.dart';

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 140),
      children: [
        const Text(
          'Account',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 24),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.login),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primaryDark,
                  side: const BorderSide(color: Color(0x55EC4899)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Sign In'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.signup),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Create Account'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 30),
        const Text(
          'History & Previous Cases',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0x1FEC4899)),
          ),
          child: const Center(
            child: Text(
              'Sign in to view your previous screening cases and reports.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
        ),
        const SizedBox(height: 30),
        const Text(
          'About BreastGuard Ai',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0x1FEC4899)),
          ),
          child: const Text(
            'BreastGuard Ai Assistant — Uganda\nMakerere University | Group 11\n\nIntegrates EfficientNetB3 CNN + HGLCM texture features + Clinical Risk Prediction grounded in WHO, Uganda MoH, and NCCN clinical guidelines.\n\nDisclaimer: For clinical decision support only. All results must be reviewed by a qualified clinician.',
            style: TextStyle(color: AppColors.textSecondary, height: 1.5),
          ),
        ),
      ],
    );
  }
}
