import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Save, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onUpload: (data: any[]) => void;
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  title,
  onUpload,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  // const [previewData, setPreviewData] = useState<any[]>([]); // 화면 표시용 (10개)
  const [fullData, setFullData] = useState<any[]>([]); // 실제 전송할 전체 데이터
  const [headers, setHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      // setPreviewData([]);
      setFullData([]);
      setHeaders([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("엑셀 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      }) as any[];

      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0]));
        setFullData(jsonData);
        // setPreviewData(jsonData.slice(0, 10)); // 미리보기는 10개만
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (fullData.length === 0) {
      alert("업로드된 데이터가 없습니다.");
      return;
    }
    // 부모에게 전체 데이터 전달
    onUpload(fullData);
  };

  return (
    <div className="fixed inset-0 bg-opacity-100 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg w-[800px] max-w-[95%] max-h-[90vh] flex flex-col shadow-lg overflow-hidden" style={{ padding: 'var(--padding-card)' }}>
        {/* Header */}
        <div className="border-b border-gray-200 flex justify-between items-center" style={{ paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet size={24} className="text-green-600" />
            {title}
          </div>
          <button onClick={onClose} className="hover:opacity-70">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1" style={{ padding: 'var(--spacing-md)' }}>
          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer transition-all mb-5 ${
              isDragOver
                ? "border-blue-500 bg-blue-50 text-blue-500"
                : "border-gray-300 bg-gray-50 text-gray-600"
            }`}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload
              size={30}
              className={`mb-2 ${
                isDragOver ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <span className="font-bold">클릭하여 엑셀 파일 업로드</span>
            <span className="text-xs mt-1">
              또는 파일을 여기로 드래그하세요
            </span>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </div>

          {/* Preview Area */}
          {fullData.length > 0 ? (
            <>
              {/* 1. 테이블 미리보기 */}
              <div className="border border-gray-200 rounded overflow-hidden mt-2">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header}
                          className="bg-gray-100 text-left border-b border-gray-300 text-gray-700 font-bold whitespace-nowrap"
                          style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fullData.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((header) => (
                          <td
                            key={header}
                            className="border-b border-gray-200 text-gray-800"
                            style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
                          >
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2 text-right" style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}>
                  * 총 {fullData.length}건
                </p>
              </div>

              {/* 2. 🔥 [복구됨] JSON Raw Preview */}
              {/* <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  📦 파싱된 JSON 데이터 (상위 10건)
                </h3>
                <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-800 overflow-x-auto max-h-64 font-mono leading-relaxed">
                  {JSON.stringify(fullData, null, 2)}
                </pre>
              </div> */}
            </>
          ) : (
            <div className="text-center text-gray-400" style={{ padding: 'var(--padding-card)' }}>
              <AlertCircle size={40} className="mx-auto mb-2 opacity-30" />
              <p>엑셀 파일을 업로드하면 미리보기가 표시됩니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 flex justify-end gap-2 bg-white" style={{ paddingTop: 'var(--spacing-md)' }}>
          <button
            className="border border-gray-300 bg-white rounded font-bold text-gray-600 hover:bg-gray-100"
            style={{ padding: 'var(--padding-btn)' }}
            onClick={onClose}
          >
            취소
          </button>
          <button
            className={`rounded font-bold flex items-center gap-2 ${
              fullData.length === 0
                ? "bg-blue-500 text-white opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            style={{ padding: 'var(--padding-btn)' }}
            onClick={handleSave}
            disabled={fullData.length === 0}
          >
            <Save size={16} />
            데이터 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;
