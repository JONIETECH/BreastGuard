import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import 'account_page.dart';
import 'assistant_chat_page.dart';
import 'home_page.dart';

class MainShellPage extends StatefulWidget {
  const MainShellPage({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<MainShellPage> createState() => _MainShellPageState();
}

class _MainShellPageState extends State<MainShellPage> {
  late int _index = widget.initialIndex;

  static const List<Widget> _pages = <Widget>[
    HomePage(),
    AssistantChatPage(),
    AccountPage(),
  ];

  static const List<_NavItem> _items = <_NavItem>[
    _NavItem('Home', Icons.home_outlined),
    _NavItem('Assistant', Icons.smart_toy_outlined),
    _NavItem('Account', Icons.person_outline),
  ];

  static const List<String> _titles = <String>[
    'Home',
    'AI Assistant',
    'Account',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _index == 0 ? null : AppBar(
        automaticallyImplyLeading: false,
        titleSpacing: 12,
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Image.asset(
                'assets/icon.webp',
                width: 36,
                height: 36,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Image.asset(
                  'assets/wordmark.webp',
                  height: 16,
                  fit: BoxFit.contain,
                ),
                Text(
                  _titles[_index],
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 260),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: KeyedSubtree(key: ValueKey<int>(_index), child: _pages[_index]),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 2, 14, 6),
          child: Container(
            height: 58,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0x14EC4899)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x1A000000),
                  blurRadius: 16,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                for (int i = 0; i < _items.length; i++)
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _index = i),
                      behavior: HitTestBehavior.opaque,
                      child: _AnimatedNavTile(
                        item: _items[i],
                        selected: i == _index,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AnimatedNavTile extends StatelessWidget {
  const _AnimatedNavTile({required this.item, required this.selected});

  final _NavItem item;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      padding: EdgeInsets.symmetric(horizontal: selected ? 8 : 6, vertical: 4),
      decoration: BoxDecoration(
        color: selected ? const Color(0x1FEC4899) : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedScale(
            duration: const Duration(milliseconds: 220),
            scale: selected ? 1.12 : 1,
            child: Icon(
              item.icon,
              color: selected ? AppColors.primaryDark : AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 220),
            style: TextStyle(
              fontSize: 10,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              color: selected ? AppColors.primaryDark : AppColors.textSecondary,
            ),
            child: FittedBox(fit: BoxFit.scaleDown, child: Text(item.label)),
          ),
        ],
      ),
    );
  }
}

class _NavItem {
  const _NavItem(this.label, this.icon);

  final String label;
  final IconData icon;
}
