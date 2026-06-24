import 'dart:convert';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/secure_storage.dart';
import '../providers/scan_provider.dart';

class AssistantChatPage extends StatefulWidget {
  const AssistantChatPage({super.key});

  @override
  State<AssistantChatPage> createState() => _AssistantChatPageState();
}

class _AssistantChatPageState extends State<AssistantChatPage> {
  File? _selectedImage;
  final TextEditingController _patientNumberController = TextEditingController();
  double _age = 45;
  double _symptomDur = 4;
  String _famHist = 'No';
  String _reproHist = 'Normal';
  final TextEditingController _queryController = TextEditingController(
    text: 'What are the recommended next steps for this patient?',
  );

  bool _isAssessing = false;
  String? _clinicalReport;
  String? _gradCamBase64;
  String? _errorMessage;

  @override
  void dispose() {
    _patientNumberController.dispose();
    _queryController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final FilePickerResult? picked = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: false,
      withData: false,
      dialogTitle: 'Select Histopathology Image',
    );

    if (picked != null && picked.files.isNotEmpty && picked.files.first.path != null) {
      setState(() {
        _selectedImage = File(picked.files.first.path!);
        // Reset results when new image is selected
        _clinicalReport = null;
        _gradCamBase64 = null;
        _errorMessage = null;
      });
    }
  }

  Future<void> _runAssessment() async {
    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload an image first.')),
      );
      return;
    }

    final patientNumber = _patientNumberController.text.trim();
    if (patientNumber.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a patient number.')),
      );
      return;
    }

    setState(() {
      _isAssessing = true;
      _clinicalReport = null;
      _gradCamBase64 = null;
      _errorMessage = null;
    });

    try {
      final baseUrl = ApiClient().baseUrl;
      final Uri uri = Uri.parse('$baseUrl/api/inference');

      // The /api/inference endpoint requires multipart/form-data with
      // the image as the "image" field — NOT JSON with a base64 data URI.
      final request = http.MultipartRequest('POST', uri);

      // Attach the image file
      final String mimeType = _selectedImage!.path.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        _selectedImage!.path,
        contentType: MediaType.parse(mimeType),
      ));

      // Attach the text fields
      request.fields['patient_number'] = patientNumber;
      request.fields['age']              = _age.toInt().toString();
      request.fields['symptom_dur']      = _symptomDur.toString();
      request.fields['fam_hist']         = _famHist;
      request.fields['repro_hist']       = _reproHist;
      request.fields['query']            = _queryController.text;

      final token = await AuthStorage.readToken();
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      final http.StreamedResponse streamed = await request.send();
      final http.Response response = await http.Response.fromStream(streamed);

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body) as Map<String, dynamic>;

        if (!mounted) return;

        // Fetch the attention-map image as base64 if a URL was returned
        String? gradCam;
        final String? attentionMapUrl = data['attentionMapUrl'] as String?;
        if (attentionMapUrl != null && attentionMapUrl.isNotEmpty) {
          try {
            final imgResponse = await http.get(Uri.parse(attentionMapUrl));
            if (imgResponse.statusCode == 200) {
              gradCam = base64Encode(imgResponse.bodyBytes);
            }
          } catch (_) {
            // Non-fatal — just won't show Grad-CAM
          }
        }

        setState(() {
          _clinicalReport = data['report'] as String? ?? 'No report generated.';
          _gradCamBase64  = gradCam;
        });

        if (mounted) {
          final scanProvider = context.read<ScanProvider>();
          scanProvider.addScan(
            Scan(
              id: DateTime.now().millisecondsSinceEpoch.toString(),
              patientNumber: patientNumber,
              classification: data['classification'] as String? ?? 'Review Required',
              confidence: (data['confidence'] as num?)?.toInt() ?? 0,
              level: data['level'] as String? ?? 'Medium',
              score: (data['score'] as num?)?.toInt() ?? 50,
              report: data['report'] as String? ?? 'No report generated.',
              timestamp: DateTime.now(),
              gradCamBase64: gradCam,
            ),
          );
          await scanProvider.loadScans();
        }
      } else {
        throw Exception('API returned status code ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error running assessment: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isAssessing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 140),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Patient Information & Image',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
          ),
          const SizedBox(height: 12),
          
          // Image Picker
          GestureDetector(
            onTap: _isAssessing ? null : _pickImage,
            child: Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x33EC4899)),
              ),
              child: _selectedImage != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.file(_selectedImage!, fit: BoxFit.cover),
                    )
                  : const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.upload_file, size: 40, color: AppColors.secondary),
                        SizedBox(height: 12),
                        Text('Tap to upload Histopathology Image', style: TextStyle(fontWeight: FontWeight.w600)),
                        Text('(PNG/JPG)', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 16),

          // Patient Number
          TextField(
            controller: _patientNumberController,
            enabled: !_isAssessing,
            decoration: const InputDecoration(
              labelText: 'Patient Number',
              hintText: 'e.g., PN-2026-00123',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.badge_outlined),
            ),
            keyboardType: TextInputType.text,
            textInputAction: TextInputAction.next,
          ),
          
          const SizedBox(height: 16),
          
          // Sliders
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Patient Age: ${_age.toInt()} yrs', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    Slider(
                      value: _age,
                      min: 18,
                      max: 90,
                      divisions: 72,
                      activeColor: AppColors.secondary,
                      onChanged: _isAssessing ? null : (val) => setState(() => _age = val),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Symptom Dur: ${_symptomDur.toStringAsFixed(1)} wks', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    Slider(
                      value: _symptomDur,
                      min: 0,
                      max: 52,
                      divisions: 104,
                      activeColor: AppColors.secondary,
                      onChanged: _isAssessing ? null : (val) => setState(() => _symptomDur = val),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          // Dropdowns
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Family History?', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 4),
                    DropdownButtonFormField<String>(
                      initialValue: _famHist,
                      decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12)),
                      items: ['No', 'Yes'].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 14)))).toList(),
                      onChanged: _isAssessing ? null : (val) => setState(() => _famHist = val!),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Reproductive History', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 4),
                    DropdownButtonFormField<String>(
                      initialValue: _reproHist,
                      decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12)),
                      items: ['Normal', 'Early Menarche', 'Nulliparous'].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 14)))).toList(),
                      onChanged: _isAssessing ? null : (val) => setState(() => _reproHist = val!),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Query
          const Text('Clinical Query for Guideline Retrieval', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 4),
          TextField(
            controller: _queryController,
            enabled: !_isAssessing,
            maxLines: 2,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            style: const TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 20),
          
          // Run Button
          FilledButton.icon(
            onPressed: _isAssessing ? null : _runAssessment,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.secondary,
              minimumSize: const Size.fromHeight(50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: _isAssessing 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                : const Icon(Icons.bolt),
            label: Text(_isAssessing ? 'Running AI Assessment...' : 'Run AI Assessment', style: const TextStyle(fontSize: 16)),
          ),
          
          const SizedBox(height: 30),
          
          // Results Section
          if (_errorMessage != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.red)),
              child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
            ),
            
          if (_clinicalReport != null || _gradCamBase64 != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('AI Assessment Results', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
                const SizedBox(height: 12),
                DefaultTabController(
                  length: 2,
                  child: Column(
                    children: [
                      const TabBar(
                        labelColor: AppColors.primaryDark,
                        unselectedLabelColor: AppColors.textSecondary,
                        indicatorColor: AppColors.primary,
                        tabs: [
                          Tab(text: 'Clinical Report', icon: Icon(Icons.description_outlined, size: 20)),
                          Tab(text: 'Grad-CAM', icon: Icon(Icons.biotech_outlined, size: 20)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 400,
                        child: TabBarView(
                          children: [
                            // Clinical Report Tab
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                              child: SingleChildScrollView(
                                child: Text(_clinicalReport ?? 'No report generated.', style: const TextStyle(fontFamily: 'monospace', fontSize: 12, height: 1.5)),
                              ),
                            ),
                            
                            // Grad-CAM Tab
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                              child: Column(
                                children: [
                                  Expanded(
                                    child: _gradCamBase64 != null && _gradCamBase64!.isNotEmpty
                                        ? ClipRRect(
                                            borderRadius: BorderRadius.circular(8),
                                            child: Image.memory(
                                              base64Decode(_gradCamBase64!),
                                              fit: BoxFit.contain,
                                            ),
                                          )
                                        : const Center(child: Text('No Grad-CAM available')),
                                  ),
                                  const SizedBox(height: 12),
                                  const Text('Red/Yellow = Regions most influential in AI decision\nBlue = Less influential regions', style: TextStyle(fontSize: 11, color: AppColors.textSecondary), textAlign: TextAlign.center),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
