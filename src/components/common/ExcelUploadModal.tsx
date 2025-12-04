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
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setPreviewData([]);
      setHeaders([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 엑셀 파일 파싱 (컬럼 이름 그대로 사용)
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

      // 첫 행을 헤더로 인식해서 JSON 변환
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

      // 헤더 추출 (첫 행 키값들)
      if (jsonData.length > 0 && typeof jsonData[0] === "object") {
        setHeaders(Object.keys(jsonData[0]));
      }

      // 미리보기는 10건만 표시
      setPreviewData((jsonData as any[]).slice(0, 10));
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

  // 저장 버튼 → 서버 전송
  const handleSave = async () => {
    if (previewData.length === 0) {
      alert("업로드된 데이터가 없습니다.");
      return;
    }

    try {
      const res = await fetch("/api/excel-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      if (res.ok) {
        alert("데이터가 성공적으로 업로드되었습니다!");
        onUpload(previewData);
        onClose();
      } else {
        alert("업로드 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류 발생");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg w-[800px] max-w-[95%] max-h-[90vh] flex flex-col shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet size={24} className="text-green-600" />
            {title}
          </div>
          <button onClick={onClose} className="hover:opacity-70">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
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
              className={`mb-2 ${isDragOver ? "text-blue-500" : "text-gray-400"}`}
            />
            <span className="font-bold">클릭하여 엑셀 파일 업로드</span>
            <span className="text-xs mt-1">또는 파일을 여기로 드래그하세요</span>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </div>

          {/* Preview Area */}
          {previewData.length > 0 ? (
            <>
              <div className="border border-gray-200 rounded overflow-hidden mt-2">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header}
                          className="bg-gray-100 px-3 py-2 text-left border-b border-gray-300 text-gray-700 font-bold whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((header) => (
                          <td
                            key={header}
                            className="px-3 py-2 border-b border-gray-200 text-gray-800"
                          >
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* JSON Raw Preview */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  📦 파싱된 JSON 데이터
                </h3>
                <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-800 overflow-x-auto max-h-64">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center p-10 text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-2 opacity-30" />
              <p>
                엑셀 파일을 업로드하면
                <br />
                데이터 미리보기가 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-end gap-2 bg-white">
          <button
            className="px-4 py-2 border border-gray-300 bg-white rounded font-bold text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${
              previewData.length === 0
                ? "bg-blue-500 text-white opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={handleSave}
            disabled={previewData.length === 0}
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