# 🍽️ Restaurant Management System (Distributed Database)

Hệ thống quản lý chuỗi nhà hàng sử dụng cơ sở dữ liệu phân tán (Distributed Database), được thiết kế để vận hành đồng bộ dữ liệu giữa các chi nhánh (Branch) và máy chủ trung tâm (Central Server).

## 🏗️ Kiến trúc Hệ thống

Dự án được triển khai theo mô hình phân tán thực tế thông qua mạng ảo **Radmin VPN**:

- **Server Tổng (Central):** Quản lý danh mục dùng chung (Món ăn, Nhà hàng, Chi nhánh) và tổng hợp báo cáo từ toàn hệ thống.
- **Server Nhánh (Branches):** Quản lý các nghiệp vụ phát sinh tại chỗ (Hóa đơn, Nhân viên, Khách hàng) và đồng bộ về Server tổng.

### 🔄 Cơ chế Phân tán (Replication Map)
- **Nhân bản xuống (Global Tables):** `RESTAURANT`, `DISH`, `BRANCH` (Quản lý tại Server Tổng).
- **Nhân bản lên (Branch Tables):** `CUSTOMER`, `EMPLOYEE`, `ORDERS`, `ORDER_DETAILS`, `PAYMENT` (Phát sinh tại Nhánh).

## 🚀 Công nghệ Sử dụng

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4.0
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **State Management:** React Context API

### Backend
- **Framework:** Spring Boot 3.4+
- **Security:** Spring Security (CORS enabled)
- **Database Access:** Spring Data JPA
- **Dynamic Routing:** Multi-DataSource routing dựa trên Site ID.
- **Database:** SQL Server (Transactional Replication)

## 🛠️ Hướng dẫn Cài đặt

### 1. Yêu cầu hệ thống
- Java 17+
- Node.js 18+
- SQL Server 2019+
- Radmin VPN (để kết nối giữa các server)

### 2. Cấu hình Backend
- Di chuyển vào thư mục `/demo`.
- Tạo file `.env` (hoặc cấu hình trong `application.yaml`) với thông tin kết nối SQL Server:
```yaml
spring:
  datasource:
    site1: # Server Tổng
      url: jdbc:sqlserver://26.245.214.131:1433;databaseName=QLNH_PhanTan
    site2: # Nhánh 1
      url: jdbc:sqlserver://26.232.29.72:1433;databaseName=QLNH_PhanTan
```

### 3. Cấu hình Frontend
- Di chuyển vào thư mục `/frontend`.
- Cài đặt dependencies:
```bash
npm install
```
- Chạy ứng dụng:
```bash
npm run dev
```

## ⚙️ Cấu hình Database Replication

Để hệ thống hoạt động ổn định trong môi trường phân tán, cần cấu hình các tham số Skip Errors cho Distribution Agent:

```text
-SkipErrors 20598:2627:8152
```
- **20598:** Row not found (Bỏ qua khi bản ghi bị xóa thủ công).
- **2627:** Primary Key Violation (Tránh xung đột ID khi đồng bộ).
- **8152:** String Truncation (Bỏ qua lỗi độ dài dữ liệu không khớp).

## 📱 Tính năng Chính
- **Dashboard:** Thống kê doanh thu và hoạt động thời gian thực.
- **Order Management:** Form tạo đơn hàng thông minh, tự động tính toán VAT và in hóa đơn.
- **Site Switching:** Khả năng chuyển đổi chi nhánh trực tiếp trên giao diện để quản trị viên theo dõi dữ liệu vùng.
- **Employee & Customer:** Quản lý thông tin định danh riêng biệt theo từng chi nhánh.

---
**Phát triển bởi:** hoang22122005
**Môn học:** Cơ sở dữ liệu phân tán (BTL)
