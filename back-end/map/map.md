# Database Schema - Restaurant Management System (Distributed)

## 1. Tổng quan mô hình triển khai

Hệ thống quản lý nhà hàng được triển khai theo mô hình cơ sở dữ liệu phân tán qua **Radmin VPN**.

- **Server tổng / Server trung tâm:** `HOANG`
- **IP Server tổng:** `26.245.214.131`
- **Database:** `QLNH_PhanTan`
- **Các server nhánh:** `DucAnh`, `Đạt`
- **Ý tưởng chính:**
  - Server tổng quản lý và nhân bản dữ liệu danh mục dùng chung xuống các server nhánh.
  - Các server nhánh quản lý dữ liệu phát sinh tại chi nhánh và nhân bản dữ liệu đó ngược lên server tổng.

## 2. Radmin VPN Map

### 2.1 Server tổng

| Thành phần | Giá trị |
|---|---|
| Tên máy | `HOANG` |
| IP Radmin VPN | `26.245.214.131` |
| Vai trò | Server tổng / Publisher trung tâm / Subscriber nhận dữ liệu nhánh |
| Login name | `BTLQLNH` |
| Password | `123456` |

### 2.2 Server nhánh

| Chi nhánh | Tên máy | IP Radmin VPN | Login replication | Password | Vai trò |
|---|---:|---:|---|---|---|
| Nhánh Đức Anh | `DucAnh` | `26.232.29.72` | `repl_nh01` | `123456` | Nhận dữ liệu chung từ server tổng, gửi dữ liệu nghiệp vụ lên server tổng |
| Nhánh Đạt | `Đạt` | `26.86.33.18` | `repl_nh01` | `123456` | Nhận dữ liệu chung từ server tổng, gửi dữ liệu nghiệp vụ lên server tổng |

> Ghi chú: Các server nhánh cần kết nối được tới server tổng thông qua IP Radmin VPN `26.245.214.131`.

## 3. Fragmentation Strategy (Phân tán)

- **Fragmentation Vector:** `BranchID`
- **Server tổng `HOANG`:** Lưu dữ liệu toàn cục, nhận dữ liệu từ các nhánh, đồng thời phát tán dữ liệu dùng chung xuống các nhánh.
- **Server nhánh `DucAnh`:** Lưu dữ liệu phát sinh tại chi nhánh Đức Anh.
- **Server nhánh `Đạt`:** Lưu dữ liệu phát sinh tại chi nhánh Đạt.
- **Global Tables / Replicated Down:** `RESTAURANT`, `DISH`, `BRANCH`
- **Branch Tables / Replicated Up:** `CUSTOMER`, `EMPLOYEE`, `ORDERS`, `ORDER_DETAILS`, `PAYMENT`

## 4. Replication Direction Map

### 4.1 Dữ liệu nhân bản từ server tổng xuống server nhánh

Server tổng `HOANG` là nơi quản lý dữ liệu danh mục gốc. Các bảng sau được nhân bản từ server tổng xuống các server nhánh `DucAnh` và `Đạt`:

| Bảng | Chiều nhân bản | Lý do |
|---|---|---|
| `RESTAURANT` | `HOANG` → `DucAnh`, `Đạt` | Thông tin chuỗi nhà hàng dùng chung toàn hệ thống |
| `DISH` | `HOANG` → `DucAnh`, `Đạt` | Danh mục món ăn dùng chung cho các chi nhánh |
| `BRANCH` | `HOANG` → `DucAnh`, `Đạt` | Thông tin chi nhánh để các bảng nghiệp vụ có khóa ngoại `BranchID` |

### 4.2 Dữ liệu nhân bản từ server nhánh lên server tổng

Các server nhánh là nơi phát sinh dữ liệu vận hành. Các bảng sau được nhân bản từ từng server nhánh lên server tổng:

