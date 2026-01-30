import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

    // 1. [자동] URL이 바뀌거나 컴포넌트가 켜지면 데이터를 가져오는 훅
export function useAxios<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 데이터 가져오는 함수 (새로고침을 위해 밖으로 뺌)
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get<T>(url);
            setData(res.data);
        } catch (err: any) {
            setError(err.message || "알 수 없는 오류");
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // refetch: 저장/삭제 후 목록을 다시 불러올 때 사용
    return { data, loading, error, refetch: fetchData };
}

export default useAxios;