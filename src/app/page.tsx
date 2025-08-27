'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
// Update the import path to the correct location of Checkbox
import { Checkbox } from '@/components/checkbox';
// If Checkbox is not available, create it or adjust the path accordingly.
import { Upload, FileText, CheckCircle, AlertCircle, Zap, BarChart3, Target, Trophy } from '../components/icons';
import { analyzeXMLContent } from '../src/lib/xml-analyzer';

// Types
interface DuplicateResult {
  objectId: string;
  count: number;
  className?: string;
}

interface AnalysisResponse {
  success: boolean;
  fileName: string;
  duplicates: DuplicateResult[];
  error?: string;
}

export default function XMLDuplicateAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'text/xml' || droppedFile.name.toLowerCase().endsWith('.xml')) {
        setFile(droppedFile);
        setResults(null);
        setCheckedIds(new Set());
      } else {
        alert('يرجى اختيار ملفات XML فقط / Please select XML files only');
      }
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      if (selectedFile.type === 'text/xml' || selectedFile.name.toLowerCase().endsWith('.xml')) {
        setFile(selectedFile);
        setResults(null);
        setCheckedIds(new Set());
      } else {
        alert('يرجى اختيار ملفات XML فقط / Please select XML files only');
        event.target.value = '';
      }
    }
  };

  

  // Handle file upload and analysis
  const handleUpload = async () => {
    if (!file) {
      alert('يرجى اختيار ملف أولاً / Please select a file first');
      return;
    }

    setLoading(true);
    
    try {
      const xmlContent = await file.text();
      const duplicates = analyzeXMLContent(xmlContent);
      
      setResults({
        success: true,
        fileName: file.name,
        duplicates
      });
      setCheckedIds(new Set());
    } catch (error) {
      console.error('Error analyzing file:', error);
      setResults({
        success: false,
        fileName: file.name,
        duplicates: [],
        error: 'فشل في تحليل ملف XML. يرجى التحقق من تنسيق الملف / Failed to parse XML file. Please check the file format.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (objectId: string, checked: boolean) => {
    const newCheckedIds = new Set(checkedIds);
    if (checked) {
      newCheckedIds.add(objectId);
    } else {
      newCheckedIds.delete(objectId);
    }
    setCheckedIds(newCheckedIds);
  };

  const totalItems = results?.duplicates.length || 0;
  const completedItems = checkedIds.size;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Get pending and completed items with their indices
  const pendingItems = results?.duplicates.filter(item => !checkedIds.has(item.objectId)) || [];
  const completedItems_list = results?.duplicates.filter(item => checkedIds.has(item.objectId)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            XML Duplicate Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            تحليل ملفات XML للعثور على قيم ObjectId المكررة في عناصر ViewObject
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Section */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">رفع الملف / Upload File</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50/50 scale-105' 
                    : file 
                      ? 'border-green-300 bg-green-50/30'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                    file ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {file ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    {file ? (
                      <>
                        <p className="text-lg font-medium text-green-700">تم اختيار الملف بنجاح! / File selected successfully!</p>
                        <p className="text-sm text-gray-600">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-gray-700">اسحب الملف هنا أو انقر للاختيار / Drag file here or click to select</p>
                        <p className="text-sm text-gray-500">يدعم ملفات XML فقط / Supports XML files only</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`mt-6 w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  !file || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري التحليل... / Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    تحليل الملف / Analyze File
                  </div>
                )}
              </button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results && (
            <>
              {/* Progress Card */}
              {results.success && results.duplicates.length > 0 && (
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-amber-500" />
                        <span className="text-lg font-semibold text-gray-800">التقدم / Progress</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {completedItems} من / of {totalItems}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{Math.round(progressPercentage)}% مكتمل / completed</p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">نتائج التحليل / Analysis Results</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  {results.success ? (
                    <>
                      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">تم تحليل الملف بنجاح: / File analyzed successfully: </span>
                          <span className="font-bold">{results.fileName}</span>
                        </div>
                      </div>

                      {results.duplicates.length > 0 ? (
                        <div className="space-y-8">
                          {/* Pending Items */}
                          <section>
                            <div className="flex items-center gap-3 mb-4">
                              <Target className="w-5 h-5 text-blue-500" />
                              <h3 className="text-lg font-bold text-gray-800">العناصر المعلقة / Pending Items</h3>
                              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                                {pendingItems.length}
                              </span>
                            </div>
                            
                            <div className="grid gap-3">
                              {pendingItems.length === 0 ? (
                                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-center">
                                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                  <p className="text-gray-600 font-medium">لا توجد عناصر معلقة - ممتاز! / No pending items - Excellent!</p>
                                </div>
                              ) : (
                                pendingItems.map((item, index) => (
                                  <Card key={item.objectId} className="border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                                    <CardContent className="flex items-center p-4">
                                      <div className="flex items-center gap-3 mr-4">
                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full">
                                          {index + 1}
                                        </span>
                                        <Checkbox
                                          checked={false}
                                          onChange={(checked) => handleCheckboxChange(item.objectId, checked)}
                                          id={`pending-${item.objectId}`}
                                        />
                                      </div>
                                      <div className="flex-1 flex items-center gap-3">
                                        <span className="font-mono text-gray-900 font-medium">{item.objectId}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                                            {item.count} مرات / times
                                          </span>
                                          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                            {item.className || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              )}
                            </div>
                          </section>

                          {/* Completed Items */}
                          {completedItems_list.length > 0 && (
                            <section>
                              <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-bold text-gray-800">العناصر المكتملة / Completed Items</h3>
                                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                  {completedItems_list.length}
                                </span>
                              </div>
                              
                              <div className="grid gap-3">
                                {completedItems_list.map((item, index) => (
                                  <Card key={item.objectId} className="border border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                                    <CardContent className="flex items-center p-4">
                                      <div className="flex items-center gap-3 mr-4">
                                        <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full">
                                          {pendingItems.length + index + 1}
                                        </span>
                                        <Checkbox
                                          checked={true}
                                          onChange={(checked) => handleCheckboxChange(item.objectId, checked)}
                                          id={`completed-${item.objectId}`}
                                        />
                                      </div>
                                      <div className="flex-1 flex items-center gap-3 opacity-75">
                                        <span className="font-mono font-medium line-through text-gray-500">{item.objectId}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">
                                            {item.count} مرات / times
                                          </span>
                                          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full">
                                            {item.className || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </section>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-center">
                          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-medium">لم يتم العثور على ObjectIds مكررة وفقاً للمعايير المحددة / No duplicate ObjectIds found according to the specified criteria</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                      <p className="text-red-700 font-medium">خطأ: / Error: {results.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Instructions Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">كيف يعمل / How It Works</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <p className="text-gray-700">يظهر النتائج للـ ObjectIds المكررة (تظهر أكثر من مرة واحدة) للفئات العادية / Shows results for duplicate ObjectIds (appear more than once) for regular classes</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <p className="text-gray-700">لفئات &quot;DistanceSensor&quot; أو &quot;ConveyorGroup&quot;، يظهر النتائج فقط إذا ظهرت أكثر من 3 مرات / For &quot;DistanceSensor&quot; or &quot;ConveyorGroup&quot; classes, shows results only if they appear more than 3 times</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <p className="text-gray-700">يبحث عن عناصر ViewObject ويستخرج قيم خاصية ObjectId / Searches for ViewObject elements and extracts ObjectId property values</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                  <p className="text-gray-700">يدعم ملفات XML فقط مع وظيفة السحب والإفلات / Supports XML files only with drag &amp; drop functionality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}