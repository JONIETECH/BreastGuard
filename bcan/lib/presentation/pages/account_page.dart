import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../providers/auth_provider.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 140),
      children: [
        const Text(
          'Account',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 24),
        ),
        const SizedBox(height: 20),
        if (auth.loading)
          const Center(child: CircularProgressIndicator())
        else if (user == null)
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
          )
        else
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
                Text(
                  'Welcome, ${user.fullName ?? user.email}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      await auth.logout();
                      if (context.mounted) {
                        Navigator.pushNamedAndRemoveUntil(
                          context,
                          AppRoutes.home,
                          (_) => false,
                        );
                      }
                    },
                    icon: const Icon(Icons.logout),
                    label: const Text('Logout'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      side: const BorderSide(color: Color(0x55DC2626)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ],
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
