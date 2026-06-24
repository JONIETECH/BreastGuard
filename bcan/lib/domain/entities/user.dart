class User {
  const User({
    required this.id,
    required this.email,
    this.fullName,
    this.role,
    this.createdAt,
  });

  final String id;
  final String email;
  final String? fullName;
  final String? role;
  final String? createdAt;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String?,
      role: json['role'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        if (fullName != null) 'fullName': fullName,
        if (role != null) 'role': role,
        if (createdAt != null) 'createdAt': createdAt,
      };
}