| Bảng | Chiều nhân bản | Lý do |
|---|---|---|
| `CUSTOMER` | `DucAnh`, `Đạt` → `HOANG` | Khách hàng phát sinh tại nhánh, server tổng tổng hợp dữ liệu toàn hệ thống |
| `EMPLOYEE` | `DucAnh`, `Đạt` → `HOANG` | Nhân viên thuộc từng chi nhánh |
| `ORDERS` | `DucAnh`, `Đạt` → `HOANG` | Hóa đơn phát sinh tại chi nhánh |
| `ORDER_DETAILS` | `DucAnh`, `Đạt` → `HOANG` | Chi tiết món ăn trong hóa đơn |
| `PAYMENT` | `DucAnh`, `Đạt` → `HOANG` | Thanh toán tương ứng với hóa đơn |

## 5. Database Schema

## Tables

### 1. RESTAURANT

Lưu trữ thông tin chuỗi nhà hàng. Bảng này được quản lý tại server tổng và nhân bản xuống các server nhánh.

- `RestaurantID` (`CHAR(10)`, PK)
- `RestaurantName` (`NVARCHAR(100)`)
- `Type` (`NVARCHAR(50)`)
- `Brand` (`NVARCHAR(100)`)
- `TaxCode` (`INT`)

### 2. BRANCH

Thông tin chi nhánh. Bảng này được quản lý tại server tổng và nhân bản xuống các server nhánh để phục vụ khóa ngoại cho các bảng nghiệp vụ.

- `BranchID` (`CHAR(10)`, PK)
- `BranchName` (`NVARCHAR(100)`)
- `Address` (`NVARCHAR(200)`)
- `City` (`NVARCHAR(50)`)
- `Region` (`NVARCHAR(20)`)
- `PhoneNumber` (`VARCHAR(15)`)
- `Email` (`VARCHAR(100)`)
- `EstablishedDate` (`DATE`)
- `Status` (`NVARCHAR(20)`)
- `RestaurantID` (`CHAR(10)`, FK -> `RESTAURANT`)

### 3. EMPLOYEE

Nhân viên làm việc tại chi nhánh. Dữ liệu phát sinh tại server nhánh và nhân bản lên server tổng.

- `EmployeeID` (`CHAR(20)`, PK)
- `FullName` (`NVARCHAR(100)`)
- `Gender` (`NVARCHAR(10)`)
- `DateOfBirth` (`DATE`)
- `Position` (`NVARCHAR(50)`)
- `Salary` (`DECIMAL(18,2)`)
- `HireDate` (`DATE`)
- `Status` (`NVARCHAR(20)`)
- `BranchID` (`CHAR(10)`, FK -> `BRANCH`)

### 4. CUSTOMER

Khách hàng phát sinh tại các chi nhánh. Dữ liệu từ các server nhánh được nhân bản lên server tổng để tổng hợp toàn hệ thống.

- `CustomerID` (`CHAR(20)`, PK)
- `FullName` (`NVARCHAR(100)`)
- `PhoneNumber` (`VARCHAR(15)`)
- `Email` (`VARCHAR(100)`)
- `CustomerType` (`NVARCHAR(20)`)
- `BranchID` (`CHAR(10)`, FK -> `BRANCH`)

### 5. DISH

Danh mục món ăn. Bảng này được quản lý tại server tổng và nhân bản xuống các server nhánh.

- `DishID` (`CHAR(10)`, PK)
- `DishName` (`NVARCHAR(100)`)
- `Price` (`DECIMAL(18,2)`)
- `Category` (`NVARCHAR(50)`)
- `Description` (`NVARCHAR(200)`)
- `Status` (`NVARCHAR(20)`)

### 6. ORDERS

Hóa đơn tại chi nhánh. Dữ liệu phát sinh tại server nhánh và nhân bản lên server tổng.

- `OrderID` (`CHAR(20)`, PK)
- `OrderTime` (`DATETIME`)
- `TotalAmount` (`DECIMAL(18,2)`)
- `Status` (`NVARCHAR(30)`)
- `EmployeeID` (`CHAR(20)`, FK -> `EMPLOYEE`)
- `CustomerID` (`CHAR(20)`, FK -> `CUSTOMER`)
- `VAT` (`DECIMAL(5,2)`)

