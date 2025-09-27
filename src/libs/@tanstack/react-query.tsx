import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

// Khởi tạo một QueryClient instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Dữ liệu sẽ được coi là "cũ" (stale) sau 5 phút.
            // Trong khoảng thời gian này, query sẽ không trigger fetch lại khi component re-mount.
            staleTime: 1000 * 60 * 5, // 5 minutes

            // Dữ liệu không hoạt động (inactive) sẽ bị xóa khỏi cache sau 30 phút.
            gcTime: 1000 * 60 * 30, // 30 minutes

            // Tắt việc tự động fetch lại khi cửa sổ trình duyệt được focus.
            // Hữu ích để tránh các lần gọi API không cần thiết.
            refetchOnWindowFocus: false,

            // Tắt việc fetch lại khi component mount lần đầu nếu data đã có.
            refetchOnMount: false,

            // Khi một query bị lỗi, nó sẽ thử lại 3 lần.
            // Có thể set là false nếu muốn xử lý lỗi theo cách riêng.
            retry: 1,
        },
    },
});

/**
 * Component Provider cho React Query.
 */
export const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};