import { useState } from 'react';

// ✨ 수정 1: 훅 자체에는 <T>를 제거합니다. (범용적으로 쓰기 위해)
export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✨ 수정 2: request 함수가 호출될 때마다 새로운 타입 <T>를 받도록 변경
    const request = async <T>(apiCall: () => Promise<{ data: T }>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            setLoading(false);
            // 성공 시 data는 T 타입
            return { success: true, data: response.data, error: null };
        } catch (err: any) {
            setLoading(false);
            const errMsg = err.response?.data?.message || err.message || "오류 발생";
            setError(errMsg);
            // 실패 시 data는 null
            return { success: false, data: null, error: errMsg };
        }
    };

    return { loading, error, request };
}