> Theo ERD hiện tại, bảng `ORDERS` không có cột `BranchID`. Có thể xác định chi nhánh của hóa đơn thông qua `EmployeeID` hoặc `CustomerID`. Nếu muốn phân mảnh trực tiếp theo `BranchID`, nên bổ sung cột `BranchID` vào bảng `ORDERS`.

### 7. ORDER_DETAILS

Chi tiết món ăn trong hóa đơn. Dữ liệu phát sinh tại server nhánh và nhân bản lên server tổng.

- `OrderDetailID` (`CHAR(20)`, PK)
- `OrderID` (`CHAR(20)`, FK -> `ORDERS`)
- `DishID` (`CHAR(10)`, FK -> `DISH`)
- `Quantity` (`INT`)
- `UnitPrice` (`DECIMAL(18,2)`)

### 8. PAYMENT

Thông tin thanh toán. Dữ liệu phát sinh tại server nhánh và nhân bản lên server tổng.

- `PaymentID` (`CHAR(20)`, PK)
- `Method` (`NVARCHAR(50)`)
- `Amount` (`DECIMAL(18,2)`)
- `PaymentTime` (`DATETIME`)
- `Status` (`NVARCHAR(20)`)
- `OrderID` (`CHAR(20)`, FK -> `ORDERS`)

## 6. Relationships

- **Restaurant -> Branch**: 1-n
- **Branch -> Employee**: 1-n
- **Branch -> Customer**: 1-n
- **Employee -> Orders**: 1-n
- **Customer -> Orders**: 1-n
- **Orders -> OrderDetails**: 1-n
- **Dish -> OrderDetails**: 1-n
- **Orders -> Payment**: 1-1

## 7. BranchID Mapping

| Server nhánh | BranchID gợi ý | Mô tả |
|---|---|---|
| `DucAnh` | `NH01` | Dữ liệu của chi nhánh Đức Anh |
| `Đạt` | `NH02` | Dữ liệu của chi nhánh Đạt |

> Nên dùng tiền tố mã trong khóa chính để tránh trùng dữ liệu khi đồng bộ lên server tổng. Ví dụ: `NH01_C001`, `NH02_C001`, `NH01_O001`, `NH02_O001`.

## 8. Logical Replication Design

```text
                   SERVER TỔNG: HOANG
                  IP: 26.245.214.131
                  DB: QLNH_PhanTan
                         |
        -------------------------------------
        |                                   |
        v                                   v
 SERVER NHÁNH: DucAnh                 SERVER NHÁNH: Đạt
 IP: 26.232.29.72                     IP: 26.86.33.18
 BranchID: NH01                       BranchID: NH02
```

### 8.1 Chiều từ server tổng xuống nhánh

```text
HOANG.RESTAURANT  --->  DucAnh.RESTAURANT
HOANG.RESTAURANT  --->  Đạt.RESTAURANT

HOANG.DISH        --->  DucAnh.DISH
HOANG.DISH        --->  Đạt.DISH

HOANG.BRANCH      --->  DucAnh.BRANCH
HOANG.BRANCH      --->  Đạt.BRANCH
```

### 8.2 Chiều từ nhánh lên server tổng

```text
DucAnh.CUSTOMER       --->  HOANG.CUSTOMER
DucAnh.EMPLOYEE       --->  HOANG.EMPLOYEE
DucAnh.ORDERS         --->  HOANG.ORDERS
DucAnh.ORDER_DETAILS  --->  HOANG.ORDER_DETAILS
DucAnh.PAYMENT        --->  HOANG.PAYMENT

Đạt.CUSTOMER          --->  HOANG.CUSTOMER
Đạt.EMPLOYEE          --->  HOANG.EMPLOYEE
Đạt.ORDERS            --->  HOANG.ORDERS
Đạt.ORDER_DETAILS     --->  HOANG.ORDER_DETAILS
Đạt.PAYMENT           --->  HOANG.PAYMENT
```

