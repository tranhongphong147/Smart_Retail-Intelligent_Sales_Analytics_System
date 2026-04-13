# Danh sách Giao diện Hệ thống Smart Retail

Tài liệu này liệt kê tất cả các giao diện người dùng (Frontend Pages) và các điểm cuối API (Backend Endpoints) hiện có trong hệ thống.

## 1. Giao diện Người dùng (Frontend)

Hệ thống được xây dựng trên nền tảng React, bao gồm các trang chính sau:

| Trang | Đường dẫn (URL) | Mô tả chức năng |
| :--- | :--- | :--- |
| **Dashboard** | `/` | Tổng quan về tình hình kinh doanh, các chỉ số quan trọng (KPIs) và biểu đồ tóm tắt. |
| **Sales Analytics** | `/sales` | Phân tích chi tiết doanh thu, xu hướng bán hàng và hiệu suất sản phẩm. |
| **Inventory Analysis** | `/inventory` | Quản lý kho hàng, theo dõi biến động tồn kho và cảnh báo rủi ro thiếu hàng. |
| **AI Predictions** | `/ai-predictions` | Dự báo nhu cầu và doanh thu trong tương lai sử dụng các mô hình AI. |
| **Smart Recommendations** | `/recommendations` | Các gợi ý thông minh về việc nhập hàng, chiến lược giá và tối ưu hóa vận hành. |
| **Reports** | `/reports` | Xem và xuất các báo cáo định kỳ về hiệu suất kinh doanh. |
| **Profile** | `/profile` | Quản lý thông tin cá nhân của người dùng. |
| **Settings** | `/settings` | Cấu hình hệ thống, thiết lập thông tin doanh nghiệp, thông báo và bảo mật. |

---

## 2. Giao diện Lập trình (Backend API v1)

Các API được tổ chức theo phiên bản `v1`, hỗ trợ các chức năng xử lý dữ liệu và AI:

### Dữ liệu & Tải lên
- `POST /api/v1/data/upload`: Tải tệp dữ liệu lên hệ thống để xử lý.

### Phân tích (Analytics)
- `GET /api/v1/analytics/revenue`: Lấy dữ liệu phân tích doanh thu.
- `GET /api/v1/analytics/inventory`: Lấy dữ liệu phân tích kho hàng.

### Trí tuệ nhân tạo (AI & ML)
- `GET /api/v1/ai/forecast`: Lấy kết quả dự báo doanh số từ AI.
- `GET /api/v1/ai/recommendations`: Lấy danh sách các đề xuất thông minh.
- `POST /api/v1/chatbot/ask`: Gửi câu hỏi cho trợ lý ảo thông minh.

### Bảng điều khiển (Dashboard)
- `GET /api/v1/dashboard/summary`: Lấy thông tin tóm tắt (số liệu thô) cho Dashboard.
- `GET /api/v1/dashboard/overview`: Lấy dữ liệu biểu đồ tổng quan.

### Báo cáo (Reports)
- `GET /api/v1/reports/overview`: Lấy dữ liệu tổng hợp cho báo cáo.

### Cài đặt (Settings)
- `GET /api/v1/settings/overview`: Lấy cấu hình hiện tại của hệ thống.
- `POST /api/v1/settings/profile`: Cập nhật thông tin cá nhân.
- `POST /api/v1/settings/business`: Cập nhật thông tin doanh nghiệp.
- `POST /api/v1/settings/notifications`: Thay đổi thiết lập thông báo.
- `POST /api/v1/settings/ai`: Cấu hình các tham số cho mô hình AI.
- `POST /api/v1/settings/security`: Cập nhật các thiết lập bảo mật.

### Tìm kiếm
- `GET /api/v1/search/global`: Tìm kiếm nhanh dữ liệu trên toàn hệ thống.
