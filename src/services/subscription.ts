import { axiosPrivate } from "@configs/axios";
import { ISubscriptionPurchaseRequest, SubscriptionPackageType } from "@models/subscription/subscription.request";
import { ISubscriptionPackageResponse, ISubscriptionPurchaseResponse } from "@models/subscription/subscription.response";

const subscriptionService = {
    getMarketplacePackages: async () => {
        return await axiosPrivate.get(`/subscription/marketplace/list`);
    },

    /**
     * Get all available subscription packages
     */
    getPackages: async (): Promise<{ data: ISubscriptionPackageResponse[] }> => {
        // Mock API - simulate network latency
        await new Promise(res => setTimeout(res, 300));

        const mockPackages: ISubscriptionPackageResponse[] = [
            {
                id: 1,
                packageType: SubscriptionPackageType.READING,
                name: "Gói Reading",
                description: "Mở khoá trọn đời tất cả các bài học Reading",
                price: 99000,
                duration: "lifetime",
                benefits: [
                    "Mở khoá trọn đời tất cả các bài học Reading",
                ],
                isActive: true,
            },
            {
                id: 2,
                packageType: SubscriptionPackageType.LISTENING,
                name: "Gói Listening",
                description: "Mở khoá trọn đời tất cả các bài học Listening",
                price: 99000,
                duration: "lifetime",
                benefits: [
                    "Mở khoá trọn đời tất cả các bài học Listening",
                ],
                isActive: true,
            },
            {
                id: 3,
                packageType: SubscriptionPackageType.READING_LISTENING,
                name: "Gói Reading + Listening",
                description: "Mở khoá trọn đời Reading + Listening",
                price: 249000,
                duration: "lifetime",
                benefits: [
                    "Mở khoá trọn đời tất cả các bài học Reading",
                    "Mở khoá trọn đời tất cả các bài học Listening",
                ],
                isActive: true,
            },
            {
                id: 4,
                packageType: SubscriptionPackageType.ULTRA_EXPLORER,
                name: "Gói Nhà Thám Hiểm Ultra",
                description: "Gói premium với nhiều đặc quyền",
                price: 129000,
                duration: "1 month",
                benefits: [
                    "Tăng thêm kinh nghiệm khi học xong bài học (x1.2)",
                    "Tăng xu nhận được khi học xong bài học (x1.2)",
                    "Tăng xu khi làm daily (x1.2)",
                    "Không giới hạn làm bài test trong một ngày",
                    "Cá nhân hoá người dùng",
                ],
                isActive: true,
            },
        ];

        return { data: mockPackages };
    },

    /**
     * Purchase a subscription package
     */
    purchase: async (data: ISubscriptionPurchaseRequest): Promise<{ data: ISubscriptionPurchaseResponse }> => {
        // Mock API - simulate network latency
        await new Promise(res => setTimeout(res, 1000));

        // Mock response
        const mockResponse: ISubscriptionPurchaseResponse = {
            message: "Mua gói dịch vụ thành công!",
            subscriptionId: Date.now(),
            expiresAt: data.packageType === SubscriptionPackageType.ULTRA_EXPLORER
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month from now
                : null, // lifetime
        };

        return { data: mockResponse };
    },
}

export default subscriptionService;