## 9. Replication Type Recommendation

### 9.1 Server tổng xuống server nhánh

Nên dùng **Snapshot Replication** hoặc **Transactional Replication** cho các bảng danh mục:

- `RESTAURANT`
- `DISH`
- `BRANCH`

Lý do:

- Dữ liệu danh mục ít thay đổi.
- Server tổng là nơi chỉnh sửa chính.
- Server nhánh chỉ cần nhận bản sao để tra cứu và nhập liệu.

### 9.2 Server nhánh lên server tổng

Nên dùng **Transactional Replication** cho các bảng nghiệp vụ:

- `CUSTOMER`
- `EMPLOYEE`
- `ORDERS`
- `ORDER_DETAILS`
- `PAYMENT`

Lý do:

- Dữ liệu phát sinh liên tục tại chi nhánh.
- Server tổng cần cập nhật dữ liệu gần thời gian thực.
- Mỗi nhánh quản lý một vùng dữ liệu riêng theo `BranchID`, hạn chế xung đột.

## 10. Synchronization Order

Khi khởi tạo dữ liệu hoặc cấu hình replication, nên đồng bộ theo thứ tự khóa ngoại:

1. `RESTAURANT`
2. `BRANCH`
3. `DISH`
4. `CUSTOMER`
5. `EMPLOYEE`
6. `ORDERS`
7. `ORDER_DETAILS`
8. `PAYMENT`

## 11. Deployment Checklist

### 11.1 Chuẩn bị mạng

- Kiểm tra các máy đã online trong Radmin VPN.
- Ping từ server nhánh tới server tổng:

```bash
ping 26.245.214.131
```

- Kiểm tra SQL Server cho phép kết nối TCP/IP.
- Mở firewall cho SQL Server port, thường là `1433` nếu dùng default port.

### 11.2 Chuẩn bị SQL Server

- Tạo database `QLNH_PhanTan` trên tất cả server.
- Tạo cùng cấu trúc bảng trên server tổng và các server nhánh.
- Tạo login theo thông tin đã định nghĩa:
  - Server tổng: `BTLQLNH / 123456`
  - Server nhánh Đức Anh: `repl_nh01 / 123456`
  - Server nhánh Đạt: `repl_nh01 / 123456`
- Cấp quyền cần thiết cho tài khoản replication.

### 11.3 Chuẩn bị dữ liệu phân tán

- Server tổng nhập dữ liệu gốc cho:
  - `RESTAURANT`
  - `DISH`
  - `BRANCH`
- Server nhánh Đức Anh chỉ nhập dữ liệu có `BranchID = NH01`.
- Server nhánh Đạt chỉ nhập dữ liệu có `BranchID = NH02`.

### 11.4 Kiểm tra sau đồng bộ

- Tại server nhánh, kiểm tra đã nhận được bảng:
  - `RESTAURANT`
  - `DISH`
  - `BRANCH`
- Tại server tổng, kiểm tra đã nhận được dữ liệu từ nhánh:
  - `CUSTOMER`
  - `EMPLOYEE`
  - `ORDERS`
  - `ORDER_DETAILS`
  - `PAYMENT`
- Kiểm tra không bị trùng khóa chính giữa các nhánh.
- Kiểm tra toàn vẹn khóa ngoại.

## 12. Notes

- Không nên để hai server nhánh cùng tạo một mã khóa chính giống nhau.
- Nên thêm tiền tố chi nhánh vào các khóa chính phát sinh tại nhánh.
- Nếu sử dụng `BranchID` làm vector phân tán chính, các bảng nghiệp vụ nên có hoặc truy xuất được `BranchID` rõ ràng.
- Với ERD hiện tại, `CUSTOMER` có `BranchID`, `EMPLOYEE` có `BranchID`; `ORDERS` có thể suy ra chi nhánh qua `EmployeeID` hoặc `CustomerID`.
- Nếu muốn thiết kế phân tán rõ hơn, nên bổ sung trực tiếp `BranchID` vào bảng `ORDERS`.
