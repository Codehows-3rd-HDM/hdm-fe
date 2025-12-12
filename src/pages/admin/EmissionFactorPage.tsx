import React, { useEffect, useState } from "react";
import {
  getEmissionFactors,
  updateEmissionFactor,
  type EmissionFactor,
} from "../../apis/emissionFactorApi";
import { Pencil, Check, X } from "lucide-react";

const EmissionFactorPageInline: React.FC = () => {
  const [data, setData] = useState<EmissionFactor[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  const [tempFactor, setTempFactor] = useState("");
  const [tempDesc, setTempDesc] = useState("");
  const [tempUnit, setTempUnit] = useState("");

  const fetchData = async () => {
    const result = await getEmissionFactors();
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startEdit = (row: EmissionFactor) => {
    setEditId(row.id);
    setTempFactor(row.emissionFactor.toString());
    setTempDesc(row.remark);
    setTempUnit(row.unitType);
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const save = async (id: number) => {
    await updateEmissionFactor(id, {
      emissionFactor: Number(tempFactor),
      remark: tempDesc,
      unitType: tempUnit,
    });

    setEditId(null);
    fetchData();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        탄소 배출 계수 관리
      </h2>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
        <table className="w-full border-collapse text-center">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-700 text-sm font-semibold">
              <th className="p-3">연료 종류</th>
              <th>단위</th>
              <th>배출 계수</th>
              <th>비고</th>
              <th className="w-24"></th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => {
              const isEdit = editId === row.id;

              return (
                <tr
                  key={row.id}
                  className={`border-b transition ${
                    isEdit ? "bg-blue-50" : idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-100`}
                >
                  {/* 연료 종류 */}
                  <td className="p-3 font-medium text-gray-800">{row.fuelType}</td>

                  {/* 단위 */}
                  <td className="p-3">
                      <span className="text-gray-700">{row.unitType}</span>
                  </td>

                  {/* 배출계수 */}
                  <td className="p-3">
                    {isEdit ? (
                      <input
                        value={tempFactor}
                        onChange={(e) => setTempFactor(e.target.value)}
                        className="border rounded-lg px-2 py-1 text-center w-24 shadow-sm"
                      />
                    ) : (
                      <span className="text-gray-700">{row.emissionFactor}</span>
                    )}
                  </td>

                  {/* 비고 */}
                  <td className="p-3">
                    {isEdit ? (
                      <input
                        value={tempDesc}
                        onChange={(e) => setTempDesc(e.target.value)}
                        className="border rounded-lg px-2 py-1 text-center w-56 shadow-sm"
                      />
                    ) : (
                      <span className="text-gray-700">{row.remark}</span>
                    )}
                  </td>

                  {/* 수정 저장 버튼 */}
                  <td className="p-3">
                    {isEdit ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow"
                          onClick={() => save(row.id)}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 shadow"
                          onClick={cancelEdit}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow"
                        onClick={() => startEdit(row)}
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmissionFactorPageInline;
