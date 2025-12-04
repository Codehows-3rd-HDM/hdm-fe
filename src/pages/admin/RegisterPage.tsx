import React, { useState } from "react";
import { User, Lock } from "lucide-react";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("admin");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    const payload = {
      username,
      password,
      role,
    };

    console.log("📌 [API 요청] 계정 생성:", payload);

    try {
      // 실제 API 호출 예시
      /*
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('계정이 성공적으로 생성되었습니다.');
        setUsername('');
        setPassword('');
      } else {
        alert('계정 생성 실패: 중복된 아이디 등');
      }
      */

      alert(
        `[전송 완료]\nID: ${payload.username}\nRole: ${
          payload.role === "admin" ? "관리자" : "사원"
        }`
      );
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white max-w-md mx-auto">
      {/* 1. 타이틀 */}
      <h2 className="text-2xl font-bold mb-10 text-gray-800">계정 등록</h2>

      {/* 2. 아이디 입력칸 */}
      <div className="flex items-center w-full h-12 border border-gray-300 px-4 mb-4 bg-white">
        <User size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="병재 강"
          className="flex-1 h-full ml-2 text-sm text-gray-700 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 3. 비밀번호 입력칸 (+ SHOW 버튼) */}
      <div className="flex items-center w-full h-12 border border-gray-300 px-4 mb-4 bg-white">
        <Lock size={20} className="text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="****"
          className="flex-1 h-full ml-2 text-sm text-gray-700 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="text-xs font-bold text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "HIDE" : "SHOW"}
        </button>
      </div>

      {/* 4. 권한 선택 (라디오 버튼) */}
      <div className="flex items-center justify-center w-full h-12 border border-gray-300 mb-3 text-gray-800 font-bold">
        <label className="flex items-center cursor-pointer mx-5">
          <input
            type="radio"
            name="role"
            value="admin"
            checked={role === "admin"}
            onChange={() => setRole("admin")}
            className="mr-2 w-4 h-4 accent-gray-800 cursor-pointer"
          />
          관리자용
        </label>

        <label className="flex items-center cursor-pointer mx-5">
          <input
            type="radio"
            name="role"
            value="viewer"
            checked={role === "viewer"}
            onChange={() => setRole("viewer")}
            className="mr-2 w-4 h-4 accent-gray-800 cursor-pointer"
          />
          사원용
        </label>
      </div>

      {/* 5. 경고 문구 */}
      <p className="text-red-500 text-sm mb-5 text-center w-full">
        *계정생성 시 권한설정 체크 후 생성해주세요.
      </p>

      {/* 6. 생성 버튼 */}
      <button
        className="w-full h-12 bg-teal-600 text-white text-lg font-bold rounded hover:bg-teal-700 transition-colors"
        onClick={handleRegister}
      >
        계정생성
      </button>
    </div>
  );
};

export default RegisterPage